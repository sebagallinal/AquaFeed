#!/bin/bash

# deploy.sh - Script de despliegue para AquaFeed en AWS Linux

echo "🚀 Iniciando despliegue de AquaFeed..."

# Detener procesos existentes
echo "⏹️ Deteniendo procesos existentes..."
pm2 stop all
pm2 delete all

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Compilar aplicación Angular para producción
echo "🔨 Compilando aplicación Angular..."
ng build --configuration production

# Configurar variables de entorno
export NODE_ENV=production
export JWT_SECRET=${JWT_SECRET:-"clave_jwt_super_segura_para_produccion"}
export PORT=${PORT:-3000}

# Instalar serve globalmente para servir archivos estáticos
npm install -g serve

# Iniciar aplicaciones con PM2
echo "🌟 Iniciando aplicaciones..."

# Iniciar backend
pm2 start ecosystem.config.js --env production

# Verificar estado
pm2 status

# Configurar PM2 para autostart
pm2 startup
pm2 save

echo "✅ Despliegue completado!"
echo "🌐 Backend: http://$(curl -s ifconfig.me):3000"
echo "🖥️ Frontend: http://$(curl -s ifconfig.me):4200"
echo ""
echo "📊 Para monitorear: pm2 monit"
echo "📋 Para ver logs: pm2 logs"
echo "🔄 Para reiniciar: pm2 restart all"
