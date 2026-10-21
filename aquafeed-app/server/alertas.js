// Evaluación de alertas en el backend. Las alertas quedan en la base y la web las muestra;
// más adelante se puede sumar un aviso por mail en abrir().
//
// - Parámetros: si un valor queda fuera de [min, max] durante PERSISTENCIA_MS se abre una
//   alerta; si vuelve al rango durante PERSISTENCIA_MS se cierra sola. Así una lectura con
//   ruido no abre y cierra alertas cada 5 segundos.
// - Desconexión: sin telemetría durante offlineMin minutos. Se cierra con la primera lectura.

const PERSISTENCIA_MS = 60 * 1000;
const REVISION_CONEXION_MS = 30 * 1000;

const PARAMETROS = [
  { clave: 'waterTempC', min: 'tempMin', max: 'tempMax', nombre: 'Temperatura', unidad: ' °C', decimales: 1 },
  { clave: 'ph', min: 'phMin', max: 'phMax', nombre: 'pH', unidad: '', decimales: 2 },
  { clave: 'tdsPpm', min: 'tdsMin', max: 'tdsMax', nombre: 'TDS', unidad: ' ppm', decimales: 0 },
];

const numero = (v, decimales) =>
  Number(v).toLocaleString('es-AR', { minimumFractionDigits: decimales, maximumFractionDigits: decimales });

function mensajeParametro(p, valor, cfg) {
  const alto = cfg[p.max] !== null && valor > cfg[p.max];
  const limite = alto ? cfg[p.max] : cfg[p.min];
  return `${p.nombre} ${alto ? 'alta' : 'baja'}: ${numero(valor, p.decimales)}${p.unidad} ` +
    `(${alto ? 'máximo' : 'mínimo'} ${numero(limite, p.decimales)}${p.unidad}).`;
}

module.exports = function crearAlertas({ db, deviceState, ahora = () => Date.now() }) {
  let configs = {};             // deviceId -> config guardada
  const activas = new Map();    // `${deviceId}/${tipo o parámetro}` -> id de la alerta no cerrada
  const desde = {};             // `${deviceId}/${parámetro}` -> ms desde que cambió de estado

  const config = (id) => configs[id] ?? db.CONFIG_ALERTAS_DEFECTO;

  async function abrir(id, clave, datos) {
    const alertaId = await db.openAlert({ deviceId: id, fecha: new Date(ahora()), ...datos });
    activas.set(`${id}/${clave}`, alertaId);
    console.log(`🚨 Alerta ${id}: ${datos.mensaje}`);
  }

  async function cerrar(id, clave) {
    const alertaId = activas.get(`${id}/${clave}`);
    if (alertaId === undefined) return;
    activas.delete(`${id}/${clave}`);
    await db.closeAlert(alertaId, new Date(ahora()));
    console.log(`✅ Alerta cerrada ${id}: ${clave}`);
  }

  async function init() {
    configs = await db.listAlertConfigs();
    for (const a of await db.listActiveAlerts()) {
      activas.set(`${a.dispositivo_id}/${a.tipo === 'offline' ? 'offline' : a.parametro}`, a.id);
    }
  }

  // Cada telemetría del firmware v1 (waterTempC, ph, tdsPpm)
  async function evaluarTelemetria(id, data) {
    const t = ahora();
    await cerrar(id, 'offline');

    const cfg = config(id);
    for (const p of PARAMETROS) {
      const clave = `${id}/${p.clave}`;
      const valor = data[p.clave];
      const min = cfg[p.min];
      const max = cfg[p.max];
      if (valor === null || valor === undefined || (min === null && max === null)) {
        delete desde[clave];
        continue;
      }
      const fuera = (min !== null && valor < min) || (max !== null && valor > max);
      const activa = activas.has(clave);
      // Solo se cuenta el tiempo cuando el estado es distinto al de la alerta
      if (fuera === activa) {
        delete desde[clave];
        continue;
      }
      desde[clave] ??= t;
      if (t - desde[clave] < PERSISTENCIA_MS) continue;
      delete desde[clave];
      if (fuera) {
        await abrir(id, p.clave, {
          tipo: 'parametro', parametro: p.clave, valor, mensaje: mensajeParametro(p, valor, cfg),
        });
      } else {
        await cerrar(id, p.clave);
      }
    }
  }

  async function revisarConexion() {
    const t = ahora();
    for (const [id, estado] of Object.entries(deviceState)) {
      const minutos = config(id).offlineMin;
      const ultima = estado.agua?.ts ? new Date(estado.agua.ts).getTime() : null;
      if (!id.startsWith('af-') || minutos === null || ultima === null) continue;
      if (t - ultima >= minutos * 60 * 1000 && !activas.has(`${id}/offline`)) {
        await abrir(id, 'offline', {
          tipo: 'offline',
          mensaje: `Sin conexión: no llegan datos desde hace más de ${minutos} minutos.`,
        });
      }
    }
  }

  // Al cambiar la configuración: lo que ya no se controla se cierra y se vuelve a medir de cero
  async function configurar(id, cfg) {
    await db.saveAlertConfig(id, cfg);
    configs[id] = cfg;
    for (const p of PARAMETROS) {
      delete desde[`${id}/${p.clave}`];
      if (cfg[p.min] === null && cfg[p.max] === null) await cerrar(id, p.clave);
    }
    if (cfg.offlineMin === null) await cerrar(id, 'offline');
  }

  function iniciarRevision() {
    return setInterval(() => {
      revisarConexion().catch((e) => console.error('❌ Revisando conexiones:', e.message));
    }, REVISION_CONEXION_MS);
  }

  return { init, evaluarTelemetria, revisarConexion, configurar, iniciarRevision, PERSISTENCIA_MS };
};
