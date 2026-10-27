import { Router } from 'express';
import {
  getTickets,
  getTicketById,
  createTicket,
  updateTicketStatus,
  deleteTicket,
} from '../controllers/ticketController.js';

const router = Router();

router.get('/', getTickets);
router.get('/:id', getTicketById);
router.post('/', createTicket);
router.patch('/:id', updateTicketStatus);
router.put('/:id', updateTicketStatus);
router.delete('/:id', deleteTicket);

export default router;
