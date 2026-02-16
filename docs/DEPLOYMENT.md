# Deployment Guide

## Production Stack
- Ubuntu 22.04 LTS server
- PostgreSQL 16 + PostGIS (local)
- Redis 7 (local, bind 127.0.0.1)
- Nginx (reverse proxy + SSL via Let's Encrypt)
- PM2 (cluster mode, zero-downtime reloads)

## Steps

```bash
# 1. On server: install dependencies
sudo apt install postgresql-16 postgis redis-server nginx nodejs npm

# 2. Clone repo
git clone https://github.com/your-org/funpals.git /app/funpals

# 3. Set up .env
cp .env.example .env && nano .env

# 4. Database setup
createdb funpals && cd apps/api && npm run migrate && npm run seed

# 5. Build
npm run build

# 6. Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save && pm2 startup

# 7. Nginx
sudo cp infra/nginx/nginx.conf /etc/nginx/sites-available/funpals
sudo ln -s /etc/nginx/sites-available/funpals /etc/nginx/sites-enabled/
sudo certbot --nginx -d api.funpals.com -d admin.funpals.com
sudo nginx -s reload
```
