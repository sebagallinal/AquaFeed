#!/bin/bash

# update-cors.sh - Script para actualizar configuración CORS en EC2

echo "🔄 Actualizando configuración CORS para aquafeed.com.ar..."

# Verificar si PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo "📦 Instalando PM2..."
    sudo npm install -g pm2
fi

# Cambiar propietario de los archivos si es necesario
echo "🔐 Configurando permisos..."
sudo chown -R $USER:$USER /opt/aquafeed/AquaFeed/aquafeed-app/
sudo chmod -R 755 /opt/aquafeed/AquaFeed/aquafeed-app/

# Limpiar dist anterior
echo "🧹 Limpiando archivos anteriores..."
rm -rf dist/

# Detener aplicaciones existentes
echo "⏹️ Deteniendo aplicaciones existentes..."
pm2 stop all 2>/dev/null || echo "No hay procesos PM2 ejecutándose"

# Compilar frontend con configuración de producción
echo "🔨 Compilando frontend para producción..."
ng build --configuration production

# Verificar si el backend está ejecutándose
echo "🔍 Verificando backend..."
if ! pm2 list | grep -q "aquafeed-backend"; then
    echo "🚀 Iniciando backend..."
    pm2 start server/server.js --name aquafeed-backend
else
    echo "� Reiniciando backend..."
    pm2 restart aquafeed-backend
fi

# Configurar servidor estático para frontend si no existe
if ! pm2 list | grep -q "aquafeed-frontend"; then
    echo "🌐 Iniciando frontend estático..."
    pm2 serve dist/aquafeed-app 4200 --name aquafeed-frontend --spa
else
    echo "🔄 Reiniciando frontend..."
    pm2 restart aquafeed-frontend
fi

# Verificar estado
pm2 status

# Guardar configuración PM2
pm2 save

echo "✅ Actualización completada!"
echo ""
echo "🌐 URLs actualizadas:"
echo "Frontend: http://aquafeed.com.ar:4200"
echo "Backend: http://aquafeed.com.ar:3000/api"
echo ""
echo "🔍 Para verificar CORS:"
echo "curl -H 'Origin: http://aquafeed.com.ar' -H 'Access-Control-Request-Method: POST' -H 'Access-Control-Request-Headers: Content-Type' -X OPTIONS http://aquafeed.com.ar:3000/api/auth/login"
