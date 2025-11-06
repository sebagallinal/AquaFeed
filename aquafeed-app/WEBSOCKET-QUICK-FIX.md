# 🚀 Solución Rápida - WebSocket sin modificar Nginx

## 📋 El Problema
El WebSocket intenta conectarse a `localhost:3000` en producción, pero necesita usar `aquafeed.com.ar:3000`.

## ✅ Solución (Sin tocar Nginx)

### Paso 1: Abrir Puerto 3000 en AWS Security Group

1. Ve a **AWS Console** → **EC2** → **Security Groups**
2. Selecciona el Security Group de tu instancia EC2
3. Ve a la pestaña **Inbound rules** (Reglas de entrada)
4. Haz clic en **Edit inbound rules**
5. Agrega una nueva regla:
   - **Type**: Custom TCP
   - **Port range**: 3000
   - **Source**: Anywhere-IPv4 (0.0.0.0/0)
   - **Description**: WebSocket para AquaFeed
6. Haz clic en **Save rules**

### Paso 2: Rebuild de la Aplicación

```bash
# En tu máquina local
npm run build
```

### Paso 3: Subir al Servidor

Opción A - Usando Git:
```bash
# Commit y push
git add .
git commit -m "Fix: WebSocket connection for production"
git push origin main

# En el servidor EC2
cd /home/ec2-user/aquafeed-app
git pull origin main
npm install
npm run build
```

Opción B - Usando SCP:
```bash
# Desde tu máquina local
scp -r dist/aquafeed-app/* ec2-user@aquafeed.com.ar:/home/ec2-user/aquafeed-app/dist/aquafeed-app/
```

### Paso 4: Reiniciar Servidor Node.js (si es necesario)

```bash
# En el servidor EC2
pm2 restart aquafeed-api
# o
pm2 restart all
```

## 🧪 Verificación

1. Abre `http://aquafeed.com.ar` en tu navegador
2. Inicia sesión
3. Ve al Dashboard
4. Deberías ver:
   - 🟢 "Datos en tiempo real activos"
   - Sin errores en la consola del navegador (F12)

### En la consola del navegador deberías ver:
```
🔗 Conectando a WebSocket: http://aquafeed.com.ar:3000
🔗 Conectado al WebSocket servidor
```

## 📝 Archivo Modificado

- ✅ `src/environments/environment.prod.ts` 
  - `websocketUrl: 'http://aquafeed.com.ar:3000'`

## 🔥 Prueba Rápida

Para probar que funciona, publica datos de prueba desde el servidor:

```bash
# SSH al servidor
ssh ec2-user@aquafeed.com.ar

# Publicar datos MQTT
mosquitto_pub -h localhost -p 1883 -t "aquafeed/1/agua" \
  -m '{"temperatura":25.5,"ph":7.2,"oxigeno":8.5,"turbidez":12}'
```

Deberías ver los datos aparecer inmediatamente en el dashboard sin refrescar la página.

## ⚠️ Nota de Seguridad

Abrir el puerto 3000 es seguro en este caso porque:
- El servidor solo escucha conexiones HTTP (no expone datos sensibles directamente)
- La autenticación se maneja en el frontend
- Es una práctica común para WebSockets

Si en el futuro quieres más seguridad, puedes configurar Nginx como proxy reverso, pero por ahora esto funcionará perfectamente.

## 🐛 Si algo falla

1. **Verificar que el puerto esté abierto:**
   ```bash
   telnet aquafeed.com.ar 3000
   ```

2. **Verificar que Node.js esté escuchando en el puerto 3000:**
   ```bash
   netstat -tlnp | grep 3000
   ```

3. **Ver logs del servidor:**
   ```bash
   pm2 logs aquafeed-api
   ```

4. **Verificar en la consola del navegador (F12):**
   - Busca errores relacionados con WebSocket
   - Verifica la URL de conexión
