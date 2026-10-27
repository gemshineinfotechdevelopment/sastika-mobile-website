import { Ticket } from '../models/Ticket.js';
import { SEED_TICKETS } from '../data/seedData.js';
import { getDbStatus } from '../config/db.js';

let memoryTickets = [...SEED_TICKETS];

export const getTickets = async (req, res) => {
  try {
    if (getDbStatus()) {
      let tickets = await Ticket.find({}).sort({ createdAt: -1 });
      if (tickets.length === 0) {
        await Ticket.insertMany(SEED_TICKETS);
        tickets = await Ticket.find({}).sort({ createdAt: -1 });
      }
      return res.json({ success: true, count: tickets.length, data: tickets });
    }
    return res.json({ success: true, count: memoryTickets.length, data: memoryTickets });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    if (getDbStatus()) {
      const ticket = await Ticket.findOne({ id });
      if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
      return res.json({ success: true, data: ticket });
    }
    const ticket = memoryTickets.find((t) => t.id === id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    return res.json({ success: true, data: ticket });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createTicket = async (req, res) => {
  try {
    const { customer, phone, device, issue, cost, id, userId } = req.body;
    if (!customer || !phone || !device || !issue) {
      return res.status(400).json({ success: false, message: 'Customer, phone, device and issue are required' });
    }

    const count = getDbStatus() ? await Ticket.countDocuments() : memoryTickets.length;
    const ticketId = id || ('SR-' + (5522 + count));

    const newTicket = {
      id: ticketId,
      userId: userId || undefined,
      customer,
      phone,
      device,
      issue,
      status: 'Open',
      tech: 'Unassigned',
      eta: 'Within 24h',
      cost: Number(cost) || 0,
    };

    if (getDbStatus()) {
      const created = await Ticket.create(newTicket);
      return res.status(201).json({ success: true, data: created });
    }

    memoryTickets.unshift(newTicket);
    return res.status(201).json({ success: true, data: newTicket });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, tech, eta, cost } = req.body;

    const patch = {};
    if (status) patch.status = status;
    if (tech) patch.tech = tech;
    if (eta) patch.eta = eta;
    if (cost !== undefined) patch.cost = Number(cost);

    if (getDbStatus()) {
      const updated = await Ticket.findOneAndUpdate({ id }, patch, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: 'Ticket not found' });
      return res.json({ success: true, data: updated });
    }

    const idx = memoryTickets.findIndex((t) => t.id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Ticket not found' });
    memoryTickets[idx] = { ...memoryTickets[idx], ...patch };
    return res.json({ success: true, data: memoryTickets[idx] });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    if (getDbStatus()) {
      await Ticket.findOneAndDelete({ id });
      return res.json({ success: true, message: 'Ticket deleted successfully' });
    }
    memoryTickets = memoryTickets.filter((t) => t.id !== id);
    return res.json({ success: true, message: 'Ticket deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
