import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import apiRouter from './routes/api.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or localhost origins
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin === CLIENT_URL) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive during development
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger (Development)
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Sastika Mobiles API Server',
    health: '/api/health',
    documentation: 'See /api/products, /api/orders, /api/tickets, /api/auth',
  });
});

// Mount Main API Router
app.use('/api', apiRouter);

// Error Handling
app.use(notFound);
app.use(errorHandler);

// Start Server and Connect DB
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 Sastika Mobiles Server is running on port ${PORT}`);
    console.log(`📡 API Base:   http://localhost:${PORT}/api`);
    console.log(`🩺 Health:     http://localhost:${PORT}/api/health`);
    console.log(`🛒 Products:   http://localhost:${PORT}/api/products`);
    console.log(`📦 Orders:     http://localhost:${PORT}/api/orders`);
    console.log(`🔧 Tickets:    http://localhost:${PORT}/api/tickets`);
    console.log(`===============================================`);
  });
};

startServer();
