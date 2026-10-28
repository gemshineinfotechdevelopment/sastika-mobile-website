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
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;

  // 1. Delete all dummy products
  const prodRes = await db.collection('products').deleteMany({});
  console.log(`✓ Deleted ${prodRes.deletedCount} static/seed products.`);

  // 2. Delete dummy tickets (preserve real user bookings)
  const dummyTicketIds = ['SR-5521', 'SR-5520', 'SR-5519', 'SR-5518', 'SR-5517', 'SR-5516', 'SR-5515'];
  const ticketRes = await db.collection('tickets').deleteMany({
    $or: [
      { id: { $in: dummyTicketIds } },
      { customer: { $in: ['Arun K.', 'Meena P.', 'Sathish B.', 'Lakshmi V.', 'Vignesh T.'] } }
    ]
  });
  console.log(`✓ Deleted ${ticketRes.deletedCount} dummy tickets.`);

  // 3. Delete dummy seed orders (preserve real customer orders)
  const dummyOrderIds = ['#SM-884220', '#SM-884219', '#SM-884218', '#SM-884217', '#SM-884216', '#SM-884215'];
  const orderRes = await db.collection('orders').deleteMany({
    $or: [
      { id: { $in: dummyOrderIds } },
      { customer: { $in: ['Rajesh Kumar', 'Ananya Sundaram', 'M. Selvaraj', 'R. Priya', 'Karthik N.', 'Divya S.'] } }
    ]
  });
  console.log(`✓ Deleted ${orderRes.deletedCount} dummy seed orders.`);

  // 4. Reset flash deals items
  await db.collection('flashdeals').updateMany({}, { $set: { items: [], isActive: false } });

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
