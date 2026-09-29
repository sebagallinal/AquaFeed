#!/usr/bin/env bash
# Instala MariaDB y crea la base y el usuario de la app (idempotente).
# Las credenciales se agregan a aquafeed-app/.env; las tablas las crea el backend al iniciar.
#   sudo ./deploy/setup-db.sh
set -euo pipefail

APP_USER="${SUDO_USER:-ubuntu}"
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$REPO_DIR/aquafeed-app/.env"

apt-get install -y mariadb-server
systemctl enable --now mariadb

# Solo escucha en localhost (el puerto 3306 no queda expuesto a internet)
cat > /etc/mysql/mariadb.conf.d/99-aquafeed.cnf <<'EOF'
[mysqld]
bind-address = 127.0.0.1
default-time-zone = '+00:00'
EOF
systemctl restart mariadb

touch "$ENV_FILE"
if ! grep -q '^DB_PASSWORD=' "$ENV_FILE"; then
  DB_PASSWORD="$(openssl rand -hex 24)"
  cat >> "$ENV_FILE" <<EOF
DB_HOST=localhost
DB_PORT=3306
DB_NAME=aquafeed
DB_USER=aquafeed
DB_PASSWORD=$DB_PASSWORD
EOF
fi
chown "$APP_USER:$APP_USER" "$ENV_FILE"
chmod 600 "$ENV_FILE"

DB_PASSWORD="$(grep '^DB_PASSWORD=' "$ENV_FILE" | cut -d= -f2-)"
mariadb <<EOF
CREATE DATABASE IF NOT EXISTS aquafeed CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'aquafeed'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
ALTER USER 'aquafeed'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON aquafeed.* TO 'aquafeed'@'localhost';
FLUSH PRIVILEGES;
EOF
echo "MariaDB lista: base 'aquafeed', usuario 'aquafeed' (credenciales en $ENV_FILE)"
