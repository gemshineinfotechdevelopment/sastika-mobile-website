import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import apiRouter from './routes/api.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config(); // fallback to root if any

const app = express();
const PORT = process.env.PORT || 5020;
const CLIENT_URL = process.env.CLIENT_URL || 'https://sastika-mobiles.gemshine.tech';

// Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5000',
  'http://localhost:5020',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5000',
  'http://127.0.0.1:5020',
  'https://sastika-mobiles.gemshine.tech',
  'http://sastika-mobiles.gemshine.tech',
  CLIENT_URL,
].filter(Boolean);

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman, server-to-server)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin.endsWith('.gemshine.tech') ||
        origin === 'https://gemshine.tech'
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive fallback
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request Logger (Development)
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Sastikaa Mobiles API Server',
    health: '/api/health',
    documentation: 'See /api/products, /api/orders, /api/tickets, /api/auth, /api/flash-deals',
    port: PORT,
  });
});

// Mount Main API Router
app.use('/api', apiRouter);

// Error Handling
app.use(notFound);
app.use(errorHandler);

// Start Server and Connect DB
let serverInstance;
const startServer = async () => {
  await connectDB();
  serverInstance = app.listen(PORT, '0.0.0.0', () => {
    console.log(`===============================================`);
    console.log(`🚀 Sastikaa Mobiles Server is running on port ${PORT}`);
    console.log(`📡 API Base:   http://0.0.0.0:${PORT}/api`);
    console.log(`🩺 Health:     http://0.0.0.0:${PORT}/api/health`);
    console.log(`🛒 Products:   http://0.0.0.0:${PORT}/api/products`);
    console.log(`📦 Orders:     http://0.0.0.0:${PORT}/api/orders`);
    console.log(`🔧 Tickets:    http://0.0.0.0:${PORT}/api/tickets`);
    console.log(`⚡ Flash:      http://0.0.0.0:${PORT}/api/flash-deals`);
    console.log(`🌐 Subdomain:  https://sastika-mobiles.gemshine.tech`);
    console.log(`===============================================`);
  });

  serverInstance.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use by another process.`);
      console.error(`👉 Run in PowerShell to free it: Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force`);
    } else {
      console.error('❌ Server startup error:', err);
    }
  });
};

// Graceful shutdown handling for PM2 and Docker
const handleShutdown = (signal) => {
  console.log(`\n🛑 [${signal}] Graceful shutdown initiated...`);
  if (serverInstance) {
    serverInstance.close(() => {
      console.log('✅ HTTP server closed.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

startServer();
