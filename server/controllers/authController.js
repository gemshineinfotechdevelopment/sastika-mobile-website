import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { getDbStatus } from '../config/db.js';
import { readData, writeData } from '../dataHelper.js';

const JWT_SECRET = process.env.JWT_SECRET || 'sastika_mobiles_secure_jwt_secret_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const DEFAULT_USERS = [
  {
    id: 'u_admin',
    name: 'Sastika Admin',
    email: 'admin@sastikamobiles.com',
    passwordHash: bcrypt.hashSync('admin123', 8),
    role: 'admin',
    phone: '+91 98401 23456',
  },
  {
    id: 'u_hari',
    name: 'Hariharan S.',
    email: 'hari@sastikamobiles.com',
    passwordHash: bcrypt.hashSync('customer123', 8),
    role: 'customer',
    phone: '+91 95434 34344',
  },
];

function loadStoredUsers() {
  try {
    const list = readData('users.json');
    if (Array.isArray(list) && list.length > 0) {
      return list;
    }
  } catch (err) {
    console.error('Failed reading users.json:', err);
  }
  writeData('users.json', DEFAULT_USERS);
  return [...DEFAULT_USERS];
}

let memoryUsers = loadStoredUsers();

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email/Mobile number and password are required' });
    }

    const normalizedInput = email.toLowerCase().trim();
    const cleanPhone = normalizedInput.replace(/\D/g, '').slice(-10);

    // 1. Try MongoDB if connected
    if (getDbStatus()) {
      let user = await User.findOne({
        $or: [
          { email: normalizedInput },
          ...(cleanPhone.length >= 10 ? [{ phone: new RegExp(cleanPhone + '$') }] : []),
        ],
      });

      // If admin doesn't exist yet in DB, create on first login
      if (!user && normalizedInput === 'admin@sastikamobiles.com') {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        user = await User.create({
          name: 'Sastika Admin',
          email: 'admin@sastikamobiles.com',
          password: hashedPassword,
          role: 'admin',
          phone: '+91 98401 23456',
        });
      }

      if (user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
        }

        const token = generateToken({ id: user._id, email: user.email, role: user.role, name: user.name });
        return res.json({
          success: true,
          token,
          user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone },
        });
      }
    }

    // 2. Check persistent users.json / memory storage
    memoryUsers = loadStoredUsers();
    const user = memoryUsers.find((u) => {
      if (u.email && u.email.toLowerCase() === normalizedInput) return true;
      if (cleanPhone.length >= 10 && u.phone) {
        const uClean = u.phone.replace(/\D/g, '').slice(-10);
        if (uClean === cleanPhone) return true;
      }
      return false;
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No account found with this email or mobile number. Please register first.',
      });
    }

    const hashToCompare = user.passwordHash || user.password;
    const isMatch = hashToCompare ? bcrypt.compareSync(password, hashToCompare) : false;
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
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
    const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);

    memoryUsers = loadStoredUsers();

    // Check if user already exists
    const existingInMem = memoryUsers.find(
      (u) =>
        u.email === normalizedEmail ||
        (cleanPhone.length >= 10 && u.phone && u.phone.replace(/\D/g, '').slice(-10) === cleanPhone)
    );
    if (existingInMem) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email or mobile number already exists. Please sign in.',
      });
    }

    let createdId = 'u_' + Date.now().toString(36);
    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. If MongoDB is active, create in DB
    if (getDbStatus()) {
      const existingInDb = await User.findOne({
        $or: [
          { email: normalizedEmail },
          ...(cleanPhone.length >= 10 ? [{ phone: new RegExp(cleanPhone + '$') }] : []),
        ],
      });
      if (existingInDb) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email or mobile number already exists. Please sign in.',
        });
      }

      const dbUser = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone || '',
        role: role || 'customer',
      });
      createdId = String(dbUser._id);
    }

    // 2. Always persist in users.json file
    const newUser = {
      id: createdId,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: hashedPassword,
      phone: phone || '',
      role: role || 'customer',
      createdAt: new Date().toISOString(),
    };

    memoryUsers.push(newUser);
    writeData('users.json', memoryUsers);

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
