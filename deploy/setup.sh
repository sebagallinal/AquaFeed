#!/usr/bin/env bash
# Configuración inicial del servidor (Ubuntu). Ejecutar una sola vez desde el repo clonado:
#   sudo ./deploy/setup.sh <IP-publica-o-dominio>
set -euo pipefail

HOST="${1:?Uso: sudo $0 <IP-publica-o-dominio>}"
APP_USER="${SUDO_USER:-ubuntu}"
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DEPLOY_DIR="$REPO_DIR/deploy"

# Swap: la instancia tiene poca RAM y el build de Angular la necesita
if ! swapon --show | grep -q /swapfile; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# Paquetes
apt-get update
apt-get install -y ca-certificates curl gnupg nginx mosquitto openssl
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 22 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
command -v pm2 >/dev/null || npm install -g pm2

# Certificados MQTT (solo se generan si no existen)
PKI=/etc/aquafeed/pki
[ -f "$PKI/server.crt" ] || "$DEPLOY_DIR/gen-certs.sh" server "$HOST"
[ -f "$PKI/api.crt" ]    || "$DEPLOY_DIR/gen-certs.sh" client api
[ -f "$PKI/device1.crt" ] || "$DEPLOY_DIR/gen-certs.sh" client device1

# Mosquitto
install -d -o mosquitto -g mosquitto -m 750 /etc/mosquitto/certs
install -o mosquitto -g mosquitto -m 644 "$PKI/ca.crt"     /etc/mosquitto/certs/ca.crt
install -o mosquitto -g mosquitto -m 644 "$PKI/server.crt" /etc/mosquitto/certs/server.crt
install -o mosquitto -g mosquitto -m 600 "$PKI/server.key" /etc/mosquitto/certs/server.key
install -m 644 "$DEPLOY_DIR/mosquitto-aquafeed.conf" /etc/mosquitto/conf.d/aquafeed.conf
install -o mosquitto -g mosquitto -m 640 "$DEPLOY_DIR/mosquitto-aquafeed.acl" /etc/mosquitto/aquafeed.acl
systemctl enable mosquitto
systemctl restart mosquitto

# Certificado del backend (cliente "api"), legible por el usuario de la app
install -d -o "$APP_USER" -g "$APP_USER" -m 700 /etc/aquafeed/mqtt
install -o "$APP_USER" -g "$APP_USER" -m 644 "$PKI/ca.crt"  /etc/aquafeed/mqtt/ca.crt
install -o "$APP_USER" -g "$APP_USER" -m 644 "$PKI/api.crt" /etc/aquafeed/mqtt/api.crt
install -o "$APP_USER" -g "$APP_USER" -m 600 "$PKI/api.key" /etc/aquafeed/mqtt/api.key

# Secreto JWT (solo se genera la primera vez)
ENV_FILE="$REPO_DIR/aquafeed-app/.env"
if [ ! -f "$ENV_FILE" ]; then
  echo "JWT_SECRET=$(openssl rand -hex 32)" > "$ENV_FILE"
  chown "$APP_USER:$APP_USER" "$ENV_FILE"
  chmod 600 "$ENV_FILE"
fi

# Nginx
install -d -o "$APP_USER" -g "$APP_USER" /var/www/aquafeed
install -m 644 "$DEPLOY_DIR/nginx-aquafeed.conf" /etc/nginx/sites-available/aquafeed
ln -sf /etc/nginx/sites-available/aquafeed /etc/nginx/sites-enabled/aquafeed
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable nginx
systemctl reload nginx

# PM2 arranca con el sistema
env PATH="$PATH" pm2 startup systemd -u "$APP_USER" --hp "$(getent passwd "$APP_USER" | cut -d: -f6)"

# Primer despliegue
sudo -u "$APP_USER" "$DEPLOY_DIR/deploy.sh"
