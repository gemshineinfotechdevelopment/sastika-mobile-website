import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    customer: { type: String, required: true },
    phone: { type: String, required: true },
    device: { type: String, required: true },
    issue: { type: String, required: true },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Ready', 'Closed'],
      default: 'Open',
    },
    tech: { type: String, default: 'Unassigned' },
    eta: { type: String, default: 'Within 24h' },
    cost: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);
