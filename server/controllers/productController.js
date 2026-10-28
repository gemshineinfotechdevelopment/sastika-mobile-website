import fs from 'fs';
import { Product } from '../models/Product.js';
import { SEED_PRODUCTS } from '../data/seedData.js';
import { getDbStatus } from '../config/db.js';

function loadSeedProducts() {
  try {
    const raw = fs.readFileSync(new URL('../data/products.json', import.meta.url), 'utf-8');
    return JSON.parse(raw);
  } catch {
    return SEED_PRODUCTS;
  }
}

// In-memory fallback storage
export let memoryProducts = loadSeedProducts();

export const getProducts = async (req, res) => {
  try {
    if (memoryProducts === null || memoryProducts === undefined) {
      memoryProducts = loadSeedProducts();
    }
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
      const product = await Product.findOne({ id });
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.json({ success: true, data: product });
    }

    const product = memoryProducts.find((p) => p.id === id);
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
    const newProduct = { ...body, id: newId };

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
      const updated = await Product.findOneAndUpdate({ id }, patch, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.json({ success: true, data: updated });
    }

    const idx = memoryProducts.findIndex((p) => p.id === id);
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
      const deleted = await Product.findOneAndDelete({ id });
      if (!deleted) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.json({ success: true, message: 'Product removed' });
    }

    memoryProducts = memoryProducts.filter((p) => p.id !== id);
    return res.json({ success: true, message: 'Product removed' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
