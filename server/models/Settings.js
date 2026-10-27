import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'global_settings', unique: true },
    business: { type: String, default: 'Sastika Mobiles' },
    gstin: { type: String, default: '33BQTPJ5275L1Z6' },
    email: { type: String, default: 'sastikamobiles.svk@gmail.com' },
    phone: { type: String, default: '+91 98765 43210' },
    address: {
      type: String,
      default: 'Sri Renga Complex, Near Kennedy Medicals, Sithurajapuram, Sivakasi - 626189',
    },
    currency: { type: String, default: 'INR (₹)' },
    gstOn: { type: Boolean, default: true },
    lowStockAlerts: { type: Boolean, default: true },
    autoInvoice: { type: Boolean, default: true },
    smsUpdates: { type: Boolean, default: true },
    codOn: { type: Boolean, default: true },
    codFee: { type: Number, default: 50 },
    upiOn: { type: Boolean, default: true },
    freeShipAbove: { type: String, default: '0' },
  },
  { timestamps: true }
);

export const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);
