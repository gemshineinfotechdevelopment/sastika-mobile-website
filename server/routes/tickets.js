import { Router } from 'express';
import { readData, writeData } from '../dataHelper.js';

const router = Router();
const FILE = 'tickets.json';

// GET all service tickets
router.get('/', (req, res) => {
  const tickets = readData(FILE);
  res.json(tickets);
});

// GET single ticket
router.get('/:id', (req, res) => {
  const tickets = readData(FILE);
  const ticket = tickets.find((t) => t.id === req.params.id);
  if (!ticket) {
    return res.status(404).json({ error: 'Service ticket not found' });
  }
  res.json(ticket);
});

// POST new service ticket
router.post('/', (req, res) => {
  const { customer, phone, device, issue, cost } = req.body;
  if (!customer || !phone || !device) {
    return res.status(400).json({ error: 'Customer, phone, and device details are required' });
  }

  const tickets = readData(FILE);
  const id = 'SR-' + String(5522 + tickets.length);
  const newTicket = {
    id,
    customer,
    phone,
    device,
    issue: issue || 'General Diagnostic & Repair',
    status: 'Open',
    tech: 'Unassigned',
    eta: 'Within 24h',
    cost: Number(cost) || 0,
  };

  tickets.unshift(newTicket);
  writeData(FILE, tickets);

  res.status(201).json(newTicket);
});

// PATCH / PUT update ticket status
router.patch('/:id', (req, res) => {
  const tickets = readData(FILE);
  const index = tickets.findIndex((t) => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  tickets[index] = { ...tickets[index], ...req.body };
  writeData(FILE, tickets);
  res.json(tickets[index]);
});

export default router;
