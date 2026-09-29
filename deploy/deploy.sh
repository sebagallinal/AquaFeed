#!/usr/bin/env bash
# Actualiza la app desde GitHub, compila el frontend y reinicia el backend.
# Ejecutar como el usuario de la app (ubuntu):  ./deploy/deploy.sh
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"
git pull --ff-only

cd aquafeed-app
npm ci --no-audit --no-fund
npx ng build --configuration production

rm -rf /var/www/aquafeed/*
cp -r dist/aquafeed-app/browser/. /var/www/aquafeed/

pm2 startOrReload ecosystem.config.js --update-env
pm2 save
