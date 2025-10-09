#!/bin/bash

# fix-deployment.sh - Script para resolver problemas de despliegue

echo "🔧 Solucionando problemas de despliegue AquaFeed..."

# 1. Instalar dependencias globales necesarias
echo "📦 Instalando dependencias globales..."
sudo npm install -g pm2 @angular/cli

# 2. Verificar y crear directorios necesarios
echo "📁 Configurando estructura de directorios..."
cd /opt/aquafeed/AquaFeed/aquafeed-app

# 3. Configurar permisos correctos
echo "🔐 Configurando permisos..."
sudo chown -R $USER:$USER /opt/aquafeed/
sudo chmod -R 755 /opt/aquafeed/

# 4. Instalar dependencias del proyecto
echo "📥 Instalando dependencias del proyecto..."
npm install

# 5. Limpiar cualquier build anterior
echo "🧹 Limpiando builds anteriores..."
rm -rf dist/
rm -rf node_modules/.cache/

# 6. Detener procesos existentes
echo "⏹️ Deteniendo procesos existentes..."
pm2 delete all 2>/dev/null || echo "No hay procesos PM2 para eliminar"
sudo pkill -f "node.*server.js" 2>/dev/null || echo "No hay procesos Node.js del servidor"
sudo pkill -f "ng serve" 2>/dev/null || echo "No hay procesos ng serve"

# 7. Compilar aplicación para producción
echo "🔨 Compilando aplicación..."
ng build --configuration production --base-href=/

# 8. Configurar Nginx para servir la aplicación
echo "🌐 Configurando Nginx..."
sudo tee /etc/nginx/sites-available/aquafeed > /dev/null <<EOF
server {
    listen 80;
    server_name aquafeed.com.ar;

    # Servir frontend
    location / {
        root /opt/aquafeed/AquaFeed/aquafeed-app/dist/aquafeed-app;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    # Proxy para API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' 'http://aquafeed.com.ar' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Accept,Authorization,Cache-Control,Content-Type,DNT,If-Modified-Since,Keep-Alive,Origin,User-Agent,X-Requested-With' always;
        
        if (\$request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' 'http://aquafeed.com.ar';
            add_header 'Access-Control-Allow-Credentials' 'true';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'Accept,Authorization,Cache-Control,Content-Type,DNT,If-Modified-Since,Keep-Alive,Origin,User-Agent,X-Requested-With';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain charset=UTF-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }
}
EOF

# 9. Habilitar sitio en Nginx
sudo ln -sf /etc/nginx/sites-available/aquafeed /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 10. Iniciar solo el backend con PM2
echo "🚀 Iniciando backend..."
pm2 start server/server.js --name aquafeed-backend
pm2 save
pm2 startup

# 11. Verificar estado
echo "📊 Estado final:"
pm2 status
sudo systemctl status nginx --no-pager -l

echo ""
echo "✅ Despliegue completado!"
echo ""
echo "🌐 URLs de acceso:"
echo "Aplicación completa: http://aquafeed.com.ar"
echo "API directa: http://aquafeed.com.ar/api"
echo ""
echo "🔍 Para probar:"
echo "curl http://aquafeed.com.ar"
echo "curl http://aquafeed.com.ar/api/health"
