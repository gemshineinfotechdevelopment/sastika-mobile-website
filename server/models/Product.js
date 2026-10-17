import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, enum: ['phone', 'accessory', 'audio'], required: true },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    rating: { type: Number, default: 4.5 },
    reviews: { type: Number, default: 0 },
    color: { type: String, default: '#333333' },
    badge: { type: String },
    specs: [{ type: String }],
    stock: { type: Number, default: 0 },
    reorderAt: { type: Number, default: 5 },
    sku: { type: String, required: true },
    description: { type: String, default: '' },
    storage: [{ type: String }],
    image: { type: String },
  },
  { timestamps: true }
);

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
