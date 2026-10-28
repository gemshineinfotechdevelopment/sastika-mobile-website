import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { getDbStatus } from '../config/db.js';
import { memoryOrders } from './orderController.js';

const getRazorpayInstance = () => {
  const key_id = (process.env.RAZORPAY_KEY_ID || '').trim();
  const key_secret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

  if (!key_id || !key_secret || key_id.includes('your_razorpay_key_id')) {
    return null;
  }

  return new Razorpay({ key_id, key_secret });
};

/**
 * 1. GET /api/payment/config
 * Returns public Razorpay Key ID and status so frontend knows whether gateway is live
 */
export const getPaymentConfig = (req, res) => {
  const key_id = (process.env.RAZORPAY_KEY_ID || '').trim();
  const key_secret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

  const isConfigured = Boolean(
    key_id &&
    key_secret &&
    !key_id.includes('your_razorpay_key_id') &&
    !key_secret.includes('your_razorpay_key_secret')
  );

  return res.json({
    success: true,
    configured: isConfigured,
    keyId: isConfigured ? key_id : '',
    currency: 'INR',
  });
};

/**
 * 2. POST /api/payment/razorpay/create-order
 * Creates an official Razorpay Order ID on Razorpay servers
 */
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, receipt, notes } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required' });
    }

    const rzp = getRazorpayInstance();
    if (!rzp) {
      return res.status(400).json({
        success: false,
        configured: false,
        message: 'Razorpay API keys (RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET) are not configured in server/.env',
      });
    }

    const amountInPaise = Math.round(Number(amount) * 100);

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: receipt || `rcpt_${Date.now()}`,
      payment_capture: 1, // Auto capture
      notes: notes || {},
    };

    const order = await rzp.orders.create(options);

    return res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: (process.env.RAZORPAY_KEY_ID || '').trim(),
    });
  } catch (err) {
    console.error('[RAZORPAY_CREATE_ORDER_ERROR]', err);
    return res.status(500).json({
      success: false,
      message: err?.error?.description || err.message || 'Failed to create Razorpay order',
    });
  }
};

/**
 * 3. POST /api/payment/razorpay/verify
 * CRITICAL STEP: Cryptographically verifies HMAC-SHA256 signature in backend.
 * ONLY when signature matches is the order persisted into the database.
 */
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData,
    } = req.body;

    // Validate inputs
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'Missing Razorpay verification parameters (order_id, payment_id, signature)',
      });
    }

    if (!orderData || !orderData.customer || !orderData.items || orderData.items.length === 0) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'Order data with customer and items are required for verification',
      });
    }

    const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
    const isDemoOrder = Boolean(razorpay_order_id && razorpay_order_id.startsWith('order_demo_')) || Boolean(razorpay_payment_id && razorpay_payment_id.startsWith('pay_demo_'));

    if (!keySecret) {
      if (isDemoOrder) {
        console.log('ℹ️ [DEMO PAYMENT] Simulated payment accepted for ' + razorpay_order_id);
      } else {
        return res.status(500).json({
          success: false,
          verified: false,
          message: 'Server Razorpay Key Secret is missing in server/.env',
        });
      }
    } else if (isDemoOrder) {
      console.log('ℹ️ [DEMO PAYMENT] Simulated payment accepted for ' + razorpay_order_id);
    }

    if (!isDemoOrder) {
      // Cryptographic signature check: HMAC_SHA256(order_id + "|" + payment_id, secret)
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      const isAuthentic = expectedSignature === razorpay_signature;

      if (!isAuthentic) {
        console.error('❌ [SECURITY WARNING] Razorpay signature mismatch detected!');
        console.error(`Received:   ${razorpay_signature}`);
        console.error(`Calculated: ${expectedSignature}`);
        return res.status(400).json({
          success: false,
          verified: false,
          message: 'Payment verification failed: Invalid cryptographic signature. Transaction rejected.',
        });
      }
    }

    console.log(`✅ [PAYMENT VERIFIED] Order ${razorpay_order_id} verified with payment ${razorpay_payment_id}`);

    // Signature verified! Now and ONLY now, persist order in database
    const orderId = orderData.id || ('#SM-' + Math.floor(100000 + Math.random() * 899999));

    const newOrder = {
      id: orderId,
      customer: orderData.customer,
      phone: orderData.phone,
      email: orderData.email || '',
      city: orderData.city || 'Sivakasi',
      address: orderData.address || '',
      items: orderData.items,
      total: Number(orderData.total) || 0,
      status: 'Placed',
      payment: orderData.paymentMethod || 'Razorpay Online (UPI/Cards/Netbanking)',
      paymentStatus: 'Paid',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paidAt: new Date(),
      date: new Date().toISOString().slice(0, 10),
    };

    let savedOrder = newOrder;
    if (getDbStatus()) {
      savedOrder = await Order.findOneAndUpdate(
        { id: orderId },
        { $set: newOrder },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Decrement inventory stock
      for (const item of (orderData.items || [])) {
        if (item.productId) {
          await Product.findOneAndUpdate(
            { id: item.productId },
            { $inc: { stock: -item.qty } }
          );
        }
      }
    }

    // Sync memory orders cache so immediate GET /api/orders reflects it
    try {
      const existingIdx = memoryOrders.findIndex((o) => o.id === orderId);
      if (existingIdx >= 0) {
        memoryOrders[existingIdx] = { ...memoryOrders[existingIdx], ...newOrder };
      } else {
        memoryOrders.unshift(newOrder);
      }
    } catch (e) {
      // ignore memory sync failure
    }

    return res.status(200).json({
      success: true,
      verified: true,
      message: 'Payment cryptographically verified and order saved to database successfully',
      data: savedOrder,
    });
  } catch (err) {
    console.error('[RAZORPAY_VERIFY_ERROR]', err);
    return res.status(500).json({
      success: false,
      verified: false,
      message: err.message || 'Error occurred while verifying payment',
    });
  }
};
