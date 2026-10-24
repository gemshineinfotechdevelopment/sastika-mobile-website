import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: false },
    role: { type: String, enum: ['customer', 'admin', 'technician'], default: 'customer' },
    phone: { type: String },
    googleId: { type: String },
    avatar: { type: String },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    cart: [
      {
        id: { type: String, required: true },
        qty: { type: Number, default: 1 },
      },
    ],
    wishlist: [{ type: String }],
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model('User', userSchema);
