#!/bin/bash

# fix-500-error.sh - Script para solucionar error 500

echo "🔧 Solucionando error 500 de Nginx..."

# 1. Ir al directorio correcto
cd /opt/aquafeed/AquaFeed/aquafeed-app

# 2. Detener todos los procesos
echo "⏹️ Deteniendo procesos..."
pm2 delete all 2>/dev/null
sudo pkill -f "node.*server" 2>/dev/null

# 3. Instalar dependencias si es necesario
echo "📦 Verificando dependencias..."
npm install

# 4. Compilar frontend
echo "🔨 Compilando frontend..."
rm -rf dist/
ng build --configuration production

# 5. Verificar que los archivos existen
echo "📁 Verificando archivos compilados..."
if [ ! -d "dist/aquafeed-app" ]; then
    echo "❌ Error: No se compiló el frontend correctamente"
    echo "Intentando compilación básica..."
    ng build
fi

# 6. Configurar Nginx correctamente
echo "🌐 Configurando Nginx..."
sudo tee /etc/nginx/sites-available/aquafeed > /dev/null <<EOF
server {
    listen 80;
    server_name aquafeed.com.ar 18.116.202.211;

    # Frontend Angular
    location / {
        root /opt/aquafeed/AquaFeed/aquafeed-app/dist/aquafeed-app;
        index index.html;
        try_files \$uri \$uri/ /index.html;
        
        # Headers para SPA
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # API Backend
    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }

    # Health check directo
    location /health {
        proxy_pass http://127.0.0.1:3000/api/health;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # Logs específicos
    access_log /var/log/nginx/aquafeed_access.log;
    error_log /var/log/nginx/aquafeed_error.log;
}
EOF

# 7. Habilitar sitio
sudo ln -sf /etc/nginx/sites-available/aquafeed /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 8. Test de configuración
echo "🔍 Probando configuración de Nginx..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configuración de Nginx válida"
else
    echo "❌ Error en configuración de Nginx"
    exit 1
fi

# 9. Configurar permisos
echo "🔐 Configurando permisos..."
sudo chown -R www-data:www-data /opt/aquafeed/AquaFeed/aquafeed-app/dist/
sudo chmod -R 755 /opt/aquafeed/AquaFeed/aquafeed-app/dist/

# 10. Iniciar backend
echo "🚀 Iniciando backend..."
pm2 start server/server.js --name aquafeed-backend

# Esperar a que el backend esté listo
sleep 3

# 11. Verificar backend
echo "🔍 Verificando backend..."
curl -s http://localhost:3000/api/health
if [ $? -eq 0 ]; then
    echo "✅ Backend funcionando"
else
    echo "❌ Backend no responde"
    echo "Logs del backend:"
    pm2 logs aquafeed-backend --lines 10
fi

# 12. Reiniciar Nginx
echo "🔄 Reiniciando Nginx..."
sudo systemctl restart nginx

# 13. Verificar estado final
echo ""
echo "📊 Estado final:"
echo "Backend:"
pm2 status
echo ""
echo "Nginx:"
sudo systemctl status nginx --no-pager -l | head -10

echo ""
echo "🌐 URLs para probar:"
echo "Aplicación: http://aquafeed.com.ar"
echo "Health check: http://aquafeed.com.ar/health"
echo "API directa: http://aquafeed.com.ar/api/health"

echo ""
echo "📋 Para ver logs:"
echo "Backend: pm2 logs aquafeed-backend"
echo "Nginx: sudo tail -f /var/log/nginx/aquafeed_error.log"
