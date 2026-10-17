import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { SEED_ORDERS } from '../data/seedData.js';
import { getDbStatus } from '../config/db.js';

let memoryOrders = [...SEED_ORDERS];

export const getOrders = async (req, res) => {
  try {
    if (getDbStatus()) {
      let orders = await Order.find({}).sort({ createdAt: -1 });
      if (orders.length === 0) {
        await Order.insertMany(SEED_ORDERS);
        orders = await Order.find({}).sort({ createdAt: -1 });
      }
      return res.json({ success: true, count: orders.length, data: orders });
    }
    return res.json({ success: true, count: memoryOrders.length, data: memoryOrders });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    if (getDbStatus()) {
      const order = await Order.findOne({ id });
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      return res.json({ success: true, data: order });
    }
    const order = memoryOrders.find((o) => o.id === id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    return res.json({ success: true, data: order });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { customer, phone, city, address, items, total, payment } = req.body;
    if (!customer || !phone || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Customer details and items are required' });
    }

    const orderId = '#SM-' + Math.floor(100000 + Math.random() * 899999);
    const newOrder = {
      id: orderId,
      customer,
      phone,
      city: city || 'Chennai',
      address: address || '',
      items,
      total: Number(total) || 0,
      status: 'Placed',
      payment: payment || 'COD',
      date: new Date().toISOString().slice(0, 10),
    };

    if (getDbStatus()) {
      const created = await Order.create(newOrder);
      // Decrement stock in DB
      for (const item of items) {
        await Product.findOneAndUpdate(
          { id: item.productId },
          { $inc: { stock: -item.qty } }
        );
      }
      return res.status(201).json({ success: true, data: created });
    }

    memoryOrders.unshift(newOrder);
    return res.status(201).json({ success: true, data: newOrder });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Placed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status' });
    }

    if (getDbStatus()) {
      const updated = await Order.findOneAndUpdate({ id }, { status }, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: 'Order not found' });
      return res.json({ success: true, data: updated });
    }

    const idx = memoryOrders.findIndex((o) => o.id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Order not found' });
    memoryOrders[idx] = { ...memoryOrders[idx], status };
    return res.json({ success: true, data: memoryOrders[idx] });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
