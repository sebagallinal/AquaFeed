const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'tu_clave_secreta_jwt_muy_segura_aqui';

// Middleware
app.use(cors({
  origin: [
    'http://18.116.202.211',      // IP pública del servidor EC2
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

// Base de datos simulada en memoria (en producción usar una base de datos real)
const users = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@aquafeed.com',
    password: '$2a$10$mZ8eHKZfOJHXYXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', // password: admin123
    role: 'admin',
    name: 'Administrador'
  },
  {
    id: 2,
    username: 'usuario',
    email: 'usuario@aquafeed.com',
    password: '$2a$10$mZ8eHKZfOJHXYXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', // password: user123
    role: 'user',
    name: 'Usuario Normal'
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
        name: user.name
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
        name: user.name
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
      name: req.user.name
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

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Algo salió mal!' });
});

// Inicializar servidor
initializeUsers().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
    console.log(`📡 API disponible en http://localhost:${PORT}/api`);
    console.log('👤 Usuarios de prueba:');
    console.log('   Admin: username=admin, password=admin123');
    console.log('   Usuario: username=usuario, password=user123');
  });
});

module.exports = app;
