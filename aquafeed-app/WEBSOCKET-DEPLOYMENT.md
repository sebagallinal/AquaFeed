# Guía de Despliegue - WebSocket en Producción

## ⚠️ Problema Identificado

El error que estás viendo es porque la aplicación Angular en producción está intentando conectarse a `localhost:3000`, pero necesita conectarse a través de tu dominio `aquafeed.com.ar`.

## 🔧 Solución Implementada

Se han realizado los siguientes cambios:

### 1. Configuración de Environments
- ✅ `environment.prod.ts` actualizado con `websocketUrl: 'http://aquafeed.com.ar'`
- ✅ `environment.ts` actualizado con `websocketUrl: 'http://localhost:3000'`

### 2. Servicio de WebSocket
- ✅ `realtime-data.service.ts` ahora usa `environment.websocketUrl`

### 3. Nginx Configuration
- ✅ Agregado soporte para proxy WebSocket en `/socket.io/`
- ✅ Headers correctos para mantener la conexión WebSocket activa

## 📋 Pasos para Desplegar

### Paso 1: Build de la aplicación Angular
```bash
npm run build
```

### Paso 2: Subir archivos al servidor
```bash
# Desde tu máquina local, conecta por SSH
ssh ec2-user@aquafeed.com.ar  # o usa la IP: 18.116.202.211

# O usa SCP para copiar archivos
scp -r dist/aquafeed-app/* ec2-user@aquafeed.com.ar:/home/ec2-user/aquafeed-app/dist/aquafeed-app/
```

### Paso 3: Actualizar código del servidor en EC2
```bash
# En el servidor EC2
cd /home/ec2-user/aquafeed-app

# Hacer pull de los cambios
git pull origin main

# Instalar dependencias si es necesario
npm install

# Rebuild de Angular
npm run build
```

### Paso 4: Actualizar Nginx
```bash
# En el servidor EC2
cd /home/ec2-user/aquafeed-app

# Dar permisos de ejecución al script
chmod +x update-nginx-websocket.sh

# Ejecutar el script
./update-nginx-websocket.sh
```

### Paso 5: Reiniciar el servidor Node.js
```bash
# Si usas PM2
pm2 restart aquafeed-api

# Si usas systemd
sudo systemctl restart aquafeed

# O manualmente
# Detener el proceso actual (Ctrl+C si está corriendo)
# Luego ejecutar
node server/server.js
# O con PM2
pm2 start ecosystem.config.js
```

### Paso 6: Verificar el estado
```bash
# Verificar Nginx
sudo systemctl status nginx

# Verificar Node.js (si usas PM2)
pm2 status

# Ver logs en tiempo real
pm2 logs aquafeed-api

# Verificar que el puerto 3000 esté escuchando
netstat -tlnp | grep 3000
```

## 🧪 Testing

### En el navegador
1. Abre `http://aquafeed.com.ar`
2. Inicia sesión
3. Ve al Dashboard
4. Deberías ver:
   - 🟢 "Datos en tiempo real activos" (en verde)
   - Las tarjetas de dispositivos cuando reciban datos

### Verificar en la consola del navegador
```javascript
// Abre DevTools (F12) y ve a la pestaña Console
// Deberías ver:
// 🔗 Conectando a WebSocket: http://aquafeed.com.ar
// 🔗 Conectado al WebSocket servidor
```

### Publicar datos de prueba
```bash
# En el servidor, publica datos MQTT de prueba
mosquitto_pub -h localhost -p 1883 -t "aquafeed/1/agua" \
  -m '{"temperatura":25.5,"ph":7.2,"oxigeno":8.5,"turbidez":12}'
```

## 🐛 Troubleshooting

### Si sigue sin conectar:

#### 1. Verificar logs de Nginx
```bash
sudo tail -f /var/log/nginx/error.log
```

#### 2. Verificar que Node.js esté corriendo
```bash
ps aux | grep node
netstat -tlnp | grep 3000
```

#### 3. Verificar firewall (Security Groups en AWS)
Asegúrate de que el puerto 80 (HTTP) esté abierto:
- En AWS Console → EC2 → Security Groups
- Debe tener regla: HTTP (80) desde 0.0.0.0/0

#### 4. Verificar configuración de Nginx
```bash
sudo nginx -t
cat /etc/nginx/sites-enabled/aquafeed
```

#### 5. Ver logs del servidor Node.js
```bash
# Si usas PM2
pm2 logs aquafeed-api --lines 50

# Si usas systemd
sudo journalctl -u aquafeed -n 50 -f
```

## 📝 Archivos Modificados

- ✅ `src/environments/environment.prod.ts`
- ✅ `src/environments/environment.ts`
- ✅ `src/app/services/realtime-data.service.ts`
- ✅ `nginx.conf`
- ✅ Script nuevo: `update-nginx-websocket.sh`

## ⚡ Quick Fix (Opción Alternativa)

Si no puedes actualizar Nginx inmediatamente, puedes temporalmente usar la IP directa:

En `environment.prod.ts`:
```typescript
websocketUrl: 'http://18.116.202.211:3000'
```

**Nota:** Esto requiere que el puerto 3000 esté abierto en el Security Group de AWS, lo cual NO es recomendado por seguridad. Es mejor usar Nginx como proxy.

## ✅ Verificación Final

Después del despliegue, deberías ver en el Dashboard:
1. ✅ Estado de conexión en verde
2. ✅ Tarjetas de dispositivos mostrándose
3. ✅ Datos actualizándose en tiempo real
4. ✅ Timestamps actualizándose
5. ✅ Sin errores en la consola del navegador

## 🆘 Ayuda

Si después de seguir estos pasos aún tienes problemas:
1. Revisa los logs de Nginx: `/var/log/nginx/error.log`
2. Revisa los logs de Node.js: `pm2 logs`
3. Verifica la consola del navegador (F12)
4. Asegúrate de que el build de Angular se haya ejecutado correctamente
