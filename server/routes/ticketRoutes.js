import { Router } from 'express';
import {
  getTickets,
  getTicketById,
  createTicket,
  updateTicketStatus,
} from '../controllers/ticketController.js';

const router = Router();

router.get('/', getTickets);
router.get('/:id', getTicketById);
router.post('/', createTicket);
router.put('/:id', updateTicketStatus);

export default router;
