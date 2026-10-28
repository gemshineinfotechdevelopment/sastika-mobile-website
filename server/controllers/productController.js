import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { getDbStatus } from '../config/db.js';

// In-memory fallback storage
export let memoryProducts = [];

export const getProducts = async (req, res) => {
  try {
    const { category, brand, search } = req.query;

    if (getDbStatus()) {
      const query = {};
      if (category) {
        if (category === 'home-appliances' || category === 'appliance' || category === 'home appliances') {
          query.category = { $in: ['home-appliances', 'home appliances', 'appliance'] };
        } else if (category === 'smartphones' || category === 'phone') {
          query.category = { $in: ['smartphones', 'phone'] };
          query.brand = { $not: /Apple/i };
        } else if (category === 'accessories' || category === 'accessory' || category === 'audio') {
          query.category = { $in: ['accessories', 'accessory', 'audio'] };
        } else if (category === 'iphones') {
          query.$or = [{ category: 'iphones' }, { brand: new RegExp('Apple', 'i') }];
        } else {
          query.category = category;
        }
      }
      if (brand) query.brand = new RegExp(brand, 'i');
      if (search) {
        query.$or = [
          { name: new RegExp(search, 'i') },
          { description: new RegExp(search, 'i') },
          { brand: new RegExp(search, 'i') },
        ];
      }
      let products = await Product.find(query).sort({ createdAt: -1 });
      // No automatic re-seeding: only show products explicitly saved in database
      return res.json({ success: true, count: products.length, data: products });
    }

    // Memory fallback
    let list = [...memoryProducts];
    if (category) {
      if (category === 'home-appliances' || category === 'appliance' || category === 'home appliances') {
        list = list.filter((p) => p.category === 'home-appliances' || p.category === 'home appliances' || p.category === 'appliance');
      } else if (category === 'smartphones' || category === 'phone') {
        list = list.filter((p) => (p.category === 'smartphones' || p.category === 'phone') && p.brand?.toLowerCase() !== 'apple');
      } else if (category === 'accessories' || category === 'accessory' || category === 'audio') {
        list = list.filter((p) => p.category === 'accessories' || p.category === 'accessory' || p.category === 'audio');
      } else if (category === 'iphones') {
        list = list.filter((p) => p.category === 'iphones' || p.brand?.toLowerCase() === 'apple');
      } else {
        list = list.filter((p) => p.category === category);
      }
    }
    if (brand) list = list.filter((p) => p.brand.toLowerCase() === brand.toLowerCase());
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    return res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (getDbStatus()) {
      const filter = mongoose.isValidObjectId(id) ? { $or: [{ id }, { _id: id }] } : { id };
      const product = await Product.findOne(filter);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.json({ success: true, data: product });
    }

    const product = memoryProducts.find((p) => p.id === id || p._id === id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    return res.json({ success: true, data: product });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const body = req.body;
    const newId = body.id || 'p_' + Date.now().toString(36);
    const brandPrefix = (body.brand || 'SM').replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase() || 'SM';
    const newSku = body.sku || `SKU-${brandPrefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPrice = Number(body.price) || 0;
    const newMrp = Number(body.mrp) || newPrice;

    // Safely normalize specs to array of strings
    let normalizedSpecs = [];
    if (Array.isArray(body.specs)) {
      normalizedSpecs = body.specs.map((s) => (typeof s === 'string' ? s : (s && typeof s === 'object') ? Object.entries(s).map(([k, v]) => `${k}: ${v}`).join(', ') : String(s)));
    } else if (typeof body.specs === 'string') {
      normalizedSpecs = body.specs.split('\n').map((s) => s.trim()).filter(Boolean);
    } else if (body.specs && typeof body.specs === 'object') {
      normalizedSpecs = Object.entries(body.specs).map(([k, v]) => `${k}: ${v}`);
    }

    const newProduct = {
      ...body,
      id: newId,
      sku: newSku,
      price: newPrice,
      mrp: newMrp,
      specs: normalizedSpecs,
      stock: Number(body.stock) || 0,
      rating: Number(body.rating) || 4.5,
      reviews: Number(body.reviews) || 0,
    };

    if (getDbStatus()) {
      const created = await Product.create(newProduct);
      return res.status(201).json({ success: true, data: created });
    }

    memoryProducts.unshift(newProduct);
    return res.status(201).json({ success: true, data: newProduct });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const patch = req.body;

    if (getDbStatus()) {
      const filter = mongoose.isValidObjectId(id) ? { $or: [{ id }, { _id: id }] } : { id };
      const updated = await Product.findOneAndUpdate(filter, patch, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.json({ success: true, data: updated });
    }

    const idx = memoryProducts.findIndex((p) => p.id === id || p._id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Product not found' });
    memoryProducts[idx] = { ...memoryProducts[idx], ...patch };
    return res.json({ success: true, data: memoryProducts[idx] });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (getDbStatus()) {
      const filter = mongoose.isValidObjectId(id) ? { $or: [{ id }, { _id: id }] } : { id };
      const deleted = await Product.findOneAndDelete(filter);
      if (!deleted) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.json({ success: true, message: 'Product removed' });
    }

    memoryProducts = memoryProducts.filter((p) => p.id !== id && p._id !== id);
    return res.json({ success: true, message: 'Product removed' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
