import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { getDbStatus } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'sastika_mobiles_secure_jwt_secret_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// In-memory fallback users including demo admin
const memoryUsers = [
  {
    id: 'u_admin',
    name: 'Sastika Admin',
    email: 'admin@sastikamobiles.com',
    passwordHash: bcrypt.hashSync('admin123', 8),
    role: 'admin',
    phone: '+91 98401 23456',
  },
];

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (getDbStatus()) {
      let user = await User.findOne({ email: normalizedEmail });
      // If admin doesn't exist yet in DB, create on first login
      if (!user && normalizedEmail === 'admin@sastikamobiles.com') {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        user = await User.create({
          name: 'Sastika Admin',
          email: 'admin@sastikamobiles.com',
          password: hashedPassword,
          role: 'admin',
          phone: '+91 98401 23456',
        });
      }

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = generateToken({ id: user._id, email: user.email, role: user.role, name: user.name });
      return res.json({
        success: true,
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone },
      });
    }

    // In-memory fallback
    const user = memoryUsers.find((u) => u.email === normalizedEmail);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role, name: user.name });
    return res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (getDbStatus()) {
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone || '',
        role: role || 'customer',
      });

      const token = generateToken({ id: user._id, email: user.email, role: user.role, name: user.name });
      return res.status(201).json({
        success: true,
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone },
      });
    }

    // In-memory fallback
    const existing = memoryUsers.find((u) => u.email === normalizedEmail);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const newUser = {
      id: 'u_' + Date.now().toString(36),
      name,
      email: normalizedEmail,
      passwordHash: bcrypt.hashSync(password, 8),
      phone: phone || '',
      role: role || 'customer',
    };
    memoryUsers.push(newUser);

    const token = generateToken({ id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name });
    return res.status(201).json({
      success: true,
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, phone: newUser.phone },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getMe = async (req, res) => {
  return res.json({ success: true, user: req.user });
};
