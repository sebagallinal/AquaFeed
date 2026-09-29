const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Carga variables desde aquafeed-app/.env si existe (no se versiona)
try {
  process.loadEnvFile(require('path').join(__dirname, '..', '.env'));
} catch (e) {
  if (e.code !== 'ENOENT') console.warn('⚠️ No se pudo leer .env:', e.message);
}

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

const deviceState = {}; // cache simple en memoria

mqttClient.on('connect', () => {
  console.log('✅ MQTT (API) conectada');
  mqttClient.subscribe(['aquafeed/+/agua', 'aquafeed/+/ambiente'], (err, granted) => {
    if (err) return console.error('❌ Error al suscribir:', err);
    console.log('📡 Suscripto a:', granted.map(g => `${g.topic}(q${g.qos})`).join(', '));
  });
});

mqttClient.on('message', (topic, payload) => {
  try {
    const data = JSON.parse(payload.toString());
    const [_, id, tipo] = topic.split('/'); // aquafeed/{id}/{tipo}
    deviceState[id] ??= {};
    deviceState[id][tipo] = { ...data, ts: new Date().toISOString() };
    
    console.log(`📡 Datos recibidos: Device ${id} - ${tipo}`, data);
  } catch (e) {
    console.error('❌ Error parseando', topic, payload.toString(), e);
  }
});

mqttClient.on('error', e => console.error('❌ MQTT error:', e.message));
mqttClient.on('reconnect', () => console.log('🔁 MQTT reconectando…'));



// ####################
// ####################
//      FIN MQTT 
// ####################
// ####################

// Base de datos simulada en memoria (en producción usar una base de datos real)
const users = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@aquafeed.com',
    password: '$2a$10$mZ8eHKZfOJHXYXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', // password: admin123
    role: 'admin',
    name: 'Administrador',
    deviceId: '1'  // Device asignado al admin
  },
  {
    id: 2,
    username: 'usuario',
    email: 'usuario@aquafeed.com',
    password: '$2a$10$mZ8eHKZfOJHXYXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', // password: user123
    role: 'user',
    name: 'Usuario Normal',
    deviceId: '1'  // Device asignado al usuario
  }
];

// Función para hashear contraseñas (para crear usuarios de prueba)
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

// Inicializar contraseñas hasheadas
async function initializeUsers() {
  users[0].password = await hashPassword('admin123');
  users[1].password = await hashPassword('user123');
}

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
    const user = users.find(u => u.username === username || u.email === username);
    
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

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
app.get('/api/dashboard', authenticateToken, (req, res) => {
  res.json({
    message: `Bienvenido al dashboard, ${req.user.name}!`,
    user: req.user,
    data: {
      stats: {
        totalFeedings: 45,
        activeDevices: 8,
        lastUpdate: new Date().toISOString()
      }
    }
  });
});

// Ruta protegida solo para administradores
app.get('/api/admin/console', authenticateToken, requireAdmin, (req, res) => {
  res.json({
    message: `Bienvenido a la consola de administración, ${req.user.name}!`,
    user: req.user,
    data: {
      totalUsers: users.length,
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
app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
  const usersWithoutPasswords = users.map(user => ({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    name: user.name
  }));
  
  res.json({ users: usersWithoutPasswords });
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

  // Tu ESP32 escucha exactamente este topic y el payload "alimentar"
  const topic = `aquafeed/${id}/alimentar`;
  const msg   = 'alimentar';

  if (!mqttClient.connected) {
    return res.status(503).json({ ok: false, error: 'MQTT no conectado' });
  }

  mqttClient.publish(topic, msg, { qos: 0, retain: false }, (err) => {
    if (err) {
      console.error('❌ Error publicando alimentar:', err);
      return res.status(500).json({ ok: false, error: 'MQTT publish error' });
    }
    res.json({ ok: true, topic, msg });
  });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Algo salió mal!' });
});

// Inicializar servidor
initializeUsers()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
      console.log(`📡 API disponible en http://localhost:${PORT}/api`);
      console.log('👤 Usuarios de prueba:');
      console.log('   Admin: username=admin, password=admin123');
      console.log('   Usuario: username=usuario, password=user123');
    });
  })
  .catch((err) => {
    console.error('❌ Error al inicializar usuarios:', err);
    process.exit(1); // <- opcional, para indicar que hubo error real
  });

module.exports = app;
