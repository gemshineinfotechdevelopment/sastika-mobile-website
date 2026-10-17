# Sastika Mobiles

Full-stack application featuring a React + TypeScript + Vite frontend and an Express Node.js backend.

- **Storefront** (mobile view): `http://localhost:5173/#/`
- **Admin panel** (desktop view): `http://localhost:5173/#/admin`
- **Backend API Server**: `http://localhost:5000/api`

---

## Architecture & Ports

| Component | Directory | Port | Environment File | Run Command |
|---|---|---|---|---|
| **Frontend** | `/` (code in `src/`) | **5173** | `src/.env` | `npm run client` or `npm run dev:frontend` |
| **Backend** | `server/` | **5000** | `server/.env` | `npm run server` or `npm run dev:backend` |
| **Both Together** | Root | Both | Respective `.env` | `npm run dev` |

---

## Environment Configuration

### Frontend (`src/.env`)
```env
VITE_PORT=5173
VITE_API_URL=http://localhost:5000/api
```

### Backend (`server/.env`)
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

---

## How to Run

### 1. Run Both (Frontend + Backend Concurrently)
```bash
npm run dev
```

### 2. Or Run Separately

**Frontend (Port 5173):**
```bash
npm run client
```

**Backend (Port 5000):**
```bash
npm run server
```

---

## Project Structure

```
sastika-mobile-website/
├── index.html
├── package.json          # Root scripts & frontend dependencies
├── tsconfig.json
├── vite.config.ts        # Vite configured with envDir: './src' and port 5173
├── src/                  # Complete Frontend Code
│   ├── .env              # Frontend environment configuration
│   ├── .env.example
│   ├── api.ts            # REST API Client for backend communication
│   ├── store.tsx         # Unified state (syncs with backend API + local fallback)
│   ├── types.ts          # TypeScript interfaces
│   ├── data.ts           # Initial demo dataset
│   ├── theme.ts          # Styling constants & colors
│   ├── components/       # Global styles, SVG illustrations, UI icons
│   ├── site/             # Storefront pages (Home, Catalog, Cart, Checkout, etc.)
│   └── admin/            # Admin pages (Dashboard, Inventory, Orders, Services)
└── server/               # Complete Backend Server
    ├── .env              # Backend environment configuration (Port 5000)
    ├── .env.example
    ├── package.json      # Express, CORS, Dotenv
    ├── server.js         # Main Express entry point with health check & routes
    ├── dataHelper.js     # JSON file persistence reader/writer
    ├── data/             # Persistent JSON database (products, orders, tickets)
    └── routes/           # REST API route handlers
        ├── products.js   # GET, POST, PUT, DELETE /api/products
        ├── orders.js     # GET, POST, PATCH /api/orders
        └── tickets.js    # GET, POST, PATCH /api/tickets
```
