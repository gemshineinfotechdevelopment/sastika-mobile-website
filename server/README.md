# Sastika Mobiles - Backend API Server

Fast, scalable Node.js + Express backend service for Sastika Mobiles e-commerce store and service desk.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Environment (.env)
The `.env` file is already generated with defaults:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/sastika-mobiles
JWT_SECRET=sastika_mobiles_secure_jwt_secret_key_2026
JWT_EXPIRES_IN=7d
```

### 3. Start the Server
- **Development mode (Auto-restart on save)**:
  ```bash
  npm run dev
  ```
- **Production mode**:
  ```bash
  npm start
  ```

---

## 🛠️ Features
- **Express & CORS**: Configured to seamlessly connect with Vite frontend (`http://localhost:5173`).
- **Dual Mode Database Support**:
  - Connects to **MongoDB** if available.
  - Automatically falls back to high-speed **In-Memory storage** if MongoDB is offline, allowing frictionless development and testing without having to start MongoDB.
- **RESTful Endpoints**:
  - `GET /api/health` - Server & database status
  - `GET /api/products` - List all products (supports query params: `?category=`, `?brand=`, `?search=`)
  - `GET /api/products/:id` - Get product by ID
  - `POST /api/products` - Create product
  - `PUT /api/products/:id` - Update product
  - `DELETE /api/products/:id` - Delete product
  - `GET /api/orders` - List all customer orders
  - `POST /api/orders` - Place new order (auto decrements inventory stock)
  - `PUT /api/orders/:id/status` - Update order status (`Placed`, `Packed`, `Shipped`, `Delivered`, `Cancelled`)
  - `GET /api/tickets` - List all service desk repair tickets
  - `POST /api/tickets` - Book repair ticket
  - `PUT /api/tickets/:id` - Update repair ticket status & technician assignment
  - `POST /api/auth/login` - User & Admin login (`admin@sastikamobiles.com` / `admin123`)
  - `POST /api/auth/register` - Customer registration
  - `GET /api/auth/me` - Authenticated user profile
