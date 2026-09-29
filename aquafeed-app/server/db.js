// Acceso a MariaDB/MySQL. Configuración por variables de entorno (aquafeed-app/.env):
//   DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'aquafeed',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'aquafeed',
  timezone: 'Z',            // fechas en UTC
  decimalNumbers: true,     // DECIMAL -> number en vez de string
};

const pool = mysql.createPool({ ...config, connectionLimit: 5 });

// Crea las tablas si no existen y carga datos iniciales si la base está vacía
async function init() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  const conn = await mysql.createConnection({ ...config, multipleStatements: true });
  try {
    await conn.query(schema);
  } finally {
    await conn.end();
  }

  const [[{ n }]] = await pool.query('SELECT COUNT(*) AS n FROM usuarios');
  if (n === 0) {
    await pool.query("INSERT IGNORE INTO dispositivos (id, nombre) VALUES ('1', 'AquaFeed 1')");
    await pool.query(
      `INSERT INTO usuarios (username, email, password_hash, rol, nombre, dispositivo_id) VALUES
        ('admin',   'admin@aquafeed.com',   ?, 'admin', 'Administrador',  '1'),
        ('usuario', 'usuario@aquafeed.com', ?, 'user',  'Usuario Normal', '1')`,
      [await bcrypt.hash('admin123', 10), await bcrypt.hash('user123', 10)]
    );
    console.log('🗄️  Base inicializada con usuarios de prueba (admin/admin123, usuario/user123)');
  }
}

// Mapea una fila de usuarios al formato que usa la API/JWT
function toApiUser(row) {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    role: row.rol,
    name: row.nombre,
    deviceId: row.dispositivo_id,
  };
}

async function findUserByLogin(login) {
  const [rows] = await pool.query('SELECT * FROM usuarios WHERE username = ? OR email = ? LIMIT 1', [login, login]);
  return rows[0];
}

async function listUsers() {
  const [rows] = await pool.query('SELECT * FROM usuarios ORDER BY id');
  return rows.map(toApiUser);
}

async function countUsers() {
  const [[{ n }]] = await pool.query('SELECT COUNT(*) AS n FROM usuarios');
  return n;
}

// Los dispositivos se registran solos la primera vez que publican (la ACL de Mosquitto
// ya garantiza que solo publiquen dispositivos con certificado válido)
const knownDevices = new Set();
async function ensureDevice(id) {
  if (knownDevices.has(id)) return;
  await pool.query('INSERT IGNORE INTO dispositivos (id, nombre) VALUES (?, ?)', [id, `AquaFeed ${id}`]);
  knownDevices.add(id);
}

const num = v => (v === undefined || v === null || Number.isNaN(Number(v)) ? null : Number(v));

async function saveReading(deviceId, tipo, data, fecha) {
  await ensureDevice(deviceId);
  if (tipo === 'agua') {
    await pool.query(
      'INSERT INTO lecturas_agua (dispositivo_id, temp_agua, ph, minerales, registrado_en) VALUES (?, ?, ?, ?, ?)',
      [deviceId, num(data.tempAgua), num(data.ph), num(data.minerales), fecha]
    );
  } else if (tipo === 'ambiente') {
    await pool.query(
      'INSERT INTO lecturas_ambiente (dispositivo_id, temp_amb, hum_amb, registrado_en) VALUES (?, ?, ?, ?)',
      [deviceId, num(data.tempAmb), num(data.humAmb), fecha]
    );
  }
}

async function saveFeeding(deviceId, origen, usuarioId = null, fecha = new Date()) {
  await ensureDevice(deviceId);
  await pool.query(
    'INSERT INTO alimentaciones (dispositivo_id, origen, usuario_id, registrado_en) VALUES (?, ?, ?, ?)',
    [deviceId, origen, usuarioId, fecha]
  );
}

// Historial de lecturas entre dos fechas, en el mismo formato que publica el ESP32
async function getHistory(deviceId, tipo, desde, hasta, limit) {
  const sql = tipo === 'agua'
    ? `SELECT temp_agua AS tempAgua, ph, minerales, registrado_en AS ts
         FROM lecturas_agua WHERE dispositivo_id = ? AND registrado_en BETWEEN ? AND ?
         ORDER BY registrado_en DESC LIMIT ?`
    : `SELECT temp_amb AS tempAmb, hum_amb AS humAmb, registrado_en AS ts
         FROM lecturas_ambiente WHERE dispositivo_id = ? AND registrado_en BETWEEN ? AND ?
         ORDER BY registrado_en DESC LIMIT ?`;
  const [rows] = await pool.query(sql, [deviceId, desde, hasta, limit]);
  return rows.reverse(); // orden cronológico
}

async function getFeedings(deviceId, limit) {
  const [rows] = await pool.query(
    `SELECT a.id, a.origen, a.registrado_en AS ts, u.username
       FROM alimentaciones a LEFT JOIN usuarios u ON u.id = a.usuario_id
      WHERE a.dispositivo_id = ? ORDER BY a.registrado_en DESC LIMIT ?`,
    [deviceId, limit]
  );
  return rows;
}

// Última lectura de cada tipo por dispositivo, para no arrancar con el dashboard vacío
async function getLatestState() {
  const state = {};
  const [agua] = await pool.query(
    `SELECT l.* FROM lecturas_agua l JOIN (
       SELECT dispositivo_id, MAX(registrado_en) AS m FROM lecturas_agua GROUP BY dispositivo_id
     ) u ON u.dispositivo_id = l.dispositivo_id AND u.m = l.registrado_en`
  );
  for (const r of agua) {
    (state[r.dispositivo_id] ??= {}).agua = {
      id: r.dispositivo_id, tempAgua: r.temp_agua, ph: r.ph, minerales: r.minerales, ts: r.registrado_en.toISOString(),
    };
  }
  const [amb] = await pool.query(
    `SELECT l.* FROM lecturas_ambiente l JOIN (
       SELECT dispositivo_id, MAX(registrado_en) AS m FROM lecturas_ambiente GROUP BY dispositivo_id
     ) u ON u.dispositivo_id = l.dispositivo_id AND u.m = l.registrado_en`
  );
  for (const r of amb) {
    (state[r.dispositivo_id] ??= {}).ambiente = {
      id: r.dispositivo_id, tempAmb: r.temp_amb, humAmb: r.hum_amb, ts: r.registrado_en.toISOString(),
    };
  }
  return state;
}

module.exports = {
  pool, init, toApiUser, findUserByLogin, listUsers, countUsers,
  saveReading, saveFeeding, getHistory, getFeedings, getLatestState,
};
