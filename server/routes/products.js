import { Router } from 'express';
import { readData, writeData } from '../dataHelper.js';

const router = Router();
const FILE = 'products.json';

// GET all products (with optional filtering)
router.get('/', (req, res) => {
  let products = readData(FILE);
  const { category, brand, search } = req.query;

  if (category) {
    products = products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  if (brand) {
    products = products.filter((p) => p.brand.toLowerCase() === brand.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    );
  }

  res.json(products);
});

// GET single product by id
router.get('/:id', (req, res) => {
  const products = readData(FILE);
  const item = products.find((p) => p.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(item);
});

// POST new product
router.post('/', (req, res) => {
  const products = readData(FILE);
  const newProduct = {
    id: req.body.id || 'n' + Date.now().toString(36),
    ...req.body,
  };
  products.unshift(newProduct);
  writeData(FILE, products);
  res.status(201).json(newProduct);
});

// PUT update product
router.put('/:id', (req, res) => {
  const products = readData(FILE);
  const index = products.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  products[index] = { ...products[index], ...req.body };
  writeData(FILE, products);
  res.json(products[index]);
});

// DELETE product
router.delete('/:id', (req, res) => {
  let products = readData(FILE);
  const exists = products.some((p) => p.id === req.params.id);
  if (!exists) {
    return res.status(404).json({ error: 'Product not found' });
  }
  products = products.filter((p) => p.id !== req.params.id);
  writeData(FILE, products);
  res.json({ message: 'Product deleted successfully', id: req.params.id });
});

export default router;
