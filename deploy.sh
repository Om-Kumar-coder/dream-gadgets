#!/bin/bash
set -e

# --------------------------------------------------------------------------
# Dream Gadgets – Unified Deployment Script
# Server: 187.127.165.229
# --------------------------------------------------------------------------
# Usage:
#   sudo ./deploy.sh install     – Fresh VPS install (first time)
#   sudo ./deploy.sh update      – Pull latest code & rebuild
#   sudo ./deploy.sh restart     – Rebuild & restart API only
#   sudo ./deploy.sh seed        – Seed database with test data
#   sudo ./deploy.sh nginx       – Fix/reload Nginx config
#   sudo ./deploy.sh check       – Health check all services
#   sudo ./deploy.sh clear-cache - Clear server caches and restart apps
# --------------------------------------------------------------------------

SERVER_IP="187.127.165.229"
APP_DIR="/var/www/dream-gadgets"
API_PORT=3000
WEB_PORT=3001
ADMIN_PORT=3002

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

require_root() {
  if [ "$EUID" -ne 0 ]; then
    error "Please run as root (use sudo)."
    exit 1
  fi
}

require_app_dir() {
  if [ ! -d "$APP_DIR" ]; then
    error "App directory $APP_DIR not found. Run: sudo ./deploy.sh install"
    exit 1
  fi
}

# --------------------------------------------------------------------------
# NGINX CONFIG
# --------------------------------------------------------------------------
write_nginx_config() {
  info "Writing Nginx configuration..."
  cat > /etc/nginx/sites-available/dream-gadgets <<EOF
# Dream Gadgets – Nginx config for $SERVER_IP

server {
  listen 80;
  server_name $SERVER_IP;

  # API
  location /api/ {
    client_max_body_size 25M;
    proxy_request_buffering off;
    proxy_pass http://localhost:$API_PORT/api/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_cache_bypass \$http_upgrade;
    proxy_connect_timeout 60s;
    proxy_send_timeout 120s;
    proxy_read_timeout 120s;
  }

  # Swagger docs
  location /api/docs {
    proxy_pass http://localhost:$API_PORT/api/docs;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
  }

  # Admin panel static assets (must come BEFORE generic static rule)
  location /admin/_next/ {
    proxy_pass http://localhost:$ADMIN_PORT;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    add_header Cache-Control "public, max-age=31536000, immutable";
  }

  # Admin panel (port 3002) — Next.js has basePath: '/admin' so pass full path
  location /admin {
    proxy_pass http://localhost:$ADMIN_PORT;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_cache_bypass \$http_upgrade;
  }

  # Web storefront (default)
  location / {
    proxy_pass http://localhost:$WEB_PORT;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_cache_bypass \$http_upgrade;
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
  }

  # Web static asset caching (web app only — admin assets handled above)
  location ~* ^(?!/admin/).*\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    proxy_pass http://localhost:$WEB_PORT;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
  }
}
EOF
}

# --------------------------------------------------------------------------
# HEALTH CHECKS
# --------------------------------------------------------------------------
run_health_checks() {
  info "Running health checks..."
  sleep 5

  if curl -s -o /dev/null -w "%{http_code}" http://localhost:$API_PORT/api/v1/health 2>/dev/null | grep -q "200\|404"; then
    info "✅ API responding on :$API_PORT"
  else
    warn "⚠️  API not responding on :$API_PORT"
    pm2 logs dream-gadgets-api --lines 15 --nostream || true
  fi

  if curl -s -o /dev/null -w "%{http_code}" http://localhost:$WEB_PORT 2>/dev/null | grep -q "200"; then
    info "✅ Web storefront responding on :$WEB_PORT"
  else
    warn "⚠️  Web not responding on :$WEB_PORT"
    pm2 logs dream-gadgets-web --lines 15 --nostream || true
  fi

  if curl -s -o /dev/null -w "%{http_code}" http://localhost:$ADMIN_PORT/admin/login 2>/dev/null | grep -q "200\|304"; then
    info "✅ Admin panel responding on :$ADMIN_PORT"
  else
    warn "⚠️  Admin not responding on :$ADMIN_PORT"
    pm2 logs dream-gadgets-admin --lines 15 --nostream || true
  fi

  if curl -s -o /dev/null -w "%{http_code}" http://$SERVER_IP 2>/dev/null | grep -q "200\|301\|302"; then
    info "✅ http://$SERVER_IP is reachable"
  else
    warn "⚠️  http://$SERVER_IP not reachable – check Nginx"
  fi
}

# --------------------------------------------------------------------------
# SUBCOMMAND: install
# --------------------------------------------------------------------------
cmd_install() {
  require_root
  info "Starting fresh install on $SERVER_IP ..."

  # Collect secrets
  read -sp "PostgreSQL password for 'dg_user' (blank = auto-generate): " DB_PASS; echo
  [ -z "$DB_PASS" ] && DB_PASS=$(openssl rand -base64 24) && info "Generated DB password: $DB_PASS"

  read -sp "JWT secret (blank = auto-generate): " JWT_SECRET; echo
  [ -z "$JWT_SECRET" ] && JWT_SECRET=$(openssl rand -base64 32) && info "Generated JWT secret: $JWT_SECRET"

  read -sp "Refresh token secret (blank = auto-generate): " REFRESH_SECRET; echo
  [ -z "$REFRESH_SECRET" ] && REFRESH_SECRET=$(openssl rand -base64 32)

  read -p "Git repository URL (e.g. https://github.com/youruser/dream-gadgets.git): " REPO_URL
  [ -z "$REPO_URL" ] && { error "Repo URL required."; exit 1; }

  # Optional third-party keys
  read -p "Razorpay Key ID (blank to skip): " RAZORPAY_KEY_ID
  read -sp "Razorpay Key Secret (blank to skip): " RAZORPAY_KEY_SECRET; echo
  read -sp "Razorpay Webhook Secret (blank to skip): " RAZORPAY_WEBHOOK_SECRET; echo
  read -p "SendGrid API Key (blank to skip email): " SENDGRID_KEY
  read -p "AWS Access Key ID (blank to skip S3): " AWS_KEY_ID
  read -sp "AWS Secret Access Key (blank to skip S3): " AWS_SECRET; echo
  read -p "S3 Bucket name [dream-gadgets-storage]: " S3_BUCKET
  S3_BUCKET=${S3_BUCKET:-dream-gadgets-storage}

  # System packages
  info "Updating system & installing packages..."
  apt update && apt upgrade -y
  apt install -y curl wget git build-essential nginx postgresql postgresql-contrib ufw redis-server

  info "Installing Node.js 20 LTS..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt install -y nodejs

  info "Installing PM2 & turbo..."
  npm install -g pm2 turbo

  # Firewall
  info "Configuring UFW firewall..."
  ufw allow OpenSSH
  ufw allow 'Nginx Full'
  ufw allow 80/tcp
  ufw --force enable

  # Redis
  info "Starting Redis..."
  systemctl enable redis-server
  systemctl start redis-server

  # PostgreSQL
  info "Setting up PostgreSQL..."
  systemctl start postgresql && systemctl enable postgresql
  sudo -u postgres psql <<PSQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'dg_user') THEN
    CREATE USER dg_user WITH PASSWORD '$DB_PASS';
  ELSE
    ALTER USER dg_user WITH PASSWORD '$DB_PASS';
  END IF;
END\$\$;
SELECT 'CREATE DATABASE dreamgadgets OWNER dg_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'dreamgadgets')\gexec
GRANT ALL PRIVILEGES ON DATABASE dreamgadgets TO dg_user;
PSQL

  # Clone repo
  if [ -d "$APP_DIR" ]; then
    warn "$APP_DIR exists – pulling latest..."
    cd "$APP_DIR" && git pull
  else
    mkdir -p /var/www
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
  fi

  # Encode DB password for URL
  DB_PASS_ENCODED=$(node -e "console.log(encodeURIComponent('$DB_PASS'))")

  # Write API .env
  info "Writing environment files..."
  cat > "$APP_DIR/apps/api/.env" <<EOF
# App
NODE_ENV=production
PORT=$API_PORT
WEB_URL=http://$SERVER_IP
ADMIN_URL=http://$SERVER_IP/admin

# Database
DATABASE_URL=postgresql://dg_user:${DB_PASS_ENCODED}@localhost:5432/dreamgadgets
DATABASE_POOL_SIZE=20

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=$JWT_SECRET
JWT_EXPIRY=15m
REFRESH_TOKEN_SECRET=$REFRESH_SECRET
REFRESH_TOKEN_EXPIRY=7d

# AWS S3
AWS_ACCESS_KEY_ID=$AWS_KEY_ID
AWS_SECRET_ACCESS_KEY=$AWS_SECRET
AWS_REGION=ap-south-1
S3_BUCKET=$S3_BUCKET
CDN_BASE_URL=http://$SERVER_IP

# Razorpay
RAZORPAY_KEY_ID=$RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET=$RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET=$RAZORPAY_WEBHOOK_SECRET

# Email
SENDGRID_API_KEY=$SENDGRID_KEY
EMAIL_FROM=noreply@dreamgadgets.in

# WhatsApp
WHATSAPP_API_URL=
WHATSAPP_API_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=

# SMS
MSG91_AUTH_KEY=
MSG91_SENDER_ID=DRMGDG
EOF

  # Write web .env
  cat > "$APP_DIR/apps/web/.env.local" <<EOF
NEXT_PUBLIC_API_URL=http://$SERVER_IP/api/v1
NEXT_PUBLIC_APP_URL=http://$SERVER_IP
EOF

  # Write admin .env
  cat > "$APP_DIR/apps/admin/.env.local" <<EOF
NEXT_PUBLIC_API_URL=http://$SERVER_IP/api/v1
NEXT_PUBLIC_APP_URL=http://$SERVER_IP
NEXT_PUBLIC_ADMIN_URL=http://$SERVER_IP/admin
EOF

  # Install dependencies
  info "Installing dependencies (this may take a few minutes)..."
  cd "$APP_DIR"
  npm install

  # Run migrations
  info "Running database migrations..."
  cd "$APP_DIR/apps/api"
  npx ts-node -r tsconfig-paths/register run-migrations.ts
  cd "$APP_DIR"

  # Build all apps
  info "Building all apps with Turbo..."
  npm run build

  # PM2 ecosystem
  info "Writing PM2 ecosystem config..."
  mkdir -p "$APP_DIR/logs"
  cat > "$APP_DIR/ecosystem.config.js" <<'EOFPM2'
module.exports = {
  apps: [
    {
      name: 'dream-gadgets-api',
      script: 'dist/main.js',
      cwd: './apps/api',
      env: { NODE_ENV: 'production', PORT: 3000 },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      error_file: '../../logs/api-error.log',
      out_file: '../../logs/api-out.log',
      time: true,
    },
    {
      name: 'dream-gadgets-web',
      script: 'node_modules/.bin/next',
      args: 'start -p 3001',
      cwd: './apps/web',
      env: { NODE_ENV: 'production', PORT: 3001, HOSTNAME: '0.0.0.0' },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      error_file: '../../logs/web-error.log',
      out_file: '../../logs/web-out.log',
      time: true,
    },
    {
      name: 'dream-gadgets-admin',
      script: 'node_modules/.bin/next',
      args: 'start -p 3002',
      cwd: './apps/admin',
      env: { NODE_ENV: 'production', PORT: 3002, HOSTNAME: '0.0.0.0' },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      error_file: '../../logs/admin-error.log',
      out_file: '../../logs/admin-out.log',
      time: true,
    },
  ],
};
EOFPM2

  # Nginx
  write_nginx_config
  ln -sf /etc/nginx/sites-available/dream-gadgets /etc/nginx/sites-enabled/
  rm -f /etc/nginx/sites-enabled/default
  nginx -t && systemctl restart nginx

  # Start apps
  info "Starting apps with PM2..."
  cd "$APP_DIR"
  pm2 start ecosystem.config.js
  pm2 save
  pm2 startup systemd -u root --hp /root

  run_health_checks

  info "------------------------------------------------"
  info "🎉 Install complete! http://$SERVER_IP"
  info "   Web:   http://$SERVER_IP"
  info "   Admin: http://$SERVER_IP/admin"
  info "   API:   http://$SERVER_IP/api/v1"
  info "   Docs:  http://$SERVER_IP/api/docs"
  info ""
  info "   DB password:      $DB_PASS"
  info "   JWT secret:       $JWT_SECRET"
  info ""
  info "Run 'sudo ./deploy.sh seed' to seed test users."
  info "------------------------------------------------"
}

# --------------------------------------------------------------------------
# SUBCOMMAND: update
# --------------------------------------------------------------------------
cmd_update() {
  require_root
  require_app_dir
  info "Updating Dream Gadgets..."

  BACKUP="/tmp/dream-gadgets-backup-$(date +%Y%m%d-%H%M%S)"
  rsync -a \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='apps/api/dist' \
    --exclude='apps/api/.env' \
    --exclude='apps/web/.env.local' \
    --exclude='apps/admin/.env.local' \
    "$APP_DIR/" "$BACKUP/"
  info "Backup saved to $BACKUP"

  cd "$APP_DIR"
  git pull
  npm install

  info "Running migrations..."
  cd "$APP_DIR/apps/api"
  npx ts-node -r tsconfig-paths/register run-migrations.ts
  cd "$APP_DIR"

  info "Building all apps..."
  npm run build

  info "Reloading PM2..."
  pm2 reload all

  run_health_checks
  info "------------------------------------------------"
  info "🎉 Update complete! http://$SERVER_IP"
  info "Rollback: rm -rf $APP_DIR && mv $BACKUP $APP_DIR && pm2 reload all"
  info "------------------------------------------------"
}

# --------------------------------------------------------------------------
# SUBCOMMAND: restart
# --------------------------------------------------------------------------
cmd_restart() {
  require_root
  require_app_dir
  info "Rebuilding and restarting API..."

  cd "$APP_DIR/apps/api"
  npm run build
  cd "$APP_DIR"

  pm2 restart dream-gadgets-api
  sleep 3
  pm2 status

  if curl -s -o /dev/null -w "%{http_code}" http://localhost:$API_PORT/api/v1/health 2>/dev/null | grep -q "200\|404"; then
    info "✅ API is up"
  else
    warn "⚠️  API not responding – check: pm2 logs dream-gadgets-api"
  fi
}

# --------------------------------------------------------------------------
# SUBCOMMAND: seed
# --------------------------------------------------------------------------
cmd_seed() {
  require_app_dir
  info "Seeding database..."
  cd "$APP_DIR/apps/api"
  npm run seed
  info "------------------------------------------------"
  info "✅ Database seeded!"
  info "   Check seeds/003-seed-test-users.ts for credentials"
  info "------------------------------------------------"
}

# --------------------------------------------------------------------------
# SUBCOMMAND: nginx
# --------------------------------------------------------------------------
cmd_nginx() {
  require_root
  write_nginx_config
  nginx -t && systemctl reload nginx
  info "✅ Nginx reloaded."
  sleep 2
  curl -s http://$SERVER_IP/api/v1/health || warn "API health check failed – services may still be starting"
}

# --------------------------------------------------------------------------
# SUBCOMMAND: check
# --------------------------------------------------------------------------
cmd_check() {
  info "=== PM2 Status ==="
  pm2 status || true

  info "=== Checking API on :$API_PORT ==="
  if curl -s http://localhost:$API_PORT/api/v1/health > /dev/null 2>&1; then
    info "✅ API responding"
    curl -s http://localhost:$API_PORT/api/v1/health
  else
    warn "❌ API not responding"
    pm2 logs dream-gadgets-api --lines 20 --nostream || true
    info "Attempting restart..."
    pm2 restart dream-gadgets-api || true
    sleep 5
    if curl -s http://localhost:$API_PORT/api/v1/health > /dev/null 2>&1; then
      info "✅ API recovered"
    else
      warn "Still down. Check port usage:"
      ss -tlnp | grep ":$API_PORT" || true
    fi
  fi

  echo ""
  info "=== Redis ==="
  redis-cli ping || warn "Redis not responding"

  echo ""
  info "=== PostgreSQL ==="
  sudo -u postgres psql -c "SELECT version();" 2>/dev/null || warn "PostgreSQL not responding"

  echo ""
  info "=== Nginx ==="
  nginx -t 2>&1 || warn "Nginx config error"
  systemctl is-active nginx && info "✅ Nginx running" || warn "❌ Nginx not running"

  echo ""
  info "=== Disk & Memory ==="
  df -h /
  free -h
}

# --------------------------------------------------------------------------
# ENTRYPOINT
# --------------------------------------------------------------------------
case "${1:-}" in
  install)  cmd_install  ;;
  update)   cmd_update   ;;
  restart)  cmd_restart  ;;
  seed)     cmd_seed     ;;
  nginx)    cmd_nginx    ;;
  check)    cmd_check    ;;
  clear-cache) cmd_clear_cache ;;
  *)
    echo ""
    echo "Usage: sudo ./deploy.sh <command>"
    echo ""
    echo "  install   Fresh VPS setup (installs everything)"
    echo "  update    Pull latest code, rebuild, reload PM2"
    echo "  restart   Rebuild & restart API only"
    echo "  seed      Seed database with test data"
    echo "  nginx     Fix/reload Nginx config"
    echo "  check     Health check all services"
    echo "  clear-cache Clear server caches and restart apps"
    echo ""
    exit 1
    ;;
esac

cmd_clear_cache() {
 require_root
 require_app_dir
 info "Clearing server caches..."
 rm -rf "$APP_DIR/apps/web/.next"
 rm -rf "$APP_DIR/apps/admin/.next"
 rm -rf "$APP_DIR/apps/api/.next"
 pm2 restart dream-gadgets-web dream-gadgets-admin dream-gadgets-api
 info "Server caches cleared."
}
