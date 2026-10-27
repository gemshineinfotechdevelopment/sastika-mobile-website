import { Settings } from '../models/Settings.js';
import { getDbStatus } from '../config/db.js';

const DEFAULT_SETTINGS = {
  business: 'Sastika Mobiles',
  gstin: '33BQTPJ5275L1Z6',
  email: 'sastikamobiles.svk@gmail.com',
  phone: '+91 98765 43210',
  address: 'Sri Renga Complex, Near Kennedy Medicals, Sithurajapuram, Sivakasi - 626189',
  currency: 'INR (₹)',
  gstOn: true,
  lowStockAlerts: true,
  autoInvoice: true,
  smsUpdates: true,
  codOn: true,
  codFee: 50,
  upiOn: true,
  freeShipAbove: '0',
};

let memorySettings = { ...DEFAULT_SETTINGS };

/**
 * GET /api/settings
 * Fetch global store settings (including codFee, codOn, business profile)
 */
export const getSettings = async (req, res) => {
  try {
    if (getDbStatus()) {
      let doc = await Settings.findOne({ key: 'global_settings' });
      if (!doc) {
        doc = await Settings.create({ key: 'global_settings', ...DEFAULT_SETTINGS });
      }
      return res.json({ success: true, data: doc });
    }
    return res.json({ success: true, data: memorySettings });
  } catch (err) {
    console.error('[GET_SETTINGS_ERROR]', err);
    return res.json({ success: true, data: memorySettings });
  }
};

/**
 * PUT /api/settings
 * Update global store settings from Admin Settings page
 */
export const updateSettings = async (req, res) => {
  try {
    const patch = req.body;
    if (patch.codFee !== undefined) {
      patch.codFee = Math.max(0, Number(patch.codFee) || 0);
    }

    if (getDbStatus()) {
      const updated = await Settings.findOneAndUpdate(
        { key: 'global_settings' },
        { $set: patch },
        { new: true, upsert: true }
      );
      return res.json({ success: true, data: updated, message: 'Settings saved successfully' });
    }

    memorySettings = { ...memorySettings, ...patch };
    return res.json({ success: true, data: memorySettings, message: 'Settings saved successfully' });
  } catch (err) {
    console.error('[UPDATE_SETTINGS_ERROR]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
