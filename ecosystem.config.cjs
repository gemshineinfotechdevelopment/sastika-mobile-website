/**
 * PM2 Process Manager Configuration for Sastika Mobiles
 * Subdomain: sastika-mobiles.gemshine.tech
 * Backend Port: 5020
 */

module.exports = {
  apps: [
    {
      name: 'sastika-backend',
      script: 'index.js',
      cwd: './server',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'development',
        PORT: 5020,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5020,
        MONGO_URI: 'mongodb://127.0.0.1:27017/sastika_mobiles',
        DB_NAME: 'sastika_mobiles',
        CLIENT_URL: 'https://sastika-mobiles.gemshine.tech',
        JWT_SECRET: 'sastika_production_super_secure_jwt_secret_key_2026',
        JWT_EXPIRES_IN: '30d',
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: '../logs/pm2-error.log',
      out_file: '../logs/pm2-out.log',
      merge_logs: true,
      time: true,
    },
  ],
};
