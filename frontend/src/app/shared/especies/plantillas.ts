import { ESPECIES } from '../data/especies.mock';
import type { PerfilEspecie, RangosEspecie, TipoAgua } from '../models/perfil-especie.model';

/**
 * Las fichas del catálogo viven en el frontend. Las especies propias de cada usuario se guardan en el
 * backend (privadas) y acá se arman como ficha. El almacenamiento del navegador queda solo para el modo
 * de prueba sin backend y para subir las que se guardaron ahí antes de que existiera el backend.
 */
export const CLAVE_PLANTILLAS = 'aquafeed.plantillas';

export interface NuevaPlantilla {
  nombre: string;
  tipoAgua: TipoAgua;
  tempMin: number;
  tempMax: number;
  phMin: number;
  phMax: number;
  tdsMax: number | null;
  porciones: number | null;
  tomasPorDia: number | null;
  /** Data URL de una foto ya reducida. null o ausente: dibujo genérico. */
  fotoSrc?: string | null;
}

export function plantillasDeUsuario(usuarioId: string): PerfilEspecie[] {
  return leer()[usuarioId] ?? [];
}

export function plantillaPorSlug(slug: string): PerfilEspecie | null {
  return todas().find((item) => item.slug === slug) ?? null;
}

/** Catálogo o plantilla guardada en este navegador. */
export function especiePorId(id: string | null): PerfilEspecie | null {
  if (!id) {
    return null;
  }
  return ESPECIES.find((item) => item.id === id) ?? todas().find((item) => item.id === id) ?? null;
}

export function perfilPorSlug(slug: string): PerfilEspecie | null {
  return ESPECIES.find((item) => item.slug === slug) ?? plantillaPorSlug(slug);
}

/** Devuelve el mensaje de error, o null si la plantilla se puede guardar. */
export function validarPlantilla(datos: NuevaPlantilla): string | null {
  const nombre = datos.nombre.trim().replace(/\s+/g, ' ');
  if (nombre.length < 2 || nombre.length > 40) {
    return 'El nombre tiene que tener entre 2 y 40 caracteres.';
  }
  if (datos.tipoAgua !== 'tropical' && datos.tipoAgua !== 'fria') {
    return 'Elegí si el agua es tropical o fría.';
  }
  const rango = (min: number, max: number, piso: number, techo: number, nombreRango: string) => {
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      return `Completá el mínimo y el máximo de ${nombreRango}.`;
    }
    if (min < piso || max > techo || min >= max) {
      return `En ${nombreRango}, el mínimo tiene que ser menor que el máximo (entre ${piso} y ${techo}).`;
    }
    return null;
  };
  return (
    rango(datos.tempMin, datos.tempMax, 0, 40, 'temperatura') ??
    rango(datos.phMin, datos.phMax, 0, 14, 'pH') ??
    opcional(datos.tdsMax, 0, 10000, 'El TDS máximo tiene que estar entre 0 y 10000 ppm.') ??
    entero(datos.porciones, 1, 30, 'Las porciones tienen que ser un entero entre 1 y 30.') ??
    entero(datos.tomasPorDia, 1, 12, 'Las tomas por día tienen que ser un entero entre 1 y 12.') ??
    fotoValida(datos.fotoSrc)
  );
}

export function guardarPlantilla(usuarioId: string, datos: NuevaPlantilla): PerfilEspecie {
  const error = validarPlantilla(datos);
  if (error) {
    throw new Error(error);
  }
  const perfil = armarPlantilla(nuevoIdPlantilla(), datos);
  const mapa = leer();
  mapa[usuarioId] = [...(mapa[usuarioId] ?? []), perfil];
  escribir(mapa);
  return perfil;
}

function todas(): PerfilEspecie[] {
  return Object.values(leer()).flat();
}

function leer(): Record<string, PerfilEspecie[]> {
  try {
    const crudo = globalThis.localStorage?.getItem(CLAVE_PLANTILLAS);
    if (!crudo) {
      return {};
    }
    const data: unknown = JSON.parse(crudo);
    if (typeof data !== 'object' || data === null) {
      return {};
    }
    const mapa: Record<string, PerfilEspecie[]> = {};
    for (const [usuarioId, lista] of Object.entries(data)) {
      if (Array.isArray(lista)) {
        mapa[usuarioId] = lista as PerfilEspecie[];
      }
    }
    return mapa;
  } catch {
    return {};
  }
}

function escribir(mapa: Record<string, PerfilEspecie[]>): void {
  try {
    globalThis.localStorage?.setItem(CLAVE_PLANTILLAS, JSON.stringify(mapa));
  } catch {
    throw new Error(
      'No hay lugar para guardar la foto en este navegador. Probá con una imagen más chica.',
    );
  }
}

/** pers- y 12 hexadecimales: el mismo formato que valida el backend. */
export function nuevoIdPlantilla(): string {
  return `pers-${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
}

/** Quita del navegador las plantillas ya subidas al backend. */
export function quitarPlantillasLocales(usuarioId: string, ids: readonly string[]): void {
  const mapa = leer();
  const quedan = (mapa[usuarioId] ?? []).filter((p) => !ids.includes(p.id));
  if (quedan.length) {
    mapa[usuarioId] = quedan;
  } else {
    delete mapa[usuarioId];
  }
  try {
    escribir(mapa);
  } catch {
    // Si no se puede escribir, se vuelven a subir la próxima vez: el backend acepta el mismo id
  }
}

/** Datos cargados por el usuario a partir de una ficha ya armada (para subir las del navegador). */
export function datosDePlantilla(perfil: PerfilEspecie): NuevaPlantilla {
  const tomas = Number(perfil.dosis?.tomasPorDia ?? NaN);
  return {
    nombre: perfil.nombre,
    tipoAgua: perfil.tiposAgua[0] ?? 'tropical',
    tempMin: perfil.temperatura?.ideal.intervalo.min ?? perfil.tempMinC ?? NaN,
    tempMax: perfil.temperatura?.ideal.intervalo.max ?? perfil.tempMaxC ?? NaN,
    phMin: perfil.ph?.ideal.intervalo.min ?? perfil.phMin ?? NaN,
    phMax: perfil.ph?.ideal.intervalo.max ?? perfil.phMax ?? NaN,
    tdsMax: perfil.tdsMaxPpm,
    porciones: perfil.dosis?.porToma ?? perfil.porcionesSugeridas ?? null,
    tomasPorDia: Number.isInteger(tomas) ? tomas : null,
    fotoSrc: perfil.foto.src.startsWith('data:image/') ? perfil.foto.src : null,
  };
}

/** Ficha completa de una especie propia a partir de lo que cargó el usuario. */
export function armarPlantilla(id: string, datos: NuevaPlantilla): PerfilEspecie {
  const nombre = datos.nombre.trim().replace(/\s+/g, ' ');
  const tomas = datos.tomasPorDia;
  const porciones = datos.porciones;
  const detalle = 'Rango de la plantilla personalizada.';
  return {
    id,
    slug: id,
    nombre,
    personalizada: true,
    nombreCientifico: 'Plantilla personalizada',
    tiposAgua: [datos.tipoAgua],
    tempRecomendadaC: Math.round(((datos.tempMin + datos.tempMax) / 2) * 10) / 10,
    tempRecomendadaEstimada: true,
    acuarioDomestico: true,
    tempMinC: datos.tempMin,
    tempMaxC: datos.tempMax,
    phMin: datos.phMin,
    phMax: datos.phMax,
    tdsMaxPpm: datos.tdsMax,
    porcionesSugeridas: porciones,
    frecuenciaSugerida: tomas === null ? null : `${tomas} veces por día`,
    guia: `Plantilla armada para ${nombre}. Los reportes y las alertas que siguen a la especie usan estos rangos.`,
    fuente: 'Rangos definidos por el usuario. No salen de una ficha bibliográfica.',
    temperatura: rangos(datos.tempMin, datos.tempMax, '°C', detalle),
    ph: rangos(datos.phMin, datos.phMax, '', detalle),
    notaTds:
      datos.tdsMax === null
        ? 'Sin máximo de TDS en esta plantilla.'
        : `Hasta ${datos.tdsMax} ppm, según esta plantilla.`,
    ...(porciones !== null || tomas !== null
      ? {
          dosis: {
            porToma: porciones,
            porTomaHasta: null,
            porDia: porciones !== null && tomas !== null ? porciones * tomas : null,
            pelletMm: null,
            tomasPorDia: tomas === null ? null : String(tomas),
            tallaReferencia: 'La de esta pecera',
            estimacion: true,
            detalle: 'Cantidades de la plantilla personalizada, no de una ficha.',
          },
        }
      : {}),
    ambiente: {
      tipos: ['acuario-interior'],
      volumenMinLitros: null,
      volumenEstimado: false,
      volumenPorPez: false,
      nota: 'El volumen lo definís vos según los peces de esta pecera.',
    },
    foto: datos.fotoSrc
      ? {
          src: datos.fotoSrc,
          alt: `Foto de ${nombre}`,
          autor: 'Foto del usuario',
          licencia: 'Foto subida por el usuario',
          licenciaUrl: '',
          pagina: '',
        }
      : {
          src: 'assets/species/personalizada.svg',
          alt: `Ilustración genérica de ${nombre}`,
          autor: 'AquaFeed',
          licencia: 'Uso interno del proyecto',
          licenciaUrl: '',
          pagina: '',
        },
  };
}

function rangos(min: number, max: number, unidad: string, detalle: string): RangosEspecie {
  const texto = `${detalle} ${min}–${max}${unidad ? ` ${unidad}` : ''}.`;
  return {
    ideal: { intervalo: { min, max }, detalle: texto },
    advertencia: { umbral: { bajo: min, alto: max }, detalle: 'Fuera del rango de la plantilla.' },
    critico: {
      umbral: { bajo: null, alto: null },
      detalle: 'La plantilla no define un umbral crítico.',
    },
  };
}

function opcional(
  valor: number | null,
  piso: number,
  techo: number,
  mensaje: string,
): string | null {
  if (valor === null) {
    return null;
  }
  return Number.isFinite(valor) && valor >= piso && valor <= techo ? null : mensaje;
}

function fotoValida(src: string | null | undefined): string | null {
  if (!src) {
    return null;
  }
  if (!src.startsWith('data:image/') || src.length > 500_000) {
    return 'La foto tiene que ser una imagen y no puede ser tan pesada.';
  }
  return null;
}

function entero(valor: number | null, piso: number, techo: number, mensaje: string): string | null {
  if (valor === null) {
    return null;
  }
  return Number.isInteger(valor) && valor >= piso && valor <= techo ? null : mensaje;
}
