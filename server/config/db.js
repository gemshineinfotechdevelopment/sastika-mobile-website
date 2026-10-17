import mongoose from 'mongoose';

let isDbConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sastika-mobiles';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500, // Quick timeout to prevent blocking when Mongo is not installed/running
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
