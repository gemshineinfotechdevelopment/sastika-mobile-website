#!/usr/bin/env bash
# ==============================================================================
# Sastika Mobiles - Complete VPS Initial Server Setup Script
# Ubuntu 20.04 / 22.04 / 24.04 LTS
# ==============================================================================

set -e

echo "=========================================================="
echo "🚀 Sastika Mobiles - Initializing VPS Setup..."
echo "=========================================================="

# 1. Update system packages
echo "📦 Updating apt packages..."
sudo apt-get update -y && sudo apt-get upgrade -y
sudo apt-get install -y curl wget git ufw htop build-essential software-properties-common

# 2. Install Node.js 20 LTS
echo "📦 Installing Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
echo "✓ Node version: $(node -v)"
echo "✓ NPM version:  $(npm -v)"

# 3. Install PM2 globally
echo "📦 Installing PM2 process manager..."
sudo npm install -g pm2
pm2 startup systemd -u $USER --hp $HOME || true

# 4. Install Nginx
echo "📦 Installing Nginx web server..."
sudo apt-get install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# 5. Install Certbot (Let's Encrypt SSL)
echo "📦 Installing Certbot for SSL certificates..."
sudo apt-get install -y certbot python3-certbot-nginx

# 6. Configure UFW Firewall
echo "🛡️ Configuring UFW firewall rules..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw allow 5020/tcp comment 'Sastika Backend Port'
echo "y" | sudo ufw enable || true
sudo ufw status verbose

echo "=========================================================="
echo "🎉 VPS Core Environment Setup Completed!"
echo "   Node.js, PM2, Nginx, Certbot & Firewall are configured."
echo "=========================================================="
