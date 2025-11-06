# ✅ Solución Final - WebSocket (Frontend y Backend en el mismo servidor)

## 🎯 Situación
- ✅ Frontend: Servido por Nginx en `http://aquafeed.com.ar`
- ✅ Backend: Node.js en `localhost:3000` (proxy via Nginx en `/api`)
- ✅ Ambos en el **mismo servidor**

## 🔧 Configuración Necesaria

### Opción A: Tu Nginx YA tiene la configuración de WebSocket

Si al revisar tu archivo nginx en el servidor (en `/etc/nginx/sites-available/aquafeed` o `/etc/nginx/nginx.conf`) **ya tiene** esta sección:

```nginx
location /socket.io/ {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    # ... más configuración
}
```

**Entonces solo necesitas:**

1. Hacer build de la aplicación:
```bash
npm run build
```

2. Subir al servidor y listo:
```bash
git add .
git commit -m "Fix: WebSocket connection for production"
git push

# En el servidor
cd /home/ec2-user/aquafeed-app
git pull
npm run build
```

---

### Opción B: Tu Nginx NO tiene la configuración de WebSocket

Si tu archivo nginx en el servidor **NO tiene** la sección `/socket.io/`, necesitas agregarla:

**En el servidor (via SSH):**

```bash
# Editar configuración de nginx
sudo nano /etc/nginx/sites-available/aquafeed

# Agregar DESPUÉS de la sección /api y ANTES de cerrar el server block:
```

```nginx
    # WebSocket/Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
```

**Luego:**
```bash
# Verificar configuración
sudo nginx -t

# Si está OK, reiniciar nginx
sudo systemctl restart nginx

# Verificar estado
sudo systemctl status nginx
```

## 🚀 Despliegue (Ambas opciones)

```bash
# 1. Build local
npm run build

# 2. Commit y push
git add .
git commit -m "Fix: WebSocket connection for production"
git push

# 3. En el servidor
ssh ec2-user@aquafeed.com.ar
cd /home/ec2-user/aquafeed-app
git pull
npm run build

# 4. Reiniciar PM2 (si es necesario)
pm2 restart aquafeed-api
```

## ✅ Verificación

1. Abre `http://aquafeed.com.ar`
2. Inicia sesión y ve al Dashboard
3. Deberías ver en la consola del navegador (F12):
   ```
   🔗 Conectando a WebSocket: http://aquafeed.com.ar
   🔗 Conectado al WebSocket servidor
   ```
4. El indicador debe mostrar: 🟢 **"Datos en tiempo real activos"**

## 🧪 Prueba

Para verificar que funciona, publica datos de prueba:

```bash
# En el servidor
mosquitto_pub -h localhost -p 1883 -t "aquafeed/1/agua" \
  -m '{"temperatura":25.5,"ph":7.2,"oxigeno":8.5,"turbidez":12}'
```

Los datos deberían aparecer **inmediatamente** en el dashboard.

## 🎯 Ventajas de esta solución

- ✅ **Sin abrir puertos adicionales** (todo va por el puerto 80 de Nginx)
- ✅ **Más seguro** (solo el puerto 80/443 está expuesto)
- ✅ **Más limpio** (todo el tráfico pasa por Nginx)
- ✅ **Funciona con HTTPS** (cuando lo configures en el futuro)

## 🐛 Troubleshooting

### Si no conecta:

1. **Verificar que nginx tenga la configuración de `/socket.io/`:**
   ```bash
   sudo cat /etc/nginx/sites-available/aquafeed | grep socket.io
   ```

2. **Ver logs de Nginx:**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Ver logs de Node.js:**
   ```bash
   pm2 logs aquafeed-api
   ```

4. **Verificar en la consola del navegador:**
   - F12 → Console
   - Busca errores relacionados con WebSocket o socket.io

---

## 📝 Resumen de Archivos Modificados

- ✅ `src/environments/environment.prod.ts` → `websocketUrl: 'http://aquafeed.com.ar'`
- ⚠️ Nginx (solo si no tenía la configuración de `/socket.io/`)
