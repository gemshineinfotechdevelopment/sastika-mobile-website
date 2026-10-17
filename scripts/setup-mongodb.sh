#!/usr/bin/env bash
# ==============================================================================
# Sastika Mobiles - MongoDB Installation Script for Ubuntu/Debian VPS
# ==============================================================================

set -e

echo "=========================================================="
echo "🍃 Installing MongoDB Community Server on VPS..."
echo "=========================================================="

# 1. Update packages and install prerequisites
sudo apt-get update -y
sudo apt-get install -y gnupg curl wget lsb-release

# 2. Import MongoDB public GPG Key
UBUNTU_CODENAME=$(lsb_release -cs)
echo "Detected OS Codename: $UBUNTU_CODENAME"

# Import MongoDB 7.0 / 8.0 GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor --yes

# 3. Add MongoDB Repository
if [ "$UBUNTU_CODENAME" = "jammy" ] || [ "$UBUNTU_CODENAME" = "noble" ]; then
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
else
    # Fallback to general ubuntu/debian repo
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
fi

# 4. Update apt database and install MongoDB
sudo apt-get update -y
sudo apt-get install -y mongodb-org

# 5. Start and Enable MongoDB Systemd Service
sudo systemctl daemon-reload
sudo systemctl enable mongod
sudo systemctl start mongod

# 6. Verify MongoDB is Running
if systemctl is-active --quiet mongod; then
    echo "=========================================================="
    echo "✅ MongoDB is ACTIVE and running on 127.0.0.1:27017"
    echo "=========================================================="
else
    echo "⚠️ MongoDB service did not start automatically. Trying direct start..."
    sudo systemctl restart mongod
fi

# Show status
sudo systemctl status mongod --no-pager
