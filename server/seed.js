import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { Product } from './models/Product.js';
import { Order } from './models/Order.js';
import { Ticket } from './models/Ticket.js';
import { FlashDeal } from './models/FlashDeal.js';
import { User } from './models/User.js';
import { SEED_PRODUCTS, SEED_ORDERS, SEED_TICKETS } from './data/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  'mongodb://127.0.0.1:27017/sastika_mobiles';
const DB_NAME = process.env.DB_NAME || 'sastika_mobiles';

const DEFAULT_FLASH_DEAL = {
  dealId: 'main_flash_deal',
  isActive: false,
  title: 'Flash Deal Drop',
  subtitle: 'LIMITED STOCK LEFT',
  festivalName: 'Diwali & Festival Mega Drop',
  endTime: '',
  items: [],
};

async function seedDatabase() {
  console.log('========================================================');
  console.log('🌱 Starting Sastikaa Mobiles Database Seed on VPS...');
  console.log(`🔗 Connecting to: ${MONGO_URI}`);
  console.log(`📂 Database:     ${DB_NAME}`);
  console.log('========================================================');

  try {
    await mongoose.connect(MONGO_URI, {
      dbName: DB_NAME,
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ MongoDB connected successfully!\n');

    // 1. Seed Products
    console.log('📦 Seeding Products...');
    await Product.deleteMany({});
    const insertedProducts = await Product.insertMany(SEED_PRODUCTS);
    console.log(`   ✓ Inserted ${insertedProducts.length} retail products.`);

    // 2. Clear Demo Orders (Only real website orders are stored)
    console.log('📋 Clearing Orders collection...');
    await Order.deleteMany({});
    console.log('   ✓ Orders collection cleared. Ready for real customer orders.');

    // 3. Seed Service Tickets
    console.log('🔧 Seeding Service Tickets...');
    await Ticket.deleteMany({});
    const insertedTickets = await Ticket.insertMany(SEED_TICKETS);
    console.log(`   ✓ Inserted ${insertedTickets.length} repair tickets.`);

    // 4. Seed Flash Deals
    console.log('⚡ Seeding Flash Deals...');
    await FlashDeal.deleteMany({});
    await FlashDeal.create(DEFAULT_FLASH_DEAL);
    console.log('   ✓ Flash Deal created with active festival countdown.');

    // 5. Seed Admin User
    console.log('👤 Seeding Admin User...');
    const adminEmail = 'admin@sastikaamobiles.com';
    await User.deleteMany({ email: adminEmail });
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Sastikaa Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      phone: '+91 98401 23456',
    });
    console.log(`   ✓ Admin user ready: ${adminEmail} (password: admin123)`);

    console.log('\n========================================================');
    console.log('🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('========================================================\n');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('🔒 MongoDB connection closed.');
  }
}

seedDatabase();
