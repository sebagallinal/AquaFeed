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

// Rangos posibles de cada sensor: un valor fuera de esto es un error de tipeo, no un límite
const LIMITES_ALERTA = {
  temp: { min: -5, max: 50, nombre: 'temperatura' },
  ph: { min: 0, max: 14, nombre: 'pH' },
  tds: { min: 0, max: 5000, nombre: 'TDS' },
};

// Valida la configuración de alertas. Devuelve la config normalizada o un mensaje de error.
function validarConfigAlertas(body) {
  const config = {};
  for (const [clave, rango] of Object.entries(LIMITES_ALERTA)) {
    for (const lado of ['Min', 'Max']) {
      const crudo = body?.[`${clave}${lado}`];
      if (crudo === null || crudo === undefined || crudo === '') {
        config[`${clave}${lado}`] = null;
        continue;
      }
      const valor = Number(crudo);
      if (!Number.isFinite(valor) || valor < rango.min || valor > rango.max) {
        return `Los límites de ${rango.nombre} van de ${rango.min} a ${rango.max}.`;
      }
      config[`${clave}${lado}`] = Math.round(valor * 100) / 100;
    }
    config[`${clave}Especie`] = body?.[`${clave}Especie`] === true;
    const min = config[`${clave}Min`];
    const max = config[`${clave}Max`];
    if (min !== null && max !== null && min >= max) {
      return `En ${rango.nombre}, el mínimo tiene que ser menor que el máximo.`;
    }
  }
  const offline = body?.offlineMin;
  if (offline === null || offline === undefined || offline === '') {
    config.offlineMin = null;
  } else if (!Number.isInteger(Number(offline)) || offline < 2 || offline > 1440) {
    return 'El aviso de desconexión va de 2 minutos a 24 horas.';
  } else {
    config.offlineMin = Number(offline);
  }
  return config;
}

module.exports = function apiV1({
  db, deviceState, mqttClient, authenticateToken, requireAdmin, enviarAlimentar, publicarConfig, alertas,
  jwtSecret,
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

  // El dueño cambia su propia contraseña. La actual tiene que coincidir.
  router.patch('/cuenta/clave', authenticateToken, async (req, res) => {
    const passwordActual = String(req.body?.passwordActual ?? '');
    const password = String(req.body?.password ?? '');
    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({ message: 'La contraseña tiene que tener entre 8 y 72 caracteres.' });
    }
    if (password === passwordActual) {
      return res.status(400).json({ message: 'La nueva contraseña tiene que ser distinta de la actual.' });
    }
    const row = await db.findUserById(req.user.id);
    if (!row || !(await bcrypt.compare(passwordActual, row.password_hash))) {
      return res.status(401).json({ message: 'La contraseña actual no coincide.' });
    }
    await db.updateUser(row.id, { password });
    res.json({ ok: true });
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

  // El dueño cambia el nombre o la especie. La especie es el id de un perfil del frontend.
  router.patch('/peceras/:id', authenticateToken, async (req, res) => {
    const row = await peceraPropia(req, res);
    if (!row) return;
    const cambios = {};
    if (req.body?.nombre !== undefined) {
      const nombre = String(req.body.nombre).trim().replace(/\s+/g, ' ');
      if (nombre.length < 1 || nombre.length > 60) {
        return res.status(400).json({ message: 'El nombre tiene que tener entre 1 y 60 caracteres.' });
      }
      cambios.nombre = nombre;
    }
    if (req.body?.especieId !== undefined) {
      const especieId = req.body.especieId;
      if (especieId !== null && !/^[a-z0-9-]{1,64}$/.test(String(especieId))) {
        return res.status(400).json({ message: 'La especie no es válida.' });
      }
      cambios.especieId = especieId;
    }
    await db.updateDevice(row.id, cambios);
    const horarios = await db.listSchedules([row.id]);
    res.json(toPecera(await db.getDevice(row.id), horarios[row.id]));
  });

  router.get('/peceras/:id/alertas', authenticateToken, async (req, res) => {
    const row = await peceraPropia(req, res);
    if (row) res.json(await db.getAlertConfig(row.id));
  });

  router.put('/peceras/:id/alertas', authenticateToken, async (req, res) => {
    const row = await peceraPropia(req, res);
    if (!row) return;
    const config = validarConfigAlertas(req.body);
    if (typeof config === 'string') return res.status(400).json({ message: config });
    await alertas.configurar(row.id, config);
    res.json(config);
  });

  router.get('/alertas', authenticateToken, async (req, res) => {
    res.json(await db.listAlerts(req.user.id));
  });

  router.post('/alertas/:id/reconocer', authenticateToken, async (req, res) => {
    if (!(await db.acknowledgeAlert(req.params.id, req.user.id))) {
      return res.status(404).json({ message: 'No encontramos esa alerta abierta.' });
    }
    res.status(204).end();
  });

  // Reportes: lecturas y alimentaciones de las últimas 24 h, 7 o 30 días.
  // Los rangos de cada especie viven en el frontend, así que los cálculos se hacen allá.
  router.get('/peceras/:id/reportes', authenticateToken, async (req, res) => {
    const row = await peceraPropia(req, res);
    if (!row) return;
    const dias = Number(req.query.dias);
    if (![1, 7, 30].includes(dias)) {
      return res.status(400).json({ message: 'El período tiene que ser 1, 7 o 30 días.' });
    }
    const hasta = new Date();
    const desde = new Date(hasta.getTime() - dias * 24 * 3600 * 1000);
    const datos = await db.getReport(row.id, desde, hasta);
    res.json({
      deviceId: row.id,
      dias,
      desde: Math.floor(desde.getTime() / 1000),
      hasta: Math.floor(hasta.getTime() / 1000),
      ...datos,
    });
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
      alertasAbiertas: await db.countOpenAlerts(),
      servicios: [
        { nombre: 'Backend', estado: 'ok', detalle: 'Express, respondiendo.' },
        { nombre: 'MariaDB', estado: 'ok', detalle: 'Lecturas guardadas cada 5 minutos.' },
        mqttClient.connected
          ? { nombre: 'Mosquitto', estado: 'ok', detalle: 'Broker MQTT conectado con TLS mutuo.' }
          : { nombre: 'Mosquitto', estado: 'sin-conectar', detalle: 'El backend no llega al broker MQTT.' },
      ],
    });
  });

  // ---------- Administración: usuarios ----------

  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Valida los campos que vengan. Con nuevo = true, nombre, correo y contraseña son obligatorios.
  function validarUsuario(body, nuevo) {
    const datos = {};
    if (nuevo || body?.nombre !== undefined) {
      const nombre = String(body?.nombre ?? '').trim().replace(/\s+/g, ' ');
      if (nombre.length < 2 || nombre.length > 100) return 'El nombre tiene que tener entre 2 y 100 caracteres.';
      datos.nombre = nombre;
    }
    if (nuevo || body?.email !== undefined) {
      const email = String(body?.email ?? '').trim().toLowerCase();
      if (!EMAIL.test(email) || email.length > 100) return 'El correo no es válido.';
      datos.email = email;
    }
    if (nuevo || body?.password !== undefined) {
      const password = String(body?.password ?? '');
      if (password.length < 8 || password.length > 72) return 'La contraseña tiene que tener entre 8 y 72 caracteres.';
      datos.password = password;
    }
    if (nuevo || body?.rol !== undefined) {
      const rol = body?.rol ?? 'user';
      if (!['admin', 'user'].includes(rol)) return 'El rol no es válido.';
      datos.rol = rol;
    }
    if (!nuevo && body?.activo !== undefined) {
      if (typeof body.activo !== 'boolean') return 'El estado no es válido.';
      datos.activo = body.activo;
    }
    return datos;
  }

  router.post('/admin/usuarios', authenticateToken, requireAdmin, async (req, res) => {
    const datos = validarUsuario(req.body, true);
    if (typeof datos === 'string') return res.status(400).json({ message: datos });
    if (await db.findUserByEmail(datos.email)) {
      return res.status(409).json({ message: 'Ya hay una cuenta con ese correo.' });
    }
    const row = await db.createUser(datos);
    res.status(201).json(db.toUsuario(row));
  });

  router.patch('/admin/usuarios/:id', authenticateToken, requireAdmin, async (req, res) => {
    const row = await db.findUserById(req.params.id);
    if (!row) return res.status(404).json({ message: 'No encontramos ese usuario.' });
    const datos = validarUsuario(req.body, false);
    if (typeof datos === 'string') return res.status(400).json({ message: datos });

    if (datos.email && datos.email !== row.email) {
      const otro = await db.findUserByEmail(datos.email);
      if (otro && otro.id !== row.id) return res.status(409).json({ message: 'Ya hay una cuenta con ese correo.' });
    }
    // Que siempre quede al menos un admin activo, y que nadie se saque el acceso a sí mismo
    const dejaDeSerAdmin = row.rol === 'admin' && row.activo &&
      ((datos.rol && datos.rol !== 'admin') || datos.activo === false);
    if (dejaDeSerAdmin && row.id === req.user.id) {
      return res.status(409).json({ message: 'No podés sacarte el acceso de administrador a vos mismo.' });
    }
    if (dejaDeSerAdmin && (await db.countActiveAdmins()) <= 1) {
      return res.status(409).json({ message: 'Tiene que quedar al menos un administrador activo.' });
    }

    const actualizado = await db.updateUser(row.id, datos);
    db.forgetAccountState(row.id);
    res.json(db.toUsuario(actualizado));
  });

  // ---------- Administración: dispositivos ----------

  const ID_DISPOSITIVO = /^af-[0-9a-f]{12}$/;

  // usuarioId: id de un usuario activo, o null para dejar la placa sin dueño
  async function validarDueno(usuarioId) {
    if (usuarioId === null || usuarioId === undefined || usuarioId === '') return { usuarioId: null };
    const dueno = await db.findUserById(usuarioId);
    if (!dueno || !dueno.activo) return 'Ese usuario no existe o está deshabilitado.';
    return { usuarioId: dueno.id };
  }

  // Alta de una placa que todavía no se conectó. El ID sale del monitor serie al grabarla.
  router.post('/admin/dispositivos', authenticateToken, requireAdmin, async (req, res) => {
    const id = String(req.body?.id ?? '').trim().toLowerCase();
    if (!ID_DISPOSITIVO.test(id)) {
      return res.status(400).json({ message: 'El ID tiene que ser af- seguido de 12 caracteres hexadecimales (la MAC).' });
    }
    if (await db.getDevice(id)) return res.status(409).json({ message: 'Ese dispositivo ya está registrado.' });
    const dueno = await validarDueno(req.body?.usuarioId);
    if (typeof dueno === 'string') return res.status(400).json({ message: dueno });
    const nombre = String(req.body?.nombre ?? '').trim().replace(/\s+/g, ' ') || `AquaFeed ${id}`;
    if (nombre.length > 60) return res.status(400).json({ message: 'El nombre puede tener hasta 60 caracteres.' });
    await db.createDevice(id, nombre, dueno.usuarioId);
    res.status(201).json(toDispositivoAdmin(await db.getDevice(id)));
  });

  // Cambia el dueño (o lo quita con usuarioId: null)
  router.patch('/admin/dispositivos/:id', authenticateToken, requireAdmin, async (req, res) => {
    const row = await db.getDevice(req.params.id);
    if (!row) return res.status(404).json({ message: 'No encontramos ese dispositivo.' });
    if (req.body?.usuarioId === undefined) return res.status(400).json({ message: 'Falta el usuario.' });
    const dueno = await validarDueno(req.body.usuarioId);
    if (typeof dueno === 'string') return res.status(400).json({ message: dueno });
    await db.assignDevice(row.id, dueno.usuarioId);
    res.json(toDispositivoAdmin(await db.getDevice(row.id)));
  });

  router.get('/admin/alertas', authenticateToken, requireAdmin, async (req, res) => {
    res.json(await db.listAlerts());
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
