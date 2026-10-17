#!/usr/bin/env bash
# ==============================================================================
# Sastika Mobiles - Automated Deployment Script
# Subdomain: sastika-mobiles.gemshine.tech
# Backend Port: 5020
# ==============================================================================

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "=========================================================="
echo "🚀 Deploying Sastika Mobiles..."
echo "📂 Project Directory: $PROJECT_DIR"
echo "🕒 Timestamp: $(date)"
echo "=========================================================="

cd "$PROJECT_DIR"

# 1. Pull latest code from GitHub (optional if already up to date)
if [ -d ".git" ]; then
    echo "⬇️ Pulling latest changes from Git..."
    git pull origin main || echo "⚠️ Git pull had warnings/no changes, proceeding..."
fi

# 2. Install frontend dependencies and build production bundle
echo "📦 Installing root/frontend dependencies..."
npm install

echo "🔨 Building frontend with Vite..."
npm run build

# Ensure logs directory exists
mkdir -p "$PROJECT_DIR/logs"

# 3. Setup backend dependencies
echo "📦 Installing server dependencies..."
cd "$PROJECT_DIR/server"
npm install --omit=dev

# 4. Optional seed database (run with: ./deploy.sh --seed)
if [ "$1" = "--seed" ]; then
    echo "🌱 Seeding MongoDB database on VPS..."
    npm run seed
fi

cd "$PROJECT_DIR"

# 5. Start or Reload PM2
echo "⚙️ Reloading PM2 backend application..."
if pm2 describe sastika-backend > /dev/null 2>&1; then
    echo "↻ Reloading existing PM2 process..."
    pm2 reload ecosystem.config.cjs --env production
else
    echo "▶️ Starting new PM2 process..."
    pm2 start ecosystem.config.cjs --env production
fi

# Save PM2 process list
pm2 save

# 6. Verify backend health
echo "🩺 Testing backend API on port 5020..."
sleep 2
HEALTH_RES=$(curl -s http://127.0.0.1:5020/api/health || echo "FAILED")
echo "API Response: $HEALTH_RES"

# 7. Test and reload Nginx
echo "🌐 Testing and reloading Nginx..."
if command -v nginx > /dev/null 2>&1; then
    sudo nginx -t
    sudo systemctl reload nginx
    echo "✓ Nginx reloaded successfully."
else
    echo "⚠️ Nginx not installed or not in PATH, skipping Nginx reload."
fi

echo "=========================================================="
echo "🎉 DEPLOYMENT FINISHED SUCCESSFULLY!"
echo "🌐 Storefront: https://sastika-mobiles.gemshine.tech"
echo "🛠️ Admin:      https://sastika-mobiles.gemshine.tech/#/admin"
echo "📡 API Health: https://sastika-mobiles.gemshine.tech/api/health"
echo "=========================================================="
