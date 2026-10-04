/**
 * Perfil de especie. Los rangos salen de las fichas en `docs/especies/`.
 * `null` significa que la ficha no trae ese dato: no se inventa.
 *
 * `tempMinC`, `phMin`, `tdsMaxPpm`, `porcionesSugeridas` y `frecuenciaSugerida`
 * quedan del perfil chico anterior. La ficha usa los campos nuevos.
 */
export type TipoAgua = 'tropical' | 'fria';

/** Intervalo cerrado. Un extremo en null no está en la ficha. */
export interface Intervalo {
  min: number | null;
  max: number | null;
}

/**
 * Advertencia o crítica: la banda aplica por debajo de `bajo` y/o por encima de `alto`.
 */
export interface UmbralFueraDe {
  bajo: number | null;
  alto: number | null;
}

export interface BandaIdeal {
  intervalo: Intervalo;
  /** Texto de la ficha, con las discrepancias que no entran en un solo intervalo. */
  detalle: string;
}

export interface BandaUmbral {
  umbral: UmbralFueraDe;
  detalle: string;
}

export interface RangosEspecie {
  ideal: BandaIdeal;
  advertencia: BandaUmbral;
  critico: BandaUmbral;
}

/** El alimentador dosifica por cantidad de pellets, no por gramos. */
export interface DosisPellets {
  /** Pellets en una toma. null si la ficha no fija la cantidad. */
  porToma: number | null;
  /** Tope cuando la ficha da un rango (por ejemplo 14–28). */
  porTomaHasta: number | null;
  porDia: number | null;
  /** Tope cuando la ficha da un rango de pellets por día. */
  porDiaHasta?: number | null;
  pelletMm: number | null;
  tomasPorDia: string | null;
  tallaReferencia: string;
  /** true cuando la ficha marca la dosis como estimación. */
  estimacion: boolean;
  detalle: string;
  /**
   * Aclaración visible junto al número. La ficha la usa cuando un cardumen
   * chico, con pellet de 0,5 mm, da cientos de pellets por día.
   */
  aclaracion?: string;
}

export interface SuspensionAlimentacion {
  /** °C por debajo de los cuales se suspende. null = la ficha no lo da. */
  bajoC: number | null;
  /** °C a partir de los cuales se suspende, si la ficha lo dice. */
  sobreC: number | null;
  /**
   * true si el límite bajo es un criterio de diseño de la ficha
   * y no un dato publicado de la especie.
   */
  bajoEsCriterioDeDiseno: boolean;
  /** true si la ficha marca el corte como estimación o sugerencia de diseño. */
  estimacion?: boolean;
  detalle: string;
}

/** Clasificación de `ambiente-especies-agua-fria.md` y de las fichas tropicales. */
export type TipoAmbiente = 'acuario-interior' | 'estanque' | 'no-apto-acuario-domestico';

export interface AmbienteRecomendado {
  /** Vacío si la ficha no nombra el ambiente. */
  tipos: readonly TipoAmbiente[];
  /** null si la ficha no da litros, o dice que no aplica y el mínimo está pendiente. */
  volumenMinLitros: number | null;
  /** true cuando la ficha marca el volumen con ≈ o [ESTIMACIÓN]. */
  volumenEstimado: boolean;
  /** true cuando el mínimo es por pez y no del recipiente entero. */
  volumenPorPez: boolean;
  /**
   * Compañía, espacio, filtración u otra aclaración de la ficha.
   * null si no hay dato.
   */
  nota: string | null;
}

/** La especie no come el pellet común del alimentador. Sale de la ficha, no de la plantilla. */
export interface AvisoAlimentacion {
  /** Texto corto para la tarjeta. */
  resumen: string;
  /** Nota visible en la ficha. */
  detalle: string;
}

export interface FotoEspecie {
  /** Ruta servida por la app, por ejemplo `assets/species/guppy.webp`. */
  src: string;
  alt: string;
  autor: string;
  licencia: string;
  licenciaUrl: string;
  /** Página del archivo en Wikimedia Commons. */
  pagina: string;
}

export interface PerfilEspecie {
  id: string;
  slug: string;
  nombre: string;
  /** Otros nombres comunes de la ficha, para mostrar y para el buscador. */
  nombresComunes?: readonly string[];
  nombreCientifico: string;
  /** Uno o más. La corydora pimienta entra en agua fría y en tropical. */
  tiposAgua: readonly TipoAgua[];
  /** Valor por defecto del perfil, en °C. La ficha lo marca como estimación. */
  tempRecomendadaC: number;
  tempRecomendadaEstimada: boolean;
  /** false cuando la ficha indica que no es un pez de acuario doméstico. */
  acuarioDomestico: boolean;
  notaAcuario?: string;
  /** Aclaración de la ficha cuando el agua no es solo «fría» o «tropical». */
  notaTipoAgua?: string;
  tempMinC: number | null;
  tempMaxC: number | null;
  phMin: number | null;
  phMax: number | null;
  tdsMaxPpm: number | null;
  porcionesSugeridas: number | null;
  frecuenciaSugerida: string | null;
  guia: string;
  fuente: string | null;
  temperatura?: RangosEspecie;
  ph?: RangosEspecie;
  notaTds?: string;
  notaDureza?: string;
  dosis?: DosisPellets;
  /** null o ausente si come el pellet común. */
  avisoAlimentacion?: AvisoAlimentacion;
  suspensionAlimentacion?: SuspensionAlimentacion;
  ambiente: AmbienteRecomendado;
  foto: FotoEspecie;
}

export function etiquetaTipoAgua(tipo: TipoAgua): string {
  return tipo === 'fria' ? 'Agua fría' : 'Agua tropical';
}

export function etiquetaAmbiente(tipo: TipoAmbiente): string {
  switch (tipo) {
    case 'acuario-interior':
      return 'Acuario de interior';
    case 'estanque':
      return 'Estanque';
    case 'no-apto-acuario-domestico':
      return 'No apto para acuario doméstico';
  }
}
