#!/bin/bash

# diagnose-500.sh - Script para diagnosticar error 500 de Nginx

echo "🔍 Diagnosticando error 500 de Nginx..."
echo "=========================================="

# 1. Verificar logs de Nginx
echo "📋 Logs de error de Nginx:"
sudo tail -20 /var/log/nginx/error.log

echo ""
echo "📋 Logs de acceso de Nginx:"
sudo tail -10 /var/log/nginx/access.log

# 2. Verificar estado del backend
echo ""
echo "🔍 Estado del servidor backend:"
curl -s http://localhost:3000/api/health || echo "❌ Backend no responde"

# 3. Verificar procesos
echo ""
echo "⚙️ Procesos Node.js ejecutándose:"
ps aux | grep node

# 4. Verificar PM2
echo ""
echo "⚙️ Estado de PM2:"
pm2 status 2>/dev/null || echo "PM2 no está ejecutándose"

# 5. Verificar puertos
echo ""
echo "🔌 Puertos en uso:"
sudo netstat -tlnp | grep -E ':80|:3000|:4200'

# 6. Verificar configuración de Nginx
echo ""
echo "⚙️ Test de configuración de Nginx:"
sudo nginx -t

# 7. Verificar archivos del frontend
echo ""
echo "📁 Archivos del frontend:"
ls -la /opt/aquafeed/AquaFeed/aquafeed-app/dist/aquafeed-app/ 2>/dev/null || echo "❌ Directorio dist no encontrado"

# 8. Verificar permisos
echo ""
echo "🔐 Permisos del directorio:"
ls -la /opt/aquafeed/AquaFeed/aquafeed-app/ | head -5

echo ""
echo "🔧 Comandos para solucionar:"
echo "1. Reiniciar backend: pm2 restart aquafeed-backend"
echo "2. Reiniciar Nginx: sudo systemctl restart nginx"
echo "3. Ver logs en tiempo real: sudo tail -f /var/log/nginx/error.log"
echo "4. Verificar backend: curl http://localhost:3000/api/health"
