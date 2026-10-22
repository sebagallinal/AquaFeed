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
  let sinDuenos;
  try {
    // Antes de aplicar el esquema: ¿la base todavía no tiene dueño por dispositivo?
    const [[{ c }]] = await conn.query(
      `SELECT COUNT(*) AS c FROM information_schema.columns
        WHERE table_schema = DATABASE() AND table_name = 'dispositivos' AND column_name = 'usuario_id'`
    );
    sinDuenos = c === 0;
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
      [await bcrypt.hash('admin123', 10), await bcrypt.hash('user1234', 10)]
    );
    console.log('🗄️  Base inicializada con usuarios de prueba (admin/admin123, usuario/user1234)');
  }

  // Una sola vez: el dueño de cada dispositivo sale del usuario común que lo tenía asignado
  if (sinDuenos) {
    await pool.query(
      `UPDATE dispositivos d JOIN usuarios u ON u.dispositivo_id = d.id AND u.rol = 'user'
          SET d.usuario_id = u.id`
    );
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

// Usuario en el formato del frontend nuevo (frontend/src/app/shared/models/usuario.model.ts)
function toUsuario(row) {
  return { id: String(row.id), nombre: row.nombre, email: row.email, rol: row.rol, activo: !!row.activo };
}

async function listUsuarios() {
  const [rows] = await pool.query('SELECT * FROM usuarios ORDER BY nombre');
  return rows.map(toUsuario);
}

async function findUserById(id) {
  const [rows] = await pool.query('SELECT * FROM usuarios WHERE id = ? LIMIT 1', [id]);
  return rows[0];
}

const SELECT_DISPOSITIVO =
  `SELECT d.id, d.nombre, d.usuario_id, d.especie_id, d.config_version,
          u.nombre AS dueno_nombre, u.email AS dueno_email
     FROM dispositivos d LEFT JOIN usuarios u ON u.id = d.usuario_id`;

// Dispositivos de un dueño, o todos si no se pasa ownerId
async function listDevices(ownerId) {
  const [rows] = ownerId === undefined
    ? await pool.query(`${SELECT_DISPOSITIVO} ORDER BY d.nombre`)
    : await pool.query(`${SELECT_DISPOSITIVO} WHERE d.usuario_id = ? ORDER BY d.nombre`, [ownerId]);
  return rows;
}

async function getDevice(id) {
  const [rows] = await pool.query(`${SELECT_DISPOSITIVO} WHERE d.id = ? LIMIT 1`, [id]);
  return rows[0];
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
      'INSERT INTO lecturas_agua (dispositivo_id, temp_agua, ph, minerales, tds_ppm, registrado_en) VALUES (?, ?, ?, ?, ?, ?)',
      [deviceId, num(data.tempAgua), num(data.ph), num(data.minerales), num(data.tdsPpm), fecha]
    );
  } else if (tipo === 'ambiente') {
    await pool.query(
      'INSERT INTO lecturas_ambiente (dispositivo_id, temp_amb, hum_amb, registrado_en) VALUES (?, ?, ?, ?)',
      [deviceId, num(data.tempAmb), num(data.humAmb), fecha]
    );
  }
}

async function saveFeeding(deviceId, origen, usuarioId = null, fecha = new Date(), porciones = null) {
  await ensureDevice(deviceId);
  await pool.query(
    'INSERT INTO alimentaciones (dispositivo_id, origen, porciones, usuario_id, registrado_en) VALUES (?, ?, ?, ?, ?)',
    [deviceId, origen, porciones, usuarioId, fecha]
  );
}

// Horario en el formato del frontend (frontend/src/app/shared/models/horario.model.ts)
const toHorario = (row) => ({
  id: String(row.id),
  deviceId: row.dispositivo_id,
  days: row.dias.split(',').map(Number),
  time: row.hora,
  portions: row.porciones,
  enabled: !!row.activo,
});

// Horarios de varios dispositivos de una vez: { [deviceId]: Horario[] }
async function listSchedules(deviceIds) {
  const porDispositivo = Object.fromEntries(deviceIds.map((id) => [id, []]));
  if (deviceIds.length === 0) return porDispositivo;
  const [rows] = await pool.query(
    'SELECT * FROM horarios WHERE dispositivo_id IN (?) ORDER BY hora, id',
    [deviceIds]
  );
  for (const row of rows) porDispositivo[row.dispositivo_id].push(toHorario(row));
  return porDispositivo;
}

// Reemplaza el calendario completo y sube la versión. Devuelve { horarios, version }.
async function replaceSchedules(deviceId, horarios) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM horarios WHERE dispositivo_id = ?', [deviceId]);
    for (const h of horarios) {
      await conn.query(
        'INSERT INTO horarios (dispositivo_id, dias, hora, porciones, activo) VALUES (?, ?, ?, ?, ?)',
        [deviceId, h.days.join(','), h.time, h.portions, h.enabled ? 1 : 0]
      );
    }
    await conn.query('UPDATE dispositivos SET config_version = config_version + 1 WHERE id = ?', [deviceId]);
    const [[{ config_version: version }]] = await conn.query(
      'SELECT config_version FROM dispositivos WHERE id = ?', [deviceId]
    );
    await conn.commit();
    return { horarios: (await listSchedules([deviceId]))[deviceId], version };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

// Historial de lecturas entre dos fechas, en el mismo formato que publica el ESP32
async function getHistory(deviceId, tipo, desde, hasta, limit) {
  const sql = tipo === 'agua'
    ? `SELECT temp_agua AS tempAgua, ph, minerales, tds_ppm AS tdsPpm, registrado_en AS ts
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
    `SELECT a.id, a.origen, a.porciones, a.registrado_en AS ts, u.username
       FROM alimentaciones a LEFT JOIN usuarios u ON u.id = a.usuario_id
      WHERE a.dispositivo_id = ? ORDER BY a.registrado_en DESC LIMIT ?`,
    [deviceId, limit]
  );
  return rows;
}

// Datos crudos de un período para los reportes del frontend. Las lecturas van como
// [ts, temp, ph, tds] (ts en segundos) para que 30 días entren en pocos cientos de KB.
async function getReport(deviceId, desde, hasta) {
  const [lecturas] = await pool.query(
    `SELECT registrado_en, temp_agua, ph, tds_ppm
       FROM lecturas_agua WHERE dispositivo_id = ? AND registrado_en BETWEEN ? AND ?
      ORDER BY registrado_en`,
    [deviceId, desde, hasta]
  );
  const [alimentaciones] = await pool.query(
    `SELECT registrado_en, origen, porciones
       FROM alimentaciones WHERE dispositivo_id = ? AND registrado_en BETWEEN ? AND ?
      ORDER BY registrado_en`,
    [deviceId, desde, hasta]
  );
  // registrado_en se guarda en UTC y el pool lo lee como UTC (timezone: 'Z')
  const seg = (fecha) => Math.floor(fecha.getTime() / 1000);
  return {
    lecturas: lecturas.map((r) => [seg(r.registrado_en), r.temp_agua, r.ph, r.tds_ppm]),
    alimentaciones: alimentaciones.map((r) => ({
      ts: seg(r.registrado_en), origen: r.origen, porciones: r.porciones,
    })),
  };
}

// Nombre y especie que elige el dueño. Solo cambia lo que viene definido.
async function updateDevice(id, { nombre, especieId }) {
  if (nombre !== undefined) {
    await pool.query('UPDATE dispositivos SET nombre = ? WHERE id = ?', [nombre, id]);
  }
  if (especieId !== undefined) {
    await pool.query('UPDATE dispositivos SET especie_id = ? WHERE id = ?', [especieId, id]);
  }
}

// ---------- Alertas ----------

// Sin fila guardada: solo avisa si se desconecta más de 10 minutos
const CONFIG_ALERTAS_DEFECTO = {
  tempMin: null, tempMax: null, phMin: null, phMax: null, tdsMin: null, tdsMax: null, offlineMin: 10,
  tempEspecie: false, phEspecie: false, tdsEspecie: false,
};

const toConfigAlertas = (r) => ({
  tempMin: r.temp_min, tempMax: r.temp_max,
  phMin: r.ph_min, phMax: r.ph_max,
  tdsMin: r.tds_min, tdsMax: r.tds_max,
  offlineMin: r.offline_min,
  tempEspecie: !!r.temp_especie, phEspecie: !!r.ph_especie, tdsEspecie: !!r.tds_especie,
});

// { [deviceId]: config } con la configuración guardada de cada dispositivo
async function listAlertConfigs() {
  const [rows] = await pool.query('SELECT * FROM config_alertas');
  return Object.fromEntries(rows.map((r) => [r.dispositivo_id, toConfigAlertas(r)]));
}

async function getAlertConfig(deviceId) {
  const [rows] = await pool.query('SELECT * FROM config_alertas WHERE dispositivo_id = ?', [deviceId]);
  return rows[0] ? toConfigAlertas(rows[0]) : { ...CONFIG_ALERTAS_DEFECTO };
}

async function saveAlertConfig(deviceId, c) {
  await pool.query(
    `INSERT INTO config_alertas (dispositivo_id, temp_min, temp_max, ph_min, ph_max, tds_min, tds_max,
       offline_min, temp_especie, ph_especie, tds_especie)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE temp_min = VALUES(temp_min), temp_max = VALUES(temp_max),
       ph_min = VALUES(ph_min), ph_max = VALUES(ph_max), tds_min = VALUES(tds_min),
       tds_max = VALUES(tds_max), offline_min = VALUES(offline_min),
       temp_especie = VALUES(temp_especie), ph_especie = VALUES(ph_especie), tds_especie = VALUES(tds_especie)`,
    [deviceId, c.tempMin, c.tempMax, c.phMin, c.phMax, c.tdsMin, c.tdsMax, c.offlineMin,
      c.tempEspecie ? 1 : 0, c.phEspecie ? 1 : 0, c.tdsEspecie ? 1 : 0]
  );
}

async function openAlert({ deviceId, tipo, parametro = null, mensaje, valor = null, fecha }) {
  const [r] = await pool.query(
    `INSERT INTO alertas (dispositivo_id, tipo, parametro, mensaje, valor, abierta_en)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [deviceId, tipo, parametro, mensaje, valor, fecha]
  );
  return r.insertId;
}

async function closeAlert(id, fecha) {
  await pool.query(
    "UPDATE alertas SET estado = 'cerrada', cerrada_en = ? WHERE id = ? AND estado <> 'cerrada'",
    [fecha, id]
  );
}

// Alertas que siguen pasando (abiertas o reconocidas), para retomar el estado al reiniciar
async function listActiveAlerts() {
  const [rows] = await pool.query("SELECT * FROM alertas WHERE estado <> 'cerrada'");
  return rows;
}

const toAlerta = (r) => ({
  id: String(r.id),
  deviceId: r.dispositivo_id,
  tipo: r.tipo,
  estado: r.estado,
  mensaje: r.mensaje,
  abiertaEn: r.abierta_en.toISOString(),
  cerradaEn: r.cerrada_en ? r.cerrada_en.toISOString() : null,
  ...(r.parametro ? { parametro: r.parametro } : {}),
  nombrePecera: r.nombre_pecera,
});

// Las que siguen pasando y las cerradas de los últimos 30 días; de un dueño o de todos
async function listAlerts(ownerId) {
  const [rows] = await pool.query(
    `SELECT a.*, d.nombre AS nombre_pecera FROM alertas a JOIN dispositivos d ON d.id = a.dispositivo_id
      WHERE (a.estado <> 'cerrada' OR a.cerrada_en > UTC_TIMESTAMP() - INTERVAL 30 DAY)
        ${ownerId === undefined ? '' : 'AND d.usuario_id = ?'}
      ORDER BY (a.estado = 'cerrada'), a.abierta_en DESC LIMIT 200`,
    ownerId === undefined ? [] : [ownerId]
  );
  return rows.map(toAlerta);
}

// Pasa a reconocida solo si es del dueño y sigue abierta. Devuelve true si la encontró.
async function acknowledgeAlert(id, ownerId) {
  const [r] = await pool.query(
    `UPDATE alertas a JOIN dispositivos d ON d.id = a.dispositivo_id
        SET a.estado = 'reconocida', a.reconocida_en = UTC_TIMESTAMP(3)
      WHERE a.id = ? AND d.usuario_id = ? AND a.estado = 'abierta'`,
    [id, ownerId]
  );
  return r.affectedRows > 0;
}

async function countOpenAlerts() {
  const [[{ n }]] = await pool.query("SELECT COUNT(*) AS n FROM alertas WHERE estado = 'abierta'");
  return n;
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
      id: r.dispositivo_id, tempAgua: r.temp_agua, ph: r.ph, minerales: r.minerales, tdsPpm: r.tds_ppm,
      ts: r.registrado_en.toISOString(),
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
  toUsuario, listUsuarios, findUserById, listDevices, getDevice,
  saveReading, saveFeeding, getHistory, getFeedings, getLatestState,
  listSchedules, replaceSchedules, getReport, updateDevice,
  CONFIG_ALERTAS_DEFECTO, listAlertConfigs, getAlertConfig, saveAlertConfig,
  openAlert, closeAlert, listActiveAlerts, listAlerts, acknowledgeAlert, countOpenAlerts,
};
