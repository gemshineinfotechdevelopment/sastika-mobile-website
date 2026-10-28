import { FlashDeal } from '../models/FlashDeal.js';
import { getDbStatus } from '../config/db.js';

const DEFAULT_FLASH_DEAL = {
  dealId: 'main_flash_deal',
  isActive: false,
  title: 'Flash Deal Drop',
  subtitle: 'LIMITED STOCK LEFT',
  festivalName: 'Festival Mega Drop',
  endTime: '',
  items: [],
};

let memoryFlashDeal = { ...DEFAULT_FLASH_DEAL };

export const getFlashDeal = async (req, res) => {
  try {
    if (getDbStatus()) {
      let deal = await FlashDeal.findOne({ dealId: 'main_flash_deal' });
      if (!deal) {
        deal = await FlashDeal.create(DEFAULT_FLASH_DEAL);
      }
      return res.json({ success: true, data: deal });
    }
    return res.json({ success: true, data: memoryFlashDeal });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateFlashDeal = async (req, res) => {
  try {
    const patch = req.body;
    if (getDbStatus()) {
      const updated = await FlashDeal.findOneAndUpdate(
        { dealId: 'main_flash_deal' },
        { ...patch, dealId: 'main_flash_deal' },
        { new: true, upsert: true }
      );
      return res.json({ success: true, data: updated });
    }
    memoryFlashDeal = { ...memoryFlashDeal, ...patch };
    return res.json({ success: true, data: memoryFlashDeal });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const addDealItem = async (req, res) => {
  try {
    const item = req.body;
    if (!item.name || !item.price) {
      return res.status(400).json({ success: false, message: 'Item name and price are required' });
    }
    const newItem = {
      ...item,
      id: item.id || 'fd_' + Date.now().toString(36),
      claimedPct: item.claimedPct || 50,
      stock: item.stock || 10,
    };

    if (getDbStatus()) {
      let deal = await FlashDeal.findOne({ dealId: 'main_flash_deal' });
      if (!deal) {
        deal = await FlashDeal.create({ ...DEFAULT_FLASH_DEAL, items: [newItem] });
      } else {
        deal.items.unshift(newItem);
        await deal.save();
      }
      return res.status(201).json({ success: true, data: deal });
    }

    memoryFlashDeal.items = [newItem, ...(memoryFlashDeal.items || [])];
    return res.status(201).json({ success: true, data: memoryFlashDeal });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const removeDealItem = async (req, res) => {
  try {
    const { id } = req.params;
    if (getDbStatus()) {
      const deal = await FlashDeal.findOne({ dealId: 'main_flash_deal' });
      if (deal) {
        deal.items = deal.items.filter((it) => it.id !== id);
        await deal.save();
        return res.json({ success: true, data: deal });
      }
    }
    memoryFlashDeal.items = (memoryFlashDeal.items || []).filter((it) => it.id !== id);
    return res.json({ success: true, data: memoryFlashDeal });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
