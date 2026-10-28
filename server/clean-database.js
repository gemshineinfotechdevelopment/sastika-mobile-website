import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  'mongodb://127.0.0.1:27017/sastika_mobiles';

async function clean() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;

  const prodRes = await db.collection('products').deleteMany({});
  console.log(`✓ Deleted ${prodRes.deletedCount} static/seed products.`);

  const ticketRes = await db.collection('tickets').deleteMany({});
  console.log(`✓ Deleted ${ticketRes.deletedCount} dummy tickets.`);

  const remainingProducts = await db.collection('products').countDocuments();
  const remainingTickets = await db.collection('tickets').countDocuments();
  const remainingOrders = await db.collection('orders').countDocuments();

  console.log('-------------------------------------------');
  console.log(`Active Products in DB: ${remainingProducts}`);
  console.log(`Active Tickets in DB:  ${remainingTickets}`);
  console.log(`Real Customer Orders:  ${remainingOrders} (preserved)`);
  console.log('-------------------------------------------');
  console.log('Database successfully cleaned! Ready for fresh admin products.');

  await mongoose.disconnect();
  process.exit(0);
}

clean().catch((err) => {
  console.error('Error cleaning database:', err);
  process.exit(1);
});
