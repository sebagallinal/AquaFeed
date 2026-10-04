import { ESPECIES_COMUNES } from './especies-comunes.mock';
import type {
  BandaIdeal,
  BandaUmbral,
  DosisPellets,
  AmbienteRecomendado,
  FotoEspecie,
  PerfilEspecie,
  RangosEspecie,
  SuspensionAlimentacion,
  TipoAmbiente,
} from '../models/perfil-especie.model';

/**
 * Catálogo en memoria. Los números salen de las fichas en `docs/especies/`.
 */
const FUENTE_FRIA = 'Fichas del proyecto en docs/especies/ (agua fría y ambiente recomendado).';
const FUENTE_TROPICAL =
  'Ficha de especies tropicales del proyecto (docs/especies/fichas-especies-tropicales.md).';

const CC_BY_2 = 'https://creativecommons.org/licenses/by/2.0/';
const CC_BY_3 = 'https://creativecommons.org/licenses/by/3.0/';
const CC_BY_4 = 'https://creativecommons.org/licenses/by/4.0/';
const CC_BY_SA_25 = 'https://creativecommons.org/licenses/by-sa/2.5/';
const CC_BY_SA_4 = 'https://creativecommons.org/licenses/by-sa/4.0/';
const CC0 = 'https://creativecommons.org/publicdomain/zero/1.0/';
const PD_FWS = 'https://commons.wikimedia.org/wiki/Template:PD-USGov-FWS';

function ambiente(
  tipos: readonly TipoAmbiente[],
  volumenMinLitros: number | null,
  nota: string | null,
  volumenEstimado = false,
  volumenPorPez = false,
): AmbienteRecomendado {
  return { tipos, volumenMinLitros, volumenEstimado, volumenPorPez, nota };
}

const VACIO = {
  tempMinC: null,
  tempMaxC: null,
  phMin: null,
  phMax: null,
  tdsMaxPpm: null,
  porcionesSugeridas: null,
  frecuenciaSugerida: null,
} as const;

function commons(archivo: string): string {
  return `https://commons.wikimedia.org/wiki/File:${archivo}`;
}

function foto(
  archivo: string,
  src: string,
  alt: string,
  autor: string,
  licencia: string,
  licenciaUrl: string,
): FotoEspecie {
  return { src, alt, autor, licencia, licenciaUrl, pagina: commons(archivo) };
}

function ideal(min: number | null, max: number | null, detalle: string): BandaIdeal {
  return { intervalo: { min, max }, detalle };
}

function umbral(bajo: number | null, alto: number | null, detalle: string): BandaUmbral {
  return { umbral: { bajo, alto }, detalle };
}

function rangos(optimo: BandaIdeal, advertencia: BandaUmbral, critico: BandaUmbral): RangosEspecie {
  return { ideal: optimo, advertencia, critico };
}

function dosis(valor: DosisPellets): DosisPellets {
  return valor;
}

function suspension(valor: SuspensionAlimentacion): SuspensionAlimentacion {
  return valor;
}

export const ESPECIES: readonly PerfilEspecie[] = [
  {
    id: 'sp-guppy',
    slug: 'guppy',
    nombre: 'Guppy',
    nombreCientifico: 'Poecilia reticulata',
    tiposAgua: ['tropical'],
    tempRecomendadaC: 25,
    tempRecomendadaEstimada: true,
    acuarioDomestico: true,
    ...VACIO,
    guia: 'Introducido. Vivíparo de acuario de interior, con calefactor. Casi todos los del comercio son de criadero.',
    fuente: FUENTE_TROPICAL,
    temperatura: rangos(
      ideal(22, 28, 'Rango de la RSPCA. Seriously Fish permite 17–28 °C y FishBase 18–28 °C.'),
      umbral(22, 28, 'Entre 17 y 22 °C, o entre 28 y 32 °C, dar el extremo bajo de la ración.'),
      umbral(
        17,
        32,
        'Suspender la alimentación. Es una sugerencia de diseño: la ficha no tiene una temperatura de corte publicada.',
      ),
    ),
    ph: rangos(
      ideal(7, 8, 'FishBase. Seriously Fish llega a 8,5.'),
      umbral(7, 8, '6,5–7,0 o 8,0–8,5.'),
      umbral(6.5, 8.5, 'Sugerencia de diseño: fuera de todos los rangos publicados.'),
    ),
    notaDureza: 'Ideal 9–19 °dH. Tolerable 8–30 °dH.',
    dosis: dosis({
      porToma: 28,
      porTomaHasta: 55,
      porDia: 55,
      porDiaHasta: 110,
      pelletMm: 0.5,
      tomasPorDia: '2',
      tallaReferencia: 'Hembra adulta de 5 cm (≈ 2,02 g)',
      estimacion: true,
      detalle:
        'Estimación para el adulto de referencia, con 0,5–1 % del peso vivo. Conviene arrancar por el extremo bajo.',
    }),
    suspensionAlimentacion: suspension({
      bajoC: 17,
      sobreC: 32,
      bajoEsCriterioDeDiseno: true,
      estimacion: true,
      detalle: 'Por debajo de 17 °C o desde 32 °C. Sugerencia de diseño, no un dato publicado.',
    }),
    ambiente: ambiente(
      ['acuario-interior'],
      41,
      'Con calefactor. Pacífico, grupos de 5 o más y varias hembras por macho. Evitar peces que muerden aletas.',
      true,
    ),
    foto: foto(
      'Guppy_pho_0048.jpg',
      'assets/species/guppy.webp',
      'Tres guppys en un acuario, sobre un fondo de piedras.',
      'Per Harald Olsen',
      'CC BY 3.0',
      CC_BY_3,
    ),
  },
  {
    id: 'sp-neon',
    slug: 'neon',
    nombre: 'Neón',
    nombresComunes: ['Neón tetra'],
    nombreCientifico: 'Paracheirodon innesi',
    tiposAgua: ['tropical'],
    tempRecomendadaC: 23,
    tempRecomendadaEstimada: true,
    acuarioDomestico: true,
    ...VACIO,
    guia: 'Introducido. Cardumen de acuario de interior, con calefactor. Los del comercio son de criadero y más adaptables que los silvestres.',
    fuente: FUENTE_TROPICAL,
    temperatura: rangos(
      ideal(21, 25, 'Seriously Fish. FishBase da 20–26 °C.'),
      umbral(21, 25, 'Entre 18 y 21 °C, o entre 25 y 30 °C.'),
      umbral(
        18,
        30,
        'Suspender la alimentación. Es una sugerencia de diseño: la ficha no tiene una temperatura de corte publicada.',
      ),
    ),
    ph: rangos(
      ideal(5, 7, 'FishBase. Seriously Fish amplía el rango a 4,0–7,5.'),
      umbral(5, 7, '4,0–5,0 o 7,0–7,5.'),
      umbral(4, 7.5, 'Sugerencia de diseño: fuera de todos los rangos publicados.'),
    ),
    notaDureza: '1–2 °dH en silvestres. En criadero, hasta 12 dGH.',
    dosis: dosis({
      porToma: 5,
      porTomaHasta: 9,
      porDia: 9,
      porDiaHasta: 18,
      pelletMm: 0.5,
      tomasPorDia: '2',
      tallaReferencia: 'Adulto de 3 cm (≈ 0,331 g)',
      estimacion: true,
      detalle:
        'Estimación. Las tomas de la especie están pendientes y se tomaron las de los vivíparos. Un cardumen de 10 adultos equivale a 90–180 pellets por día.',
      aclaracion:
        'Un cardumen de 10 adultos da 90–180 pellets por día. Es una estimación para pellet de 0,5 mm. La dosis real del alimentador se define después.',
    }),
    suspensionAlimentacion: suspension({
      bajoC: 18,
      sobreC: 30,
      bajoEsCriterioDeDiseno: true,
      estimacion: true,
      detalle: 'Por debajo de 18 °C o desde 30 °C. Sugerencia de diseño, no un dato publicado.',
    }),
    ambiente: ambiente(
      ['acuario-interior'],
      54,
      'Con calefactor. Cardumen de al menos 8–10 (FishBase pide 5 o más). Agua blanda.',
      true,
    ),
    foto: foto(
      'Paracheirodon_innesi_(aka).jpg',
      'assets/species/neon.webp',
      'Neón de costado, con la franja azul brillante y la banda roja desde la mitad del cuerpo hasta la cola.',
      'André Karwath aka Aka',
      'CC BY-SA 2.5',
      CC_BY_SA_25,
    ),
  },
  {
    id: 'sp-molly',
    slug: 'molly',
    nombre: 'Molly de aleta corta',
    nombresComunes: ['Black molly', 'Molly común'],
    nombreCientifico: 'Poecilia sphenops',
    tiposAgua: ['tropical'],
    tempRecomendadaC: 25,
    tempRecomendadaEstimada: true,
    acuarioDomestico: true,
    ...VACIO,
    guia: 'Introducido. Molly común o black molly. Acuario de interior con calefactor y agua dura. No mezclar con el molly vela: se hibridan.',
    fuente: FUENTE_TROPICAL,
    temperatura: rangos(
      ideal(
        22,
        28,
        'Centro de las fuentes de acuarismo. Seriously Fish da 21–28 °C y FishBase 18–28 °C.',
      ),
      umbral(22, 28, 'Entre 18 y 22 °C, o entre 28 y 32 °C.'),
      umbral(
        18,
        32,
        'Suspender la alimentación. Es una sugerencia de diseño: la ficha no tiene una temperatura de corte publicada.',
      ),
    ),
    ph: rangos(
      ideal(7.5, 8.2, 'FishBase. Seriously Fish da 7,0–8,5.'),
      umbral(7.5, 8.2, '7,0–7,5 o 8,2–8,5.'),
      umbral(7, 8.5, 'Sugerencia de diseño: fuera de todos los rangos publicados.'),
    ),
    notaDureza: 'Ideal 15–30 dGH. Tolerable 11–30 °dH.',
    dosis: dosis({
      porToma: 22,
      porTomaHasta: 44,
      porDia: 44,
      porDiaHasta: 89,
      pelletMm: 0.8,
      tomasPorDia: '2',
      tallaReferencia: 'Adulto de 6 cm (≈ 4,05 g)',
      estimacion: true,
      detalle: 'Estimación para el adulto de referencia, con 0,5–1 % del peso vivo y 2 tomas.',
    }),
    suspensionAlimentacion: suspension({
      bajoC: 18,
      sobreC: 32,
      bajoEsCriterioDeDiseno: true,
      estimacion: true,
      detalle: 'Por debajo de 18 °C o desde 32 °C. Sugerencia de diseño, no un dato publicado.',
    }),
    ambiente: ambiente(
      ['acuario-interior'],
      81,
      'Con calefactor y agua dura. Pacífico solo con peces de esa agua. Varias hembras por macho. No mezclar con molly vela.',
      true,
    ),
    foto: foto(
      'Poecilia_sphenops_390223153.jpg',
      'assets/species/molly.webp',
      'Molly de aleta corta de costado, con bandas verticales y la cola anaranjada, sobre una mano.',
      'Zakqary Roy',
      'CC BY 4.0',
      CC_BY_4,
    ),
  },
  {
    id: 'sp-molly-vela',
    slug: 'molly-vela',
    nombre: 'Molly vela',
    nombresComunes: ['Sailfin molly'],
    nombreCientifico: 'Poecilia latipinna',
    tiposAgua: ['tropical'],
    tempRecomendadaC: 24,
    tempRecomendadaEstimada: true,
    acuarioDomestico: true,
    ...VACIO,
    guia: 'Introducido. El macho tiene la aleta dorsal en forma de vela. Acuario de interior con calefactor y agua dura. No mezclar con el molly de aleta corta.',
    fuente: FUENTE_TROPICAL,
    temperatura: rangos(
      ideal(21, 26, 'Seriously Fish. FishBase da 20–28 °C.'),
      umbral(21, 26, 'Entre 18 y 21 °C, o entre 26 y 32 °C. FishBase llega a 28 °C.'),
      umbral(
        18,
        32,
        'Suspender la alimentación. Es una sugerencia de diseño: la ficha no tiene una temperatura de corte publicada.',
      ),
    ),
    ph: rangos(
      ideal(7, 8.5, 'Seriously Fish. FishBase no publica pH para esta especie.'),
      umbral(7, 8.5, '6,5–7,0 o 8,5–9,0. Sugerencia de diseño.'),
      umbral(6.5, 9, 'Sugerencia de diseño: fuera de todos los rangos publicados.'),
    ),
    notaDureza: '15–35 dGH. Tolera agua salobre.',
    dosis: dosis({
      porToma: 41,
      porTomaHasta: 82,
      porDia: 82,
      porDiaHasta: 160,
      pelletMm: 0.8,
      tomasPorDia: '2',
      tallaReferencia: 'Hembra adulta de 8 cm (≈ 7,47 g)',
      estimacion: true,
      detalle:
        'Estimación. Las tomas del adulto no tienen dato propio: se usaron 2 por analogía con el molly de aleta corta. Conviene incluir pellets de base vegetal.',
    }),
    suspensionAlimentacion: suspension({
      bajoC: 18,
      sobreC: 32,
      bajoEsCriterioDeDiseno: true,
      estimacion: true,
      detalle: 'Por debajo de 18 °C o desde 32 °C. Sugerencia de diseño, no un dato publicado.',
    }),
    ambiente: ambiente(
      ['acuario-interior'],
      87,
      'Con calefactor y agua dura. Tríos de 2 hembras por macho. Los machos se pelean y, de grande, puede molestar a peces chicos.',
      true,
    ),
    foto: foto(
      'Poecilia_latipinna_170400954.jpg',
      'assets/species/molly-vela.webp',
      'Molly vela de costado, con la aleta dorsal alta y punteada.',
      'Tia Offner',
      'CC BY 4.0',
      CC_BY_4,
    ),
  },
  {
    id: 'sp-platy',
    slug: 'platy',
    nombre: 'Platy',
    nombreCientifico: 'Xiphophorus maculatus',
    tiposAgua: ['tropical'],
    tempRecomendadaC: 23,
    tempRecomendadaEstimada: true,
    acuarioDomestico: true,
    ...VACIO,
    guia: 'Introducido. Vivíparo pacífico de acuario de interior, con calefactor. Muchas variedades del comercio son híbridos.',
    fuente: FUENTE_TROPICAL,
    temperatura: rangos(
      ideal(20, 25, 'Coincidencia entre Seriously Fish (20–26 °C) y FishBase (18–25 °C).'),
      umbral(20, 25, 'Entre 18 y 20 °C, o entre 25 y 30 °C. Seriously Fish llega a 26 °C.'),
      umbral(
        18,
        30,
        'Suspender la alimentación. Es una sugerencia de diseño: la ficha no tiene una temperatura de corte publicada.',
      ),
    ),
    ph: rangos(
      ideal(7, 8, 'FishBase. Seriously Fish llega a 8,2.'),
      umbral(7, 8, '6,8–7,0 o 8,0–8,2. Sugerencia de diseño.'),
      umbral(6.8, 8.2, 'Sugerencia de diseño: fuera de todos los rangos publicados.'),
    ),
    notaDureza: 'Ideal 10–19 dGH. Tolerable 9–30 dGH.',
    dosis: dosis({
      porToma: 22,
      porTomaHasta: 45,
      porDia: 45,
      porDiaHasta: 90,
      pelletMm: 0.5,
      tomasPorDia: '2',
      tallaReferencia: 'Hembra adulta de 5 cm (≈ 1,64 g)',
      estimacion: true,
      detalle:
        'Estimación. Las tomas del adulto no tienen dato propio: se usaron 2, como en los Poecilia. Los alevines crecen con 2–3 tomas.',
    }),
    suspensionAlimentacion: suspension({
      bajoC: 18,
      sobreC: 30,
      bajoEsCriterioDeDiseno: true,
      estimacion: true,
      detalle: 'Por debajo de 18 °C o desde 30 °C. Sugerencia de diseño, no un dato publicado.',
    }),
    ambiente: ambiente(
      ['acuario-interior'],
      54,
      'Con calefactor, preferentemente plantado. Muy pacífico. Más hembras que machos.',
      true,
    ),
    foto: foto(
      'Platy_5.jpg',
      'assets/species/platy.webp',
      'Platy anaranjado con la cola oscura, entre plantas de acuario.',
      'Graf zu Pappenheim',
      'CC BY-SA 4.0',
      CC_BY_SA_4,
    ),
  },
  ...ESPECIES_COMUNES,
  {
    id: 'sp-trucha-arcoiris',
    slug: 'trucha-arcoiris',
    nombre: 'Trucha arcoíris',
    nombreCientifico: 'Oncorhynchus mykiss',
    tiposAgua: ['fria'],
    tempRecomendadaC: 14,
    tempRecomendadaEstimada: true,
    acuarioDomestico: false,
    notaAcuario:
      'No apta para acuario doméstico. Solo alevines en tanques de ensayo; adultos en tanque, raceway o estanque de cultivo.',
    ...VACIO,
    ambiente: ambiente(
      ['no-apto-acuario-domestico'],
      null,
      'Llega a 123 cm. Agua fría, clara y con oxígeno cerca de la saturación. Compañía: dato pendiente.',
    ),
    guia: 'Introducida en Argentina; nativa del Pacífico de Norteamérica. Es la especie principal de la acuicultura argentina. La dosis es una estimación para un juvenil de 20 cm a 15 °C.',
    fuente: FUENTE_FRIA,
    temperatura: rangos(
      ideal(
        12,
        14,
        'Óptimo de Irlanda (FHU): 12–14 °C. SRAC, con ración máxima: 12,8–18,3 °C. FAO: por debajo de 21 °C; crecimiento y desove en 9–14 °C; criterio de sitio 12–21 °C.',
      ),
      umbral(4.4, 20, 'Restringir la alimentación (SRAC). No es todavía la suspensión.'),
      umbral(
        1,
        24,
        'Suspender la alimentación. El CTM ronda 24–26 °C; Irlanda marca letal por encima de 24 °C.',
      ),
    ),
    ph: rangos(
      ideal(
        6.5,
        8.5,
        'Criterio de sitio de la FAO. Para crecer también se citan 7,0–8,0 (Wedemeyer), 6,5–8,0 (Barton) y 6,7–8,5 (Brannon).',
      ),
      umbral(6.5, 8.5, 'Fuera del criterio de la FAO.'),
      umbral(
        6,
        9,
        'Límites de supervivencia (Wedemeyer). Por encima de 9 puede matar salmónidos, sobre todo huevos y alevines.',
      ),
    ),
    notaTds:
      'Sin dato confiable de TDS. Alcalinidad 10–400 mg/L como CaCO₃ (FAO). La alcalinidad no se convierte a TDS.',
    notaDureza:
      'Calcio o dureza, en mg/L: más de 150 (Sedgwick), 10–400 (Barton), 50–200 para sobrevivir (Wedemeyer), más de 50 como óptimo y 4–160 para sobrevivir (Brannon).',
    dosis: dosis({
      porToma: 14,
      porTomaHasta: 28,
      porDia: 28,
      pelletMm: 4,
      tomasPorDia: '1–2',
      tallaReferencia: 'Juvenil de 20 cm (≈ 81,7 g), a 15 °C',
      estimacion: true,
      detalle:
        'Estimación de la ficha: ≈ 28 pellets/día de 4,0 mm. En 1–2 tomas, 14–28 pellets por toma.',
    }),
    suspensionAlimentacion: suspension({
      bajoC: 1,
      sobreC: 24,
      bajoEsCriterioDeDiseno: false,
      detalle:
        'A 1 °C o menos, o a 24 °C o más. Por debajo de 4,4 °C no se suspende del todo: se restringe la ración.',
    }),
    foto: foto(
      'Rainbow_Trout_(Oncorhynchus_mykiss)_(cropped).jpg',
      'assets/species/trucha-arcoiris.webp',
      'Trucha arcoíris nadando sobre un lecho de piedras, con la banda rosada en el flanco.',
      'Liquid Art',
      'CC BY-SA 4.0',
      CC_BY_SA_4,
    ),
  },
  {
    id: 'sp-trucha-marron',
    slug: 'trucha-marron',
    nombre: 'Trucha marrón',
    nombreCientifico: 'Salmo trutta',
    tiposAgua: ['fria'],
    tempRecomendadaC: 14,
    tempRecomendadaEstimada: true,
    acuarioDomestico: false,
    notaAcuario: 'No apta para acuario doméstico. Estanque o tanque de cultivo.',
    ...VACIO,
    ambiente: ambiente(
      ['no-apto-acuario-domestico'],
      null,
      'Piscívora de grande: no mezclar con peces chicos.',
    ),
    guia: 'Introducida en Argentina; nativa de Europa y Asia occidental. No hay tabla de ración propia: la ficha usa la de la arcoíris, como supuesto, y no más allá de 18 °C. La dosis es una estimación para un juvenil de 20 cm.',
    fuente: FUENTE_FRIA,
    temperatura: rangos(
      ideal(
        8,
        17,
        'Barton: 8–17 °C. Máximo crecimiento: 13,1–14,1 °C con invertebrados y 11,6–19,1 °C con pellets. No se usa el rango de FishBase (18–24 °C): 22–25 °C ya es letal incipiente.',
      ),
      umbral(
        4,
        19,
        'Por debajo de 4 °C, solo ración de mantenimiento. Por encima de 19 °C, reducir y vigilar.',
      ),
      umbral(
        0.5,
        22,
        'Suspender la alimentación. La ficha también dice suspender cerca de 0,4 °C.',
      ),
    ),
    ph: rangos(
      ideal(
        7,
        8,
        'Rango de crecimiento. La supervivencia se toma en 6,0–9,0, igual que la arcoíris. El resumen anota el pH tolerable 6,0–9,0.',
      ),
      umbral(7, 8, 'Fuera del rango de crecimiento.'),
      umbral(
        6,
        9,
        'Por debajo de 6 o por encima de 9. Irlanda recomienda evitar un pH menor que 5 y mayor que 9.',
      ),
    ),
    notaDureza:
      'Sin dato propio. La ficha remite a las mismas referencias de dureza que la trucha arcoíris.',
    dosis: dosis({
      porToma: 12,
      porTomaHasta: 25,
      porDia: 25,
      pelletMm: 4,
      tomasPorDia: '1–2',
      tallaReferencia: 'Juvenil de 20 cm (≈ 76,2 g)',
      estimacion: true,
      detalle:
        'Pellets/día ≈ 25, pellet de 4,0 mm. Por toma, 12–25 en 1–2 tomas. No hay tabla propia: se usa la de la arcoíris.',
    }),
    suspensionAlimentacion: suspension({
      bajoC: 0.5,
      sobreC: 22,
      bajoEsCriterioDeDiseno: false,
      detalle:
        'La alerta sugerida suspende a 0,5 °C o menos y a 22 °C o más. El texto de alimentación también dice suspender cerca de 0,4 °C.',
    }),
    foto: foto(
      'Brown_Trout_(51238488071)_(cropped).jpg',
      'assets/species/trucha-marron.webp',
      'Trucha marrón de costado, con el lomo oscuro y manchas negras y rojas.',
      'USFWS Mountain Prairie',
      'Dominio público',
      PD_FWS,
    ),
  },
  {
    id: 'sp-salmon-atlantico',
    slug: 'salmon-atlantico',
    nombre: 'Salmón del Atlántico',
    nombreCientifico: 'Salmo salar',
    tiposAgua: ['fria'],
    tempRecomendadaC: 14,
    tempRecomendadaEstimada: true,
    acuarioDomestico: false,
    notaAcuario:
      'No apta para acuario doméstico. Es anádromo: la fase de agua dulce se hace en tanques de cultivo.',
    ...VACIO,
    ambiente: ambiente(
      ['no-apto-acuario-domestico'],
      null,
      'Referencia de cultivo: un raceway de adultos mide unos 16 400 L (estimación a partir de las medidas de la fuente). Compañía: dato pendiente.',
    ),
    guia: 'Introducido; nativo del Atlántico Norte. La fase que aplica a un tanque de agua dulce es la juvenil, hasta el smolt. El engorde comercial es en el mar. La dosis es una estimación para un parr de unos 12 cm (20 g).',
    fuente: FUENTE_FRIA,
    temperatura: rangos(
      ideal(
        12,
        15,
        'Irlanda, según etapa y tamaño: 12–15 °C. Con ración máxima: 15,9 °C (Reino Unido) y 16,3–20 °C (Noruega). El 2–9 °C de FishBase es la distribución en el mar, no el óptimo de cultivo.',
      ),
      umbral(3, 18, 'Fuera de la tolerancia de smolts y de engorde citada por Irlanda.'),
      umbral(
        0,
        22,
        'Suspender la alimentación. El límite superior para alimentarse puede empezar en 22 °C.',
      ),
    ),
    ph: rangos(
      ideal(
        6,
        8.5,
        'Preferido en agua dulce, y siempre por encima de 5,4. En agua de mar, por encima de 7. Evitar cambios bruscos.',
      ),
      umbral(6, 8.5, 'Fuera de 6,0–8,5.'),
      umbral(5.4, null, 'La ficha no da un crítico alto distinto del de advertencia.'),
    ),
    notaTds:
      'Sin dato confiable de TDS. En agua dulce se puede agregar agua salada, en general hasta 1 ppt (≈ 1 000 mg/L), para ajustar el pH y detoxificar el aluminio.',
    dosis: dosis({
      porToma: 8,
      porTomaHasta: null,
      porDia: 24,
      pelletMm: 2.5,
      tomasPorDia: '3',
      tallaReferencia: 'Parr de ≈ 12 cm (20 g)',
      estimacion: true,
      detalle:
        '≈ 24 pellets/día de 2,5 mm y ≈ 8 por toma. Las 3 tomas son una estimación: la fuente usa alimentación continua.',
    }),
    suspensionAlimentacion: suspension({
      bajoC: 0,
      sobreC: 22,
      bajoEsCriterioDeDiseno: false,
      detalle: 'Suspender cerca de 0 °C y por encima de 22 °C.',
    }),
    foto: foto(
      'Salmo_salar-Atlantic_Salmon-Atlanterhavsparken_Norway_(cropped).JPG',
      'assets/species/salmon-atlantico.webp',
      'Salmón del Atlántico nadando en agua azul, visto de costado.',
      'Hans-Petter Fjeld',
      'CC BY-SA 2.5',
      CC_BY_SA_25,
    ),
  },
  {
    id: 'sp-goldfish',
    slug: 'goldfish',
    nombre: 'Goldfish',
    nombresComunes: ['Pez dorado', 'Carasius'],
    nombreCientifico: 'Carassius auratus',
    tiposAgua: ['fria'],
    tempRecomendadaC: 21,
    tempRecomendadaEstimada: true,
    acuarioDomestico: true,
    ...VACIO,
    ambiente: ambiente(
      ['acuario-interior', 'estanque'],
      60,
      'Variedades fancy: acuario de interior. Goldfish común, cometa y shubunkin: estanque. Grupos de 5 o más. Nunca en pecera redonda.',
      false,
      true,
    ),
    guia: 'Introducido; nativo de Asia oriental. También se lo llama pez dorado o carasius. Es el caso más típico de acuario de agua fría. La dosis de referencia es para un pez de 10 cm, a 20–24 °C.',
    fuente: FUENTE_FRIA,
    temperatura: rangos(
      ideal(
        18,
        24,
        'SRAC (65–75 °F). Tolera 0–35 °C si el cambio es gradual. FishBase da un rango de clima de 0–41 °C; la ficha se queda con el límite de SRAC, más conservador.',
      ),
      umbral(
        18,
        24,
        'Fuera del óptimo la alerta es informativa. Por debajo de 10 °C se suspende la alimentación.',
      ),
      umbral(
        1,
        32,
        'El límite de supervivencia de SRAC es 0–35 °C. El margen hasta 32 °C es una decisión de diseño de la ficha, no un letal publicado.',
      ),
    ),
    ph: rangos(
      ideal(7, 7, 'Lo más cerca posible de 7. Tolera 5–9 (SRAC). FishBase: 6,0–8,0.'),
      umbral(6.5, 7.5, 'Alerta sugerida por alejarse de 7. No es un intervalo publicado aparte.'),
      umbral(5, 9, 'Límites de tolerancia de SRAC.'),
    ),
    notaDureza: '5–19 °dH (≈ 90–340 mg/L como CaCO₃).',
    dosis: dosis({
      porToma: 31,
      porTomaHasta: null,
      porDia: 120,
      pelletMm: 1.5,
      tomasPorDia: '4',
      tallaReferencia: '10 cm (≈ 12,6 g), a 20–24 °C',
      estimacion: true,
      detalle:
        'La ficha lista ≈ 120 pellets/día de 1,5 mm y 31 por toma en 4 tomas (el producto no cierra por el redondeo de la estimación). El 3 % del peso vivo en 4 tomas es el dato experimental en juveniles; el pasaje a pellets es una estimación.',
    }),
    suspensionAlimentacion: suspension({
      bajoC: 10,
      sobreC: null,
      bajoEsCriterioDeDiseno: false,
      detalle:
        'La tabla de la ficha suspende por debajo de 10 °C con la regla de K.O.I. para koi. Hikari, para koi, no alimenta por debajo de 5 °C: la ficha marca esa discrepancia.',
    }),
    foto: foto(
      'Carassius_auratus_auratus_(goldfish)_1.jpg',
      'assets/species/goldfish.webp',
      'Goldfish común anaranjado de costado, con el vientre plateado y las aletas largas.',
      'James St. John',
      'CC BY 2.0',
      CC_BY_2,
    ),
  },
  {
    id: 'sp-koi',
    slug: 'koi',
    nombre: 'Koi',
    nombresComunes: ['Carpa koi'],
    nombreCientifico: 'Cyprinus carpio',
    tiposAgua: ['fria'],
    tempRecomendadaC: 21,
    tempRecomendadaEstimada: true,
    acuarioDomestico: false,
    notaAcuario: 'No recomendado para acuario doméstico. La ficha lo ubica en estanque.',
    ...VACIO,
    ambiente: ambiente(
      ['estanque'],
      4500,
      'Profundidad mayor a 90 cm, con filtro, bomba y UV. Grupos de 5 o más. Puede ser agresivo al reproducirse.',
    ),
    guia: 'Variedad ornamental de la carpa común, nativa de Eurasia. La ficha lo ubica en estanque. La dosis de referencia es para un pez de 20 cm, a 20–23 °C, y está estimada.',
    fuente: FUENTE_FRIA,
    temperatura: rangos(
      ideal(18, 24, 'SRAC. Tolera 0–35 °C con cambio gradual. FishBase, para la carpa: 3–35 °C.'),
      umbral(
        10,
        null,
        'Por debajo de 10 °C se suspende la alimentación. Entre 18 y 27 °C la ficha pide un aviso de riesgo de KHV si hay peces nuevos: no es un umbral de alimentación.',
      ),
      umbral(
        1,
        32,
        'El límite de supervivencia citado es 35 °C. El margen hasta 32 °C es una decisión de diseño de la ficha.',
      ),
    ),
    ph: rangos(
      ideal(7, 7, 'Cerca de 7. Tolera 5–9 (SRAC). FishBase, para la carpa: 6,5–9,0.'),
      umbral(6.5, 8.5, 'Fuera de 6,5–8,5, según la alerta sugerida.'),
      umbral(5, 9, 'Tolerancia de SRAC.'),
    ),
    notaDureza: '10–15 °dH (≈ 180–270 mg/L como CaCO₃), dato de FishBase para la carpa.',
    dosis: dosis({
      porToma: 11,
      porTomaHasta: null,
      porDia: 43,
      pelletMm: 5,
      tomasPorDia: '4 (estimadas; la fuente solo dice varias por día)',
      tallaReferencia: '20 cm (≈ 122,5 g), a 20–23 °C',
      estimacion: true,
      detalle:
        '≈ 43 pellets/día de 5 mm. Por toma, 11 si se reparte en 4 tomas. Las 4 tomas son una estimación de la ficha, en línea con el dato experimental del goldfish.',
    }),
    suspensionAlimentacion: suspension({
      bajoC: 10,
      sobreC: null,
      bajoEsCriterioDeDiseno: false,
      detalle:
        'Para AquaFeed la ficha dice suspender por debajo de 10 °C. Entre 10 y 15 °C toma el valor FAO como techo, con no más de 2 tomas y confirmación de quien alimenta. Hikari permite un poco de alimento entre 5 y 10 °C; K.O.I. suspende por debajo de 10 °C.',
    }),
    foto: foto(
      'Koi_feeding,_National_Arboretum.jpg',
      'assets/species/koi.webp',
      'Grupo de carpas koi de varios colores reunidas en la superficie de un estanque.',
      'Arden',
      'CC BY 2.0',
      CC_BY_2,
    ),
  },
  {
    id: 'sp-nubes-blancas',
    slug: 'nubes-blancas',
    nombre: 'Pez de las nubes blancas',
    nombresComunes: ['White cloud'],
    nombreCientifico: 'Tanichthys albonubes',
    tiposAgua: ['fria'],
    tempRecomendadaC: 20,
    tempRecomendadaEstimada: true,
    acuarioDomestico: true,
    ...VACIO,
    ambiente: ambiente(
      ['acuario-interior'],
      54,
      'Sin calefactor. Cardumen de 10 o más (FishBase pide 5). No juntar con goldfish.',
      true,
    ),
    guia: 'Introducido; nativo del sur de China y de Vietnam. En la ficha también figura como white cloud. Sirve para un acuario de interior sin calefactor.',
    fuente: FUENTE_FRIA,
    temperatura: rangos(
      ideal(
        14,
        22,
        'Rango cómodo según Seriously Fish. FishBase: 18–22 °C, y sobrevive hasta 5 °C. La exposición permanente a más calor acorta la vida.',
      ),
      umbral(14, 22, 'Fuera del rango cómodo.'),
      umbral(
        5,
        null,
        'Límite bajo de FishBase. Límite alto: sin dato confiable. La ficha sugiere, como criterio de diseño y no como dato publicado, 26 °C o más.',
      ),
    ),
    ph: rangos(
      ideal(6, 8, 'FishBase: 6,0–8,0. Seriously Fish amplía el rango a 6,0–8,5.'),
      umbral(6, 8, 'Fuera de 6,0–8,0.'),
      umbral(6, 8.5, 'Fuera de 6,0–8,5.'),
    ),
    notaDureza: '90–357 mg/L (Seriously Fish), equivalente a 5–19 °dH (FishBase).',
    dosis: dosis({
      porToma: 40,
      porTomaHasta: null,
      porDia: 80,
      pelletMm: 0.5,
      tomasPorDia: '2',
      tallaReferencia: '3,5 cm (≈ 0,485 g)',
      estimacion: true,
      detalle:
        '≈ 80 pellets/día de 0,5 mm y ≈ 40 por toma. Es una estimación muy incierta: la ración está pendiente y las 2 tomas se asumen.',
    }),
    suspensionAlimentacion: suspension({
      bajoC: 10,
      sobreC: null,
      bajoEsCriterioDeDiseno: true,
      estimacion: true,
      detalle:
        'Por debajo de 14 °C la ficha dice reducir, y por debajo de 10 °C suspender. Aclara que no hay dato de la especie: es un criterio conservador de diseño.',
    }),
    foto: foto(
      'White_Cloud_Mountain_minnow_(Tanichthys_albonubes)_captive_adult_female.jpg',
      'assets/species/nubes-blancas.webp',
      'Pez de las nubes blancas de costado, con una franja horizontal clara y la cola roja, en un acuario plantado.',
      'Ethmostigmus',
      'CC BY-SA 4.0',
      CC_BY_SA_4,
    ),
  },
  {
    id: 'sp-pejerrey',
    slug: 'pejerrey',
    nombre: 'Pejerrey',
    nombresComunes: ['Pejerrey bonaerense'],
    nombreCientifico: 'Odontesthes bonariensis',
    tiposAgua: ['fria'],
    tempRecomendadaC: 21,
    tempRecomendadaEstimada: true,
    acuarioDomestico: false,
    notaAcuario: 'No apta para acuario doméstico. Se cultiva en tanques, jaulas o estanques.',
    notaTipoAgua: 'En la ficha figura como templado-frío.',
    ...VACIO,
    ambiente: ambiente(
      ['no-apto-acuario-domestico'],
      null,
      'Gregario. El tamaño mínimo del grupo está pendiente.',
    ),
    guia: 'Nativo de la región pampeana y del Río de la Plata. La dosis es una estimación para un pez de 10 cm en agua cálida, con alimento de trucha.',
    fuente: FUENTE_FRIA,
    temperatura: rangos(
      ideal(
        17,
        24,
        'Óptimo de cultivo. FishBase, como clima: 11–24 °C. En la laguna Chascomús las medias van de 8,9 a 25,6 °C.',
      ),
      umbral(17, 24, 'Fuera del óptimo de cultivo.'),
      umbral(null, 30, 'A 30 °C los juveniles dejan de comer. Límite bajo: sin dato confiable.'),
    ),
    notaTds:
      'No hay un rango de TDS de acuario. Larvas y juveniles crecen mejor con 5–20 g/L de salinidad (≈ 5 000–20 000 mg/L). Un TDS alto no es, por sí solo, un problema: tolera agua salobre. Los medidores comunes suelen saturar cerca de 9 990 ppm.',
    dosis: dosis({
      porToma: 22,
      porTomaHasta: null,
      porDia: 130,
      pelletMm: 1.5,
      tomasPorDia: '6 (juveniles)',
      tallaReferencia: '10 cm (≈ 5,89 g), en cálido (7 % de la biomasa)',
      estimacion: true,
      detalle:
        '≈ 130 pellets/día de 1,5 mm y 22 por toma en 6 tomas. El 5–7 % sale de jaulas donde también comen zooplancton.',
    }),
    suspensionAlimentacion: suspension({
      bajoC: null,
      sobreC: 30,
      bajoEsCriterioDeDiseno: false,
      detalle:
        'A 30 °C o más dejan de comer y se suspende la alimentación. Límite bajo: sin dato confiable.',
    }),
    foto: foto(
      'Pejerrey_Odontesthes_Bonariensis.jpg',
      'assets/species/pejerrey.webp',
      'Pejerrey plateado sostenido en un bote, con el cuerpo alargado y una franja lateral clara.',
      'Uli7',
      'CC0',
      CC0,
    ),
  },
];
