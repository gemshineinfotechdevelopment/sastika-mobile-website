import { Router } from 'express';
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
} from '../controllers/orderController.js';

const router = Router();

router.get('/', getOrders);
router.get('/:id', getOrderById);
router.post('/', createOrder);
router.patch('/:id', updateOrderStatus);
router.put('/:id', updateOrderStatus);
router.patch('/:id/status', updateOrderStatus);
router.put('/:id/status', updateOrderStatus);

export default router;
