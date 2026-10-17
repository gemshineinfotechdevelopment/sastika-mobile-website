import { Router } from 'express';
import productRoutes from './productRoutes.js';
import orderRoutes from './orderRoutes.js';
import ticketRoutes from './ticketRoutes.js';
import authRoutes from './authRoutes.js';
import flashDealRoutes from './flashDealRoutes.js';
import { getDbStatus } from '../config/db.js';

const router = Router();

// Health & System Info
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Sastika Mobiles API Server',
    database: getDbStatus() ? 'Connected (MongoDB)' : 'In-Memory / Fallback Mode',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/tickets', ticketRoutes);
router.use('/auth', authRoutes);
router.use('/flash-deals', flashDealRoutes);

export default router;
