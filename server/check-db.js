import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;
console.log('Connecting to:', uri ? uri.replace(/:[^:@]+@/, ':***@') : 'NONE');

try {
  await mongoose.connect(uri);
  console.log('Connected to MongoDB!');
  const admin = mongoose.connection.db.admin();
  const dbs = await admin.listDatabases();
  console.log('Databases on this Atlas cluster:');
  for (const d of dbs.databases) {
    console.log('-', d.name, `(${(d.sizeOnDisk / 1024).toFixed(1)} KB)`);
    const dbInst = mongoose.connection.client.db(d.name);
    const colList = await dbInst.listCollections().toArray();
    for (const c of colList) {
      const cnt = await dbInst.collection(c.name).countDocuments();
      console.log(`   * ${c.name}: ${cnt}`);
    }
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

  // Print flashdeal
  const flashdeals = await mongoose.connection.db.collection('flashdeals').find({}).toArray();
  console.log('\nFlash Deals count:', flashdeals.length);
  flashdeals.forEach(fd => {
    console.log('- Active:', fd.isActive, 'Title:', fd.title, 'Items count:', fd.items?.length);
    if (fd.items?.length) {
      fd.items.forEach(it => console.log('   * Item:', it.id, it.name));
    }
  });

  await mongoose.disconnect();
} catch (err) {
  console.error('Error:', err);
}
