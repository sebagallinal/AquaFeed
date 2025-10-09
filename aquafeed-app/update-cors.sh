#!/bin/bash

# update-cors.sh - Script para actualizar configuración CORS en EC2

echo "🔄 Actualizando configuración CORS para aquafeed.com.ar..."

# Detener aplicaciones
pm2 stop all

# Compilar frontend con configuración de producción
echo "🔨 Compilando frontend para producción..."
ng build --configuration production

# Reiniciar aplicaciones
echo "🚀 Reiniciando aplicaciones..."
pm2 restart all

# Verificar estado
pm2 status

echo "✅ Actualización completada!"
echo ""
echo "🌐 URLs actualizadas:"
echo "Frontend: http://aquafeed.com.ar"
echo "Backend: http://aquafeed.com.ar:3000/api"
echo ""
echo "🔍 Para verificar CORS:"
echo "curl -H 'Origin: http://aquafeed.com.ar' -H 'Access-Control-Request-Method: POST' -H 'Access-Control-Request-Headers: Content-Type' -X OPTIONS http://aquafeed.com.ar:3000/api/auth/login"
