import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { getDbStatus } from '../config/db.js';
import { memoryProducts } from './productController.js';

export let memoryOrders = [];

export const getOrders = async (req, res) => {
  try {
    if (getDbStatus()) {
      const orders = await Order.find({}).sort({ createdAt: -1 });
      return res.json({ success: true, count: orders.length, data: orders });
    }
    return res.json({ success: true, count: memoryOrders.length, data: memoryOrders });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    if (getDbStatus()) {
      const filter = mongoose.isValidObjectId(id)
        ? { $or: [{ id }, { _id: id }, { id: '#' + id }, { id: id.replace(/^#/, '') }] }
        : { $or: [{ id }, { id: '#' + id }, { id: id.replace(/^#/, '') }] };
      const order = await Order.findOne(filter);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      return res.json({ success: true, data: order });
    }
    const order = memoryOrders.find((o) => o.id === id || o.id === '#' + id || o.id.replace(/^#/, '') === id.replace(/^#/, ''));
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    return res.json({ success: true, data: order });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { customer, phone, email, city, address, items, total, payment, id } = req.body;
    if (!customer || !phone || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Customer details and items are required' });
    }

    const orderId = id || ('#SM-' + Math.floor(100000 + Math.random() * 899999));
    const newOrder = {
      id: orderId,
      customer,
      phone,
      email: email || '',
      city: city || 'Chennai',
      address: address || '',
      items,
      total: Number(total) || 0,
      status: 'Placed',
      payment: payment || 'COD',
      date: new Date().toISOString().slice(0, 10),
    };

    if (getDbStatus()) {
      const created = await Order.create(newOrder);
      // Decrement stock in DB
      for (const item of items) {
        await Product.findOneAndUpdate(
          { id: item.productId },
          { $inc: { stock: -item.qty } }
        );
      }
      return res.status(201).json({ success: true, data: created });
    }

    memoryOrders.unshift(newOrder);
    if (Array.isArray(memoryProducts)) {
      for (const item of items) {
        const prod = memoryProducts.find((p) => p.id === item.productId);
        if (prod) {
          prod.stock = Math.max(0, prod.stock - (item.qty || 1));
        }
      }
    }
    return res.status(201).json({ success: true, data: newOrder });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const rawId = decodeURIComponent(req.params.id);
    const { status, cancelReason } = req.body;

    if (!['Placed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status' });
    }

    const patch = { status };
    if (cancelReason !== undefined) {
      patch.cancelReason = cancelReason;
    }

    if (getDbStatus()) {
      const filter = mongoose.isValidObjectId(rawId)
        ? { $or: [{ id: rawId }, { _id: rawId }, { id: '#' + rawId }, { id: rawId.replace(/^#/, '') }] }
        : { $or: [{ id: rawId }, { id: '#' + rawId }, { id: rawId.replace(/^#/, '') }] };
      const updated = await Order.findOneAndUpdate(filter, patch, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: 'Order not found' });
      return res.json({ success: true, data: updated });
    }

    const idx = memoryOrders.findIndex(
      (o) => o.id === rawId || o.id === '#' + rawId || o.id.replace(/^#/, '') === rawId.replace(/^#/, '')
    );
    if (idx === -1) return res.status(404).json({ success: false, message: 'Order not found' });
    memoryOrders[idx] = { ...memoryOrders[idx], ...patch };
    return res.json({ success: true, data: memoryOrders[idx] });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const rawId = decodeURIComponent(req.params.id);
    if (getDbStatus()) {
      const filter = mongoose.isValidObjectId(rawId)
        ? { $or: [{ id: rawId }, { _id: rawId }, { id: '#' + rawId }, { id: rawId.replace(/^#/, '') }] }
        : { $or: [{ id: rawId }, { id: '#' + rawId }, { id: rawId.replace(/^#/, '') }] };
      const deleted = await Order.findOneAndDelete(filter);
      if (!deleted) return res.status(404).json({ success: false, message: 'Order not found' });
      return res.json({ success: true, message: 'Order deleted successfully' });
    }

    memoryOrders = memoryOrders.filter(
      (o) => o.id !== rawId && o.id !== '#' + rawId && o.id.replace(/^#/, '') !== rawId.replace(/^#/, '')
    );
    return res.json({ success: true, message: 'Order deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
