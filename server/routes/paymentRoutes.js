import { Router } from 'express';
import {
  getPaymentConfig,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from '../controllers/paymentController.js';

const router = Router();

// GET /api/payment/config - Check if Razorpay keys are configured and fetch key_id
router.get('/config', getPaymentConfig);

// POST /api/payment/razorpay/create-order - Create Razorpay order
router.post('/razorpay/create-order', createRazorpayOrder);

// POST /api/payment/razorpay/verify - Cryptographically verify payment signature & store order
router.post('/razorpay/verify', verifyRazorpayPayment);

export default router;
