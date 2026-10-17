import { Router } from 'express';
import { readData, writeData } from '../dataHelper.js';

const router = Router();
const ORDERS_FILE = 'orders.json';
const PRODUCTS_FILE = 'products.json';

// GET all orders
router.get('/', (req, res) => {
  const orders = readData(ORDERS_FILE);
  res.json(orders);
});

// GET single order by id
router.get('/:id', (req, res) => {
  const orders = readData(ORDERS_FILE);
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

// POST new order
router.post('/', (req, res) => {
  const { customer, phone, city, address, items, total, payment } = req.body;

  if (!customer || !phone || !items || !items.length) {
    return res.status(400).json({ error: 'Customer, phone, and items are required' });
  }

  const orders = readData(ORDERS_FILE);
  const products = readData(PRODUCTS_FILE);

  const id = '#SM-' + String(Math.floor(100000 + Math.random() * 899999));
  const newOrder = {
    id,
    customer,
    phone,
    city: city || 'Chennai',
    address: address || '',
    items,
    total: Number(total) || 0,
    status: 'Placed',
    payment: payment || 'UPI',
    date: new Date().toISOString().slice(0, 10),
  };

  // Deduct product stocks
  const updatedProducts = products.map((p) => {
    const orderedItem = items.find((i) => i.productId === p.id);
    if (orderedItem) {
      return { ...p, stock: Math.max(0, p.stock - orderedItem.qty) };
    }
    return p;
  });

  writeData(PRODUCTS_FILE, updatedProducts);

  orders.unshift(newOrder);
  writeData(ORDERS_FILE, orders);

  res.status(201).json(newOrder);
});

// PATCH / PUT update order status
router.patch('/:id', (req, res) => {
  const orders = readData(ORDERS_FILE);
  const index = orders.findIndex((o) => o.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  orders[index] = { ...orders[index], ...req.body };
  writeData(ORDERS_FILE, orders);
  res.json(orders[index]);
});

export default router;
