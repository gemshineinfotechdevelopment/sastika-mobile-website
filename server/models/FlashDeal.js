import mongoose from 'mongoose';

const flashDealItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    brand: { type: String, default: 'Sastika' },
    category: { type: String, default: 'phone' },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    color: { type: String, default: '#2f7d6d' },
    image: { type: String, default: '' },
    badge: { type: String, default: 'Festival Deal' },
    stock: { type: Number, default: 20 },
    claimedPct: { type: Number, default: 65 },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const flashDealSchema = new mongoose.Schema(
  {
    dealId: { type: String, default: 'main_flash_deal', unique: true },
    isActive: { type: Boolean, default: true },
    title: { type: String, default: 'Flash Deal Drop' },
    subtitle: { type: String, default: 'LIMITED STOCK LEFT' },
    festivalName: { type: String, default: 'Festival Mega Drop' },
    endTime: { type: String, default: '' },
    items: [flashDealItemSchema],
  },
  { timestamps: true }
);

export const FlashDeal = mongoose.models.FlashDeal || mongoose.model('FlashDeal', flashDealSchema);
