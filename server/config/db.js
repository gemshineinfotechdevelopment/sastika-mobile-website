import mongoose from 'mongoose';

let isDbConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sastika-mobiles';
  const dbName = process.env.DB_NAME || 'sastika_mobiles';
  try {
    const conn = await mongoose.connect(uri, {
      dbName,
      serverSelectionTimeoutMS: 5000,
    });
    isDbConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    isDbConnected = false;
    console.warn(`[Database] MongoDB connection skipped/unavailable (${error.message}).`);
    console.log(`[Database] Running in High-Speed In-Memory / Hybrid Mode.`);
    return false;
  }
};

export const getDbStatus = () => isDbConnected;
