// API v1: la que consume el frontend nuevo (frontend/). Las respuestas siguen los modelos
// de frontend/src/app/shared/models, así las pantallas no necesitan adaptar nada.
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const ZONA = 'America/Argentina/Buenos_Aires';
const ONLINE_MS = 60 * 1000;   // más de 1 minuto sin telemetría = sin conexión
const MAX_PORCIONES = 5;
const MAX_HORARIOS = 8;   // por pecera; cada uno puede repetirse varios días de la semana

// Valida el calendario que manda el frontend. Devuelve la lista normalizada o un mensaje de error.
function validarHorarios(lista) {
  if (!Array.isArray(lista)) return 'Faltan los horarios.';
  if (lista.length > MAX_HORARIOS) return `Se pueden cargar hasta ${MAX_HORARIOS} horarios por pecera.`;
  const vistos = new Set();
  const horarios = [];
  for (const h of lista) {
    const days = Array.isArray(h?.days) ? [...new Set(h.days.map(Number))].sort((a, b) => a - b) : [];
    if (days.length === 0 || days.some((d) => !Number.isInteger(d) || d < 1 || d > 7)) {
      return 'Cada horario necesita al menos un día de la semana.';
    }
    if (typeof h.time !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(h.time)) {
      return 'La hora tiene que tener el formato HH:MM.';
    }
    const portions = Number(h.portions);
    if (!Number.isInteger(portions) || portions < 1 || portions > MAX_PORCIONES) {
      return `Las porciones van de 1 a ${MAX_PORCIONES}.`;
    }
    const enabled = h.enabled !== false;
    // Dos tomas activas el mismo día a la misma hora se ejecutarían juntas
    if (enabled) {
      for (const d of days) {
        const clave = `${d}-${h.time}`;
        if (vistos.has(clave)) return `Hay dos horarios activos el mismo día a las ${h.time}.`;
        vistos.add(clave);
      }
    }
    horarios.push({ days, time: h.time, portions, enabled });
  }
  return horarios;
}

module.exports = function apiV1({
  db, deviceState, mqttClient, authenticateToken, requireAdmin, enviarAlimentar, publicarConfig, jwtSecret,
}) {
  const router = express.Router();

  // Dispositivo del frontend: fila de la base + lo último que se supo por MQTT
  const toDispositivo = (row) => {
    const vivo = deviceState[row.id] || {};
    const lastSeen = vivo.agua?.ts ?? null;
    const online = !!lastSeen
      && Date.now() - new Date(lastSeen).getTime() < ONLINE_MS
      && vivo.status?.online !== false;
    return {
      id: row.id,
      nombre: row.nombre,
      ownerId: row.usuario_id == null ? null : String(row.usuario_id),
      speciesProfileId: row.especie_id,
      tz: ZONA,
      configVersion: row.config_version ?? 0,
      // Versión del calendario que el ESP32 confirmó en su último status (null: no informó)
      configAplicada: Number.isInteger(vivo.status?.configVersion) ? vivo.status.configVersion : null,
      lastSeen,
      online,
      estado: row.usuario_id == null ? 'unclaimed' : 'claimed',
      fw: vivo.status?.fw ?? null,
      rssi: online ? vivo.status?.rssi ?? null : null,
    };
  };

  const toLectura = (id) => {
    const agua = deviceState[id]?.agua;
    if (!agua) return null;
    return {
      deviceId: id,
      ts: Math.floor(new Date(agua.ts).getTime() / 1000),
      waterTempC: agua.tempAgua ?? null,
      ph: agua.ph ?? null,
      tdsPpm: agua.tdsPpm ?? null,   // el firmware anterior manda "minerales", que no está en ppm
      sensorErrors: [],
    };
  };

  const toPecera = (row, horarios = []) => ({
    dispositivo: toDispositivo(row),
    lectura: toLectura(row.id),
    horarios,
  });

  const toDispositivoAdmin = (row) => ({
    ...toDispositivo(row),
    duenoNombre: row.dueno_nombre,
    duenoEmail: row.dueno_email,
  });

  // La pecera tiene que ser del usuario que la pide
  const peceraPropia = async (req, res) => {
    const row = await db.getDevice(req.params.id);
    if (!row || row.usuario_id !== req.user.id) {
      res.status(404).json({ message: 'No encontramos esa pecera.' });
      return null;
    }
    return row;
  };

  router.post('/auth/login', async (req, res) => {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Correo y contraseña son requeridos' });
    }

    const row = await db.findUserByLogin(String(email).trim().toLowerCase());
    if (!row || !row.activo || !(await bcrypt.compare(password, row.password_hash))) {
      return res.status(401).json({ message: 'El correo o la contraseña no coinciden.' });
    }

    // Mismo payload que /api/auth/login, para compartir authenticateToken y requireAdmin
    const user = db.toApiUser(row);
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, email: user.email, name: user.name, deviceId: user.deviceId },
      jwtSecret,
      { expiresIn: '24h' }
    );
    res.json({ token, usuario: db.toUsuario(row) });
  });

  router.get('/peceras', authenticateToken, async (req, res) => {
    const rows = await db.listDevices(req.user.id);
    const horarios = await db.listSchedules(rows.map((r) => r.id));
    res.json(rows.map((row) => toPecera(row, horarios[row.id])));
  });

  router.get('/peceras/:id', authenticateToken, async (req, res) => {
    const row = await peceraPropia(req, res);
    if (!row) return;
    const horarios = await db.listSchedules([row.id]);
    res.json(toPecera(row, horarios[row.id]));
  });

  // Reemplaza el calendario completo de la pecera y se lo manda al ESP32.
  // Si el dispositivo está apagado lo recibe al reconectarse (el mensaje queda retenido).
  router.put('/peceras/:id/horarios', authenticateToken, async (req, res) => {
    const row = await peceraPropia(req, res);
    if (!row) return;

    const horarios = validarHorarios(req.body?.horarios);
    if (typeof horarios === 'string') return res.status(400).json({ message: horarios });

    const guardado = await db.replaceSchedules(row.id, horarios);
    let enviado = false;
    try {
      enviado = mqttClient.connected && (await publicarConfig(row.id, guardado.version, guardado.horarios));
    } catch (e) {
      console.error(`❌ No se pudo publicar la config de ${row.id}:`, e.message);
    }
    res.json({ horarios: guardado.horarios, configVersion: guardado.version, enviado });
  });

  router.post('/peceras/:id/alimentar', authenticateToken, async (req, res) => {
    const row = await peceraPropia(req, res);
    if (!row) return;

    const portions = Number(req.body?.portions);
    if (!Number.isInteger(portions) || portions < 1 || portions > MAX_PORCIONES) {
      return res.status(400).json({ message: 'La cantidad de porciones no es válida.' });
    }
    if (!toDispositivo(row).online) {
      return res.status(409).json({ message: 'La pecera está sin conexión.' });
    }
    if (!mqttClient.connected) {
      return res.status(503).json({ message: 'El servidor no está conectado al broker MQTT.' });
    }

    const { cmdId } = await enviarAlimentar(row.id, portions, req.user.id);
    res.json({ cmdId, status: 'sent', portions, deviceId: row.id });
  });

  router.get('/admin/resumen', authenticateToken, requireAdmin, async (req, res) => {
    const dispositivos = (await db.listDevices()).map(toDispositivo);
    res.json({
      usuarios: await db.countUsers(),
      dispositivos: dispositivos.length,
      enLinea: dispositivos.filter((d) => d.online).length,
      sinVincular: dispositivos.filter((d) => d.estado === 'unclaimed').length,
      alertasAbiertas: 0,   // todavía no hay evaluación de alertas
      servicios: [
        { nombre: 'Backend', estado: 'ok', detalle: 'Express, respondiendo.' },
        { nombre: 'MariaDB', estado: 'ok', detalle: 'Lecturas guardadas cada 5 minutos.' },
        mqttClient.connected
          ? { nombre: 'Mosquitto', estado: 'ok', detalle: 'Broker MQTT conectado con TLS mutuo.' }
          : { nombre: 'Mosquitto', estado: 'sin-conectar', detalle: 'El backend no llega al broker MQTT.' },
      ],
    });
  });

  router.get('/admin/usuarios', authenticateToken, requireAdmin, async (req, res) => {
    res.json(await db.listUsuarios());
  });

  router.get('/admin/usuarios/:id', authenticateToken, requireAdmin, async (req, res) => {
    const row = await db.findUserById(req.params.id);
    if (!row) return res.status(404).json({ message: 'No encontramos ese usuario.' });
    res.json(db.toUsuario(row));
  });

  router.get('/admin/dispositivos', authenticateToken, requireAdmin, async (req, res) => {
    res.json((await db.listDevices()).map(toDispositivoAdmin));
  });

  router.get('/admin/dispositivos/:id', authenticateToken, requireAdmin, async (req, res) => {
    const row = await db.getDevice(req.params.id);
    if (!row) return res.status(404).json({ message: 'No encontramos ese dispositivo.' });
    res.json(toDispositivoAdmin(row));
  });

  return router;
};
