const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Carga variables desde aquafeed-app/.env si existe (no se versiona)
try {
  process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
} catch (e) {
  if (e.code !== 'ENOENT') console.warn('⚠️ No se pudo leer .env:', e.message);
}

const db = require('./db'); // después de cargar .env: lee DB_* al importarse

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'UCAECE2025_Aquafeed_API_Secret_Key';

// Middleware
app.use(cors({
  origin: [
    'http://35.173.129.81',       // IP pública del servidor EC2
    'http://localhost:4200',           // Desarrollo local
    'http://127.0.0.1:4200',          // Desarrollo local alternativo
    'http://aquafeed.com.ar',         // Dominio de producción
    'https://aquafeed.com.ar',        // Dominio de producción con HTTPS
    /^http:\/\/\d+\.\d+\.\d+\.\d+:4200$/, // Cualquier IP con puerto 4200
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());


// ####################
// ####################
//       MQTT 
// ####################
// ####################
// MQTT (mTLS)
const fs = require('fs');
const mqtt = require('mqtt');

const MQTT_URL  = process.env.MQTT_URL  || 'mqtts://localhost:8883';
const MQTT_CA   = process.env.MQTT_CA   || '/etc/aquafeed/mqtt/ca.crt';
const MQTT_CERT = process.env.MQTT_CLIENT_CERT || '/etc/aquafeed/mqtt/api.crt';
const MQTT_KEY  = process.env.MQTT_CLIENT_KEY  || '/etc/aquafeed/mqtt/api.key';

// Si faltan los certificados la API sigue funcionando (login, dashboard), sin datos MQTT
let tlsOptions;
try {
  tlsOptions = {
    ca:   fs.readFileSync(MQTT_CA),
    cert: fs.readFileSync(MQTT_CERT),
    key:  fs.readFileSync(MQTT_KEY),
    rejectUnauthorized: true,   // valida server.crt contra tu CA
  };
} catch (e) {
  console.error('❌ No se pudieron leer los certificados MQTT:', e.message);
}

const mqttClient = mqtt.connect(MQTT_URL, {
  ...tlsOptions,
  manualConnect: !tlsOptions, // sin certificados no intenta conectar
  protocol: 'mqtts',
  clientId: 'api',        // debe existir cert CN=api + ACL para 'api'
  keepalive: 30,
  clean: true,
  reconnectPeriod: 2000,
});

const deviceState = {}; // última lectura de cada device (se carga de la base al iniciar)

// Vista en vivo: deviceState se actualiza con cada mensaje (el ESP32 publica cada 5 s).
// Reportes: a la base va una sola lectura por dispositivo y tipo cada SAVE_INTERVAL_MS.
const SAVE_INTERVAL_MS = Number(process.env.SAVE_INTERVAL_MS) || 5 * 60 * 1000;
const lastSaved = {}; // `${id}/${tipo}` -> ms de la última lectura guardada

async function registrarLectura(id, tipo, data, ahora) {
  deviceState[id] ??= {};
  deviceState[id][tipo] = { ...data, ts: ahora.toISOString() };

  const key = `${id}/${tipo}`;
  if (ahora.getTime() - (lastSaved[key] ?? 0) < SAVE_INTERVAL_MS) return;
  lastSaved[key] = ahora.getTime();
  await db.saveReading(id, tipo, data, ahora);
}

mqttClient.on('connect', () => {
  console.log('✅ MQTT (API) conectada');
  mqttClient.subscribe([
    'aquafeed/+/agua', 'aquafeed/+/ambiente', 'aquafeed/+/alimentado',   // firmware anterior
    'aquafeed/v1/+/telemetry', 'aquafeed/v1/+/status', 'aquafeed/v1/+/event', 'aquafeed/v1/+/ack',
  ], (err, granted) => {
    if (err) return console.error('❌ Error al suscribir:', err);
    console.log('📡 Suscripto a:', granted.map(g => `${g.topic}(q${g.qos})`).join(', '));
  });
});

// Firmware v1: aquafeed/v1/{id}/{tipo}, con id = af- + MAC (ver firmware/README.md)
async function onMessageV1(id, tipo, data, ahora) {
  if (tipo === 'telemetry') {
    // Mismo formato que el firmware anterior, para que el dashboard no distinga versiones
    const agua = { id, tempAgua: data.waterTempC ?? null, ph: data.ph ?? null, tdsPpm: data.tdsPpm ?? null };
    await registrarLectura(id, 'agua', agua, ahora);
  } else if (tipo === 'status') {
    deviceState[id] ??= {};
    deviceState[id].status = { ...data, ts: ahora.toISOString() };
  } else if (tipo === 'event') {
    // Las alimentaciones pedidas desde la web ya se registran al enviar el comando
    if (data.type === 'feed' && data.source === 'button') {
      await db.saveFeeding(id, 'boton', null, ahora);
      console.log(`🐟 Alimentación por botón: Device ${id}`);
    }
  } else if (tipo === 'ack') {
    console.log(`📬 Ack de ${id}: cmd ${data.cmdId} ${data.ok ? 'ok' : 'falló'}`);
  }
}

mqttClient.on('message', async (topic, payload) => {
  const partes = topic.split('/');
  const esV1 = partes[1] === 'v1';
  const [id, tipo] = esV1 ? partes.slice(2) : partes.slice(1); // aquafeed/[v1/]{id}/{tipo}
  let data;
  try {
    data = JSON.parse(payload.toString());
  } catch (e) {
    return console.error('❌ Error parseando', topic, payload.toString(), e.message);
  }

  const ahora = new Date();
  try {
    if (esV1) return await onMessageV1(id, tipo, data, ahora);
    if (tipo === 'alimentado') {
      // El ESP32 avisa cuando se alimentó con el botón físico
      await db.saveFeeding(id, 'boton', null, ahora);
      console.log(`🐟 Alimentación por botón: Device ${id}`);
      return;
    }
    await registrarLectura(id, tipo, data, ahora);
  } catch (e) {
    console.error(`❌ Error guardando ${topic} en la base:`, e.message);
  }
});

mqttClient.on('error', e => console.error('❌ MQTT error:', e.message));
mqttClient.on('reconnect', () => console.log('🔁 MQTT reconectando…'));



// ####################
// ####################
//      FIN MQTT 
// ####################
// ####################


// Middleware para verificar JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de acceso requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido o expirado' });
    }
    req.user = user;
    next();
  });
};

// Middleware para verificar rol de administrador
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador.' });
  }
  next();
};

// Rutas

// Ruta de login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Usuario y contraseña son requeridos' });
    }

    // Buscar usuario
    const row = await db.findUserByLogin(username);

    if (!row) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, row.password_hash);

    if (!validPassword) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const user = db.toApiUser(row);

    // Generar JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role,
        email: user.email,
        name: user.name,
        deviceId: user.deviceId
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        name: user.name,
        deviceId: user.deviceId
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Ruta para verificar token
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({
    valid: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      name: req.user.name,
      deviceId: req.user.deviceId
    }
  });
});

// Ruta protegida para usuarios autenticados
app.get('/api/dashboard', authenticateToken, async (req, res) => {
  const [[{ totalFeedings }]] = await db.pool.query('SELECT COUNT(*) AS totalFeedings FROM alimentaciones');
  const [[{ activeDevices }]] = await db.pool.query(
    'SELECT COUNT(DISTINCT dispositivo_id) AS activeDevices FROM lecturas_agua WHERE registrado_en > UTC_TIMESTAMP() - INTERVAL 1 HOUR'
  );
  res.json({
    message: `Bienvenido al dashboard, ${req.user.name}!`,
    user: req.user,
    data: {
      stats: {
        totalFeedings,
        activeDevices,
        lastUpdate: new Date().toISOString()
      }
    }
  });
});

// Ruta protegida solo para administradores
app.get('/api/admin/console', authenticateToken, requireAdmin, async (req, res) => {
  res.json({
    message: `Bienvenido a la consola de administración, ${req.user.name}!`,
    user: req.user,
    data: {
      totalUsers: await db.countUsers(),
      systemHealth: 'OK',
      serverUptime: process.uptime(),
      adminFeatures: [
        'Gestión de usuarios',
        'Configuración del sistema',
        'Monitoreo de dispositivos',
        'Reportes avanzados'
      ]
    }
  });
});

// Ruta para obtener todos los usuarios (solo admin)
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  res.json({ users: await db.listUsers() });
});

// Ruta de logout (opcional, principalmente para el frontend)
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logout exitoso' });
});

// Ruta de salud del servidor
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Obtener último estado de agua/ambiente de un device
app.get('/api/devices/:id/state', authenticateToken, (req, res) => {
  const { id } = req.params;
  const state = deviceState[id] || {};
  res.json({ id, state });
});

// Obtener estado de todos los dispositivos
app.get('/api/devices/all', authenticateToken, (req, res) => {
  res.json({ devices: deviceState });
});

// Enviar comando "alimentar" al device (publica en aquafeed/{id}/alimentar)
app.post('/api/devices/:id/alimentar', authenticateToken, (req, res) => {
  const { id } = req.params;

  // Firmware v1 (id af-...): comando JSON con cmdId y porciones, que el ESP32 confirma con un ack.
  // Firmware anterior: escucha aquafeed/{id}/alimentar con el payload "alimentar".
  const esV1 = id.startsWith('af-');
  const portions = Math.min(Math.max(Number(req.body?.portions) || 1, 1), 10);
  const topic = esV1 ? `aquafeed/v1/${id}/cmd` : `aquafeed/${id}/alimentar`;
  const msg   = esV1
    ? JSON.stringify({ cmdId: crypto.randomUUID(), type: 'feed', portions })
    : 'alimentar';

  if (!mqttClient.connected) {
    return res.status(503).json({ ok: false, error: 'MQTT no conectado' });
  }

  mqttClient.publish(topic, msg, { qos: esV1 ? 1 : 0, retain: false }, async (err) => {
    if (err) {
      console.error('❌ Error publicando alimentar:', err);
      return res.status(500).json({ ok: false, error: 'MQTT publish error' });
    }
    try {
      await db.saveFeeding(id, 'web', req.user.id);
    } catch (e) {
      console.error('❌ Error registrando alimentación:', e.message);
    }
    res.json({ ok: true, topic, msg });
  });
});

// Un usuario común solo puede consultar el historial de su dispositivo
const canAccessDevice = (user, id) => user.role === 'admin' || String(user.deviceId) === String(id);

// Historial de lecturas: /api/devices/1/history?tipo=agua&horas=24
//   tipo: agua | ambiente   horas: ventana hacia atrás (default 24, máx 720)
//   o bien desde/hasta en ISO 8601; limit: máx filas (default 5000)
app.get('/api/devices/:id/history', authenticateToken, async (req, res) => {
  const { id } = req.params;
  if (!canAccessDevice(req.user, id)) return res.status(403).json({ message: 'Sin acceso a este dispositivo' });

  const tipo = req.query.tipo || 'agua';
  if (!['agua', 'ambiente'].includes(tipo)) return res.status(400).json({ message: 'tipo debe ser agua o ambiente' });

  const horas = Math.min(Number(req.query.horas) || 24, 720);
  const hasta = req.query.hasta ? new Date(req.query.hasta) : new Date();
  const desde = req.query.desde ? new Date(req.query.desde) : new Date(hasta.getTime() - horas * 3600 * 1000);
  if (isNaN(desde) || isNaN(hasta)) return res.status(400).json({ message: 'Fechas inválidas' });
  const limit = Math.min(Number(req.query.limit) || 5000, 20000);

  const lecturas = await db.getHistory(id, tipo, desde, hasta, limit);
  res.json({ id, tipo, desde, hasta, total: lecturas.length, lecturas });
});

// Últimas alimentaciones: /api/devices/1/feedings?limit=50
app.get('/api/devices/:id/feedings', authenticateToken, async (req, res) => {
  const { id } = req.params;
  if (!canAccessDevice(req.user, id)) return res.status(403).json({ message: 'Sin acceso a este dispositivo' });

  const limit = Math.min(Number(req.query.limit) || 50, 1000);
  res.json({ id, alimentaciones: await db.getFeedings(id, limit) });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Algo salió mal!' });
});

// Inicializar servidor
db.init()
  .then(() => db.getLatestState())
  .then((state) => {
    Object.assign(deviceState, state);
    console.log('🗄️  Base de datos conectada');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
      console.log(`📡 API disponible en http://localhost:${PORT}/api`);
      console.log('👤 Usuarios de prueba:');
      console.log('   Admin: username=admin, password=admin123');
      console.log('   Usuario: username=usuario, password=user123');
    });
  })
  .catch((err) => {
    console.error('❌ Error al inicializar la base de datos:', err);
    process.exit(1); // <- opcional, para indicar que hubo error real
  });

module.exports = app;
