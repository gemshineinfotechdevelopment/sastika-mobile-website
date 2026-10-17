import { Router } from 'express';
import {
  getFlashDeal,
  updateFlashDeal,
  addDealItem,
  removeDealItem,
} from '../controllers/flashDealController.js';

const router = Router();

router.get('/', getFlashDeal);
router.put('/', updateFlashDeal);
router.post('/items', addDealItem);
router.delete('/items/:id', removeDealItem);

export default router;
