import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;
console.log('Connecting to:', uri ? uri.replace(/:[^:@]+@/, ':***@') : 'NONE');

try {
  await mongoose.connect(uri);
  console.log('Connected to MongoDB!');
  const collections = await mongoose.connection.db.listCollections().toArray();
  for (const c of collections) {
    const count = await mongoose.connection.db.collection(c.name).countDocuments();
    console.log(`${c.name}: ${count} documents`);
  }

  // Print any products
  const products = await mongoose.connection.db.collection('products').find({}).toArray();
  console.log('\nProducts count:', products.length);
  products.forEach(p => console.log(`- [${p.id || p._id}] ${p.name} (${p.category}) - Rs.${p.price}`));

  // Print any orders
  const orders = await mongoose.connection.db.collection('orders').find({}).toArray();
  console.log('\nOrders count:', orders.length);
  orders.forEach(o => {
    console.log(`- [${o.id || o._id}] Total: Rs.${o.total} (${o.status})`);
    console.log('  Customer:', o.customer);
    console.log('  Items:', o.items?.length);
    console.log('  Payment:', o.paymentMethod, o.paymentStatus);
  });

  // Print any tickets
  const tickets = await mongoose.connection.db.collection('tickets').find({}).toArray();
  console.log('\nTickets count:', tickets.length);
  tickets.forEach(t => console.log(`- [${t.id || t._id}] ${t.customer} - ${t.device} (${t.status})`));

  await mongoose.disconnect();
} catch (err) {
  console.error('Error:', err);
}
