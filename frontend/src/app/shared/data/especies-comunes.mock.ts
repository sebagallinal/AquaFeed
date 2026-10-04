import type {
  AmbienteRecomendado,
  AvisoAlimentacion,
  BandaIdeal,
  BandaUmbral,
  DosisPellets,
  FotoEspecie,
  PerfilEspecie,
  RangosEspecie,
  SuspensionAlimentacion,
  TipoAmbiente,
} from '../models/perfil-especie.model';

/**
 * Las 12 especies comunes de la ficha
 * `docs/especies/fichas-especies-comunes-argentina.md`.
 * Ninguna es de estanque exterior en Argentina.
 */
const FUENTE =
  'Ficha de especies comunes en Argentina (docs/especies/fichas-especies-comunes-argentina.md).';

const CC_BY_4 = 'https://creativecommons.org/licenses/by/4.0/';
const CC_BY_SA_25 = 'https://creativecommons.org/licenses/by-sa/2.5/';
const CC_BY_SA_3 = 'https://creativecommons.org/licenses/by-sa/3.0/';
const CC_BY_SA_4 = 'https://creativecommons.org/licenses/by-sa/4.0/';
const CC0 = 'https://creativecommons.org/publicdomain/zero/1.0/';
const PD_SELF = 'https://commons.wikimedia.org/wiki/Template:PD-self';

const NOTA_PELLET_05 =
  'Es una estimación para pellet de 0,5 mm. La dosis real del alimentador se define después.';

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

function ambiente(
  tipos: readonly TipoAmbiente[],
  volumenMinLitros: number | null,
  nota: string | null,
  volumenEstimado = false,
  volumenPorPez = false,
): AmbienteRecomendado {
  return { tipos, volumenMinLitros, volumenEstimado, volumenPorPez, nota };
}

function aviso(resumen: string, detalle: string): AvisoAlimentacion {
  return { resumen, detalle };
}

function cardumen(cuenta: string): string {
  return `${cuenta} ${NOTA_PELLET_05}`;
}

const CORTE =
  'Suspender la alimentación. Es una sugerencia de diseño: la ficha no tiene una temperatura de corte publicada.';

export const ESPECIES_COMUNES: readonly PerfilEspecie[] = [
  {
    id: 'sp-xipho',
    slug: 'xipho',
    nombre: 'Pez espada',
    nombresComunes: ['Xipho', 'Cola de espada'],
    nombreCientifico: 'Xiphophorus hellerii',
    tiposAgua: ['tropical'],
    tempRecomendadaC: 24,
    tempRecomendadaEstimada: true,
    acuarioDomestico: true,
    ...VACIO,
    guia: 'Introducido. Vivíparo de acuario de interior, con calefactor. En Argentina se cría y se exporta. También se lo llama xipho o cola de espada.',
    fuente: FUENTE,
    temperatura: rangos(
      ideal(
        22,
        26,
        'Superposición de FishBase (22–28 °C) y el MAGyP (21–26 °C). Seriously Fish admite 16–28 °C.',
      ),
      umbral(22, 26, 'Entre 16 y 22 °C, o entre 26 y 31 °C.'),
      umbral(16, 31, CORTE),
    ),
    ph: rangos(
      ideal(7, 8, 'FishBase y Seriously Fish. El MAGyP da 6,8–8,0. Tolera agua salobre.'),
      umbral(7, 8, '6,8–7,0 (MAGyP) o 8,0–8,3. El extremo alto es sugerencia de diseño.'),
      umbral(6.8, 8.3, 'Sugerencia de diseño: fuera de 6,8–8,3.'),
    ),
    notaDureza: '9–19 °dH (FishBase, ≈ 160–338 mg/L). Seriously Fish llega a 10–25 dGH.',
    notaTds: 'Pendiente. Piso orientativo ≈ 160 mg/L (estimado).',
    dosis: dosis({
      porToma: 63,
      porTomaHasta: 130,
      porDia: 130,
      porDiaHasta: 250,
      pelletMm: 0.8,
      tomasPorDia: '2',
      tallaReferencia: 'Hembra adulta de 10 cm (≈ 11,5 g)',
      estimacion: true,
      detalle:
        'Estimación para la hembra de referencia, con 0,5–1 % del peso vivo. Las tomas de la especie están pendientes.',
    }),
    suspensionAlimentacion: suspension({
      bajoC: 16,
      sobreC: 31,
      bajoEsCriterioDeDiseno: true,
      estimacion: true,
      detalle: 'Por debajo de 16 °C o desde 31 °C. Sugerencia de diseño, no un dato publicado.',
    }),
    ambiente: ambiente(
      ['acuario-interior'],
      108,
      'Con calefactor. Grupos de al menos 10, con 1 macho cada 3 o 4 hembras. El MAGyP pide 120 L.',
      true,
    ),
    foto: foto(
      'Xiphophorus_hellerii_young_male_01.jpg',
      'assets/species/xipho.webp',
      'Pez espada de costado, con la cola naranja alargada, en un acuario plantado.',
      'Wojciech J. Płuciennik',
      'CC BY-SA 4.0',
      CC_BY_SA_4,
    ),
  },
  {
    id: 'sp-pez-cebra',
    slug: 'pez-cebra',
    nombre: 'Pez cebra',
    nombresComunes: ['Cebrita'],
    nombreCientifico: 'Danio rerio',
    tiposAgua: ['tropical'],
    tempRecomendadaC: 22,
    tempRecomendadaEstimada: true,
    acuarioDomestico: true,
    ...VACIO,
    guia: 'Introducido. Cardumen de acuario de interior. Es de los tropicales más tolerantes al frío. En las tiendas se ven sobre todo variedades fluorescentes.',
    fuente: FUENTE,
    temperatura: rangos(
      ideal(
        20,
        24,
        'Superposición de FishBase (18–24 °C), Seriously Fish (18–25 °C) y el MAGyP (20–26 °C). El MAGyP pide no superar nunca los 27 °C.',
      ),
      umbral(20, 24, 'Entre 16 y 20 °C, o entre 24 y 28 °C.'),
      umbral(16, 28, CORTE),
    ),
    ph: rangos(
      ideal(6, 8, 'FishBase, Seriously Fish y el MAGyP.'),
      umbral(6, 8, '5,5–6,0 o 8,0–8,5. Sugerencia de diseño.'),
      umbral(5.5, 8.5, 'Sugerencia de diseño: fuera de 5,5–8,5.'),
    ),
    notaDureza: '5–19 °dH (FishBase, ≈ 89–338 mg/L). Seriously Fish llega a 5–20 dGH.',
    notaTds: 'Pendiente. Piso orientativo ≈ 89 mg/L (estimado).',
    dosis: dosis({
      porToma: 9,
      porTomaHasta: 18,
      porDia: 18,
      porDiaHasta: 36,
      pelletMm: 0.5,
      tomasPorDia: '2',
      tallaReferencia: 'Adulto de 4 cm (≈ 0,661 g)',
      estimacion: true,
      detalle:
        'Estimación para el adulto de referencia. Las tomas de la especie están pendientes. Come en la columna y en la superficie.',
      aclaracion: cardumen('Un cardumen de 10 adultos da 180–360 pellets por día.'),
    }),
    suspensionAlimentacion: suspension({
      bajoC: 16,
      sobreC: 28,
      bajoEsCriterioDeDiseno: true,
      estimacion: true,
      detalle:
        'Por debajo de 16 °C o desde 28 °C. Sugerencia de diseño. El MAGyP pide no superar nunca los 27 °C.',
    }),
    ambiente: ambiente(
      ['acuario-interior'],
      81,
      'Con calefactor en invierno. Cardumen de al menos 8 a 10. El MAGyP pide 100 L. Importa más el largo que la altura.',
      true,
    ),
    foto: foto(
      'Danio_rerio_port.jpg',
      'assets/species/pez-cebra.webp',
      'Hembra de pez cebra de costado, con franjas horizontales claras y oscuras.',
      'Soulkeeper',
      'Dominio público (PD-self)',
      PD_SELF,
    ),
  },
  {
    id: 'sp-betta',
    slug: 'betta',
    nombre: 'Betta',
    nombresComunes: ['Pez luchador'],
    nombreCientifico: 'Betta splendens',
    tiposAgua: ['tropical'],
    tempRecomendadaC: 26,
    tempRecomendadaEstimada: true,
    acuarioDomestico: true,
    ...VACIO,
    guia: 'Introducido. Un macho por acuario, con calefactor y la superficie libre: respira aire. No es para el comunitario común. El acuario tiene que estar tapado.',
    fuente: FUENTE,
    temperatura: rangos(
      ideal(24, 28, 'MAGyP. FishBase da 24–30 °C y Seriously Fish 22–30 °C.'),
      umbral(
        24,
        28,
        'Entre 18 y 24 °C, o entre 28 y 31 °C. FishBase y Seriously Fish llegan a 30 °C.',
      ),
      umbral(
        18,
        31,
        'Suspender la alimentación. Sugerencia de diseño. El límite frío se apoya en un dato de laboratorio: la alimentación baja a 17,5–16,5 °C.',
      ),
    ),
    ph: rangos(
      ideal(
        6,
        7.5,
        'MAGyP. FishBase da 6,0–8,0. Seriously Fish separa silvestres (5,0–7,0) y variedades (6,0–8,0).',
      ),
      umbral(6, 7.5, '5,5–6,0 o 7,5–8,0.'),
      umbral(5.5, 8, 'Sugerencia de diseño: fuera de 5,5–8,0.'),
    ),
    notaDureza: 'Ideal 5–15 dGH. FishBase llega a 19 °dH y Seriously Fish baja hasta 1 dGH.',
    notaTds: 'Pendiente. Piso orientativo ≈ 89 mg/L (estimado).',
    dosis: dosis({
      porToma: 16,
      porTomaHasta: 32,
      porDia: 32,
      porDiaHasta: 64,
      pelletMm: 0.5,
      tomasPorDia: '2',
      tallaReferencia: 'Adulto de 5 cm, cuerpo sin aletas largas (≈ 1,16 g)',
      estimacion: true,
      detalle:
        'Estimación con 0,5–1 % del peso vivo. Hikari indica 6 micro-pellets por toma y 2 tomas (12 por día) para un betta de 3,8 cm. La ficha sugiere arrancar por ese dato y subir solo si sobra comida.',
    }),
    suspensionAlimentacion: suspension({
      bajoC: 18,
      sobreC: 31,
      bajoEsCriterioDeDiseno: true,
      estimacion: true,
      detalle:
        'Por debajo de 18 °C o desde 31 °C. Sugerencia de diseño. En laboratorio, la alimentación baja a 17,5–16,5 °C. El CTmáx está pendiente.',
    }),
    ambiente: ambiente(
      ['acuario-interior'],
      41,
      'Con calefactor, tapado, y la superficie libre para respirar. Lo mejor es tenerlo solo. El MAGyP desalienta los recipientes muy chicos.',
      true,
    ),
    foto: foto(
      'Bojownik_syjamski.jpg',
      'assets/species/betta.webp',
      'Betta macho de costado, con el cuerpo rojo y azul y las aletas grandes desplegadas.',
      'Henryk Niestrój',
      'CC BY 4.0',
      CC_BY_4,
    ),
  },
  {
    id: 'sp-tetra-negro',
    slug: 'tetra-negro',
    nombre: 'Tetra negro',
    nombresComunes: ['Monjita', 'Viuda negra'],
    nombreCientifico: 'Gymnocorymbus ternetzi',
    tiposAgua: ['tropical'],
    tempRecomendadaC: 24,
    tempRecomendadaEstimada: true,
    acuarioDomestico: true,
    ...VACIO,
    guia: 'Nativo del norte argentino, aunque lo que se vende es de criadero. Cardumen de acuario de interior. Puede morder aletas largas.',
    fuente: FUENTE,
    temperatura: rangos(
      ideal(
        23,
        26,
        'MAGyP. FishBase y Seriously Fish dan 20–26 °C. FishBase lo clasifica como subtropical.',
      ),
      umbral(23, 26, 'Entre 18 y 23 °C, o entre 26 y 29 °C.'),
      umbral(18, 29, CORTE),
    ),
    ph: rangos(
      ideal(6, 7, 'Seriously Fish. FishBase da 6,0–8,0 y el MAGyP 5,8–8,0.'),
      umbral(6, 7, '5,8–6,0 o 7,0–8,0.'),
      umbral(5.8, 8, 'Fuera de 5,8–8,0.'),
    ),
    notaDureza: '5–19 °dH (FishBase). Seriously Fish llega a 5–20 dGH.',
    notaTds: 'Pendiente. Piso orientativo ≈ 89 mg/L (estimado).',
    dosis: dosis({
      porToma: 42,
      porTomaHasta: 84,
      porDia: 84,
      porDiaHasta: 170,
      pelletMm: 0.5,
      tomasPorDia: '2',
      tallaReferencia: 'Adulto de 5,5 cm (≈ 3,08 g)',
      estimacion: true,
      detalle:
        'Estimación para el adulto de referencia, con gránulo chico. Las tomas de la especie están pendientes.',
      aclaracion: cardumen('Un cardumen de 10 adultos da 840–1690 pellets por día.'),
    }),
    suspensionAlimentacion: suspension({
      bajoC: 18,
      sobreC: 29,
      bajoEsCriterioDeDiseno: true,
      estimacion: true,
      detalle: 'Por debajo de 18 °C o desde 29 °C. Sugerencia de diseño. CTmín y CTmáx pendientes.',
    }),
    ambiente: ambiente(
      ['acuario-interior'],
      68,
      'Con calefactor. Cardumen de al menos 12 para que no muerda aletas. El MAGyP pide 120 L para 10 ejemplares. Evitar peces de aletas largas.',
      true,
    ),
    foto: foto(
      'Gymnocorymbus_ternetzi.JPG',
      'assets/species/tetra-negro.webp',
      'Tetra negro de costado, plateado con las aletas oscuras, sobre un fondo de madera.',
      'emptyvi',
      'CC BY-SA 3.0',
      CC_BY_SA_3,
    ),
  },
  {
    id: 'sp-cardenal',
    slug: 'cardenal',
    nombre: 'Tetra cardenal',
    nombresComunes: ['Cardenal'],
    nombreCientifico: 'Paracheirodon axelrodi',
    tiposAgua: ['tropical'],
    tempRecomendadaC: 25,
    tempRecomendadaEstimada: true,
    acuarioDomestico: true,
    ...VACIO,
    guia: 'Introducido. No se cría en el país: se importa. Cardumen de acuario de interior, mejor plantado, con agua blanda y ácida. Si el lote es silvestre o de criadero está pendiente.',
    fuente: FUENTE,
    temperatura: rangos(
      ideal(23, 27, 'FishBase. Seriously Fish admite 23–29 °C.'),
      umbral(23, 27, 'Entre 21 y 23 °C, o entre 27 y 30 °C.'),
      umbral(
        21,
        30,
        'Suspender la alimentación. Sugerencia de diseño apoyada en la LT50 de laboratorio: 19,6 °C por frío y 33,3 °C por calor.',
      ),
    ),
    ph: rangos(
      ideal(4, 6, 'FishBase. Seriously Fish admite 3,5–7,5.'),
      umbral(4, 6, '3,5–4,0 o 6,0–7,5 (Seriously Fish).'),
      umbral(3.5, 7.5, 'Fuera de 3,5–7,5. El pH letal de laboratorio es 2,9 y 8,8.'),
    ),
    notaDureza: 'Prefiere agua blanda. FishBase da 5–12 °dH y Seriously Fish 1–12 dGH.',
    notaTds: 'Pendiente. Piso orientativo ≈ 18 mg/L (estimado).',
    dosis: dosis({
      porToma: 7,
      porTomaHasta: 15,
      porDia: 15,
      porDiaHasta: 29,
      pelletMm: 0.5,
      tomasPorDia: '2',
      tallaReferencia: 'Adulto de 3,5 cm (≈ 0,532 g)',
      estimacion: true,
      detalle:
        'Estimación con micro-pellet: la boca es muy chica. Las tomas de la especie están pendientes.',
      aclaracion: cardumen('Un cardumen de 10 adultos da 150–290 pellets por día.'),
    }),
    suspensionAlimentacion: suspension({
      bajoC: 21,
      sobreC: 30,
      bajoEsCriterioDeDiseno: true,
      estimacion: true,
      detalle:
        'Por debajo de 21 °C o desde 30 °C. Sugerencia de diseño. La LT50 a 96 h es 19,6 °C por frío y 33,3 °C por calor.',
    }),
    ambiente: ambiente(
      ['acuario-interior'],
      54,
      'Con calefactor, mejor plantado y con luz tenue. Cardumen de al menos 8 a 10. Los escalares y los discos adultos se lo comen.',
      true,
    ),
    foto: foto(
      'Cardinal_Paracheirodon_axelrodi_(1).jpg',
      'assets/species/cardenal.webp',
      'Tetra cardenal de costado, con la franja azul brillante y el vientre rojo.',
      'CHUCAO',
      'CC BY-SA 3.0',
      CC_BY_SA_3,
    ),
  },
  {
    id: 'sp-escalar',
    slug: 'escalar',
    nombre: 'Escalar',
    nombresComunes: ['Pez ángel'],
    nombreCientifico: 'Pterophyllum scalare',
    tiposAgua: ['tropical'],
    tempRecomendadaC: 27,
    tempRecomendadaEstimada: true,
    acuarioDomestico: true,
    ...VACIO,
    guia: 'Introducido. Acuario alto de interior, con calefactor. Se come a los neones, cardenales y otros peces chicos.',
    fuente: FUENTE,
    temperatura: rangos(
      ideal(24, 30, 'Coinciden FishBase, Seriously Fish y el MAGyP. CTmín y CTmáx pendientes.'),
      umbral(24, 30, 'Entre 22 y 24 °C, o entre 30 y 32 °C.'),
      umbral(22, 32, CORTE),
    ),
    ph: rangos(
      ideal(6, 7.4, 'Seriously Fish. FishBase y el MAGyP dan 6,0–8,0.'),
      umbral(6, 7.4, '5,5–6,0 o 7,4–8,0.'),
      umbral(5.5, 8, 'Fuera de 5,5–8,0.'),
    ),
    notaDureza: '5–13 °dH (FishBase). Seriously Fish admite 0–15 dGH.',
    dosis: dosis({
      porToma: 170,
      porTomaHasta: 340,
      porDia: 340,
      porDiaHasta: 680,
      pelletMm: 0.8,
      tomasPorDia: '2',
      tallaReferencia: 'Adulto de 10 cm (≈ 30,9 g)',
      estimacion: true,
      detalle:
        'Estimación para el adulto de referencia. Come pellet que flote o se hunda despacio. Las tomas de la especie están pendientes.',
    }),
    suspensionAlimentacion: suspension({
      bajoC: 22,
      sobreC: 32,
      bajoEsCriterioDeDiseno: true,
      estimacion: true,
      detalle: 'Por debajo de 22 °C o desde 32 °C. Sugerencia de diseño, no un dato publicado.',
    }),
    ambiente: ambiente(
      ['acuario-interior'],
      200,
      'Acuario alto, con calefactor. El MAGyP pide 300 L. Grupos de 5 o más. No juntarlo con barbos ni tetras negros, que muerden aletas.',
      true,
    ),
    foto: foto(
      'Pterophyllum_scalare_A742578.jpg',
      'assets/species/escalar.webp',
      'Grupo de escalares en un acuario, con el cuerpo alto y las aletas largas.',
      'Rjcastillo',
      'CC BY 4.0',
      CC_BY_4,
    ),
  },
  {
    id: 'sp-barbo-tigre',
    slug: 'barbo-tigre',
    nombre: 'Barbo tigre',
    nombresComunes: ['Barbo sumatrano', 'Sumatrano'],
    nombreCientifico: 'Puntigrus tetrazona',
    tiposAgua: ['tropical'],
    tempRecomendadaC: 23,
    tempRecomendadaEstimada: true,
    acuarioDomestico: true,
    ...VACIO,
    guia: 'Introducido. Cardumen de acuario de interior, con calefactor. Muerde aletas: no juntarlo con guppys, bettas, escalares ni gouramis.',
    fuente: FUENTE,
    temperatura: rangos(
      ideal(20, 26, 'FishBase y Seriously Fish. El MAGyP admite 20–28 °C.'),
      umbral(20, 26, 'Entre 18 y 20 °C, o entre 26 y 30 °C.'),
      umbral(18, 30, CORTE),
    ),
    ph: rangos(
      ideal(6, 8, 'FishBase. Seriously Fish y el MAGyP bajan hasta 5,0.'),
      umbral(6, 8, '5,0–6,0 o 8,0–8,3. El extremo alto es sugerencia de diseño.'),
      umbral(5, 8.3, 'Sugerencia de diseño: fuera de 5,0–8,3.'),
    ),
    notaDureza: '5–19 °dH (FishBase). Seriously Fish admite 1–20 dGH.',
    dosis: dosis({
      porToma: 17,
      porTomaHasta: 34,
      porDia: 34,
      porDiaHasta: 67,
      pelletMm: 0.8,
      tomasPorDia: '2',
      tallaReferencia: 'Adulto de 6 cm (≈ 3,07 g)',
      estimacion: true,
      detalle:
        'Estimación para el adulto de referencia. Las tomas de la especie están pendientes. Un cardumen de 8 adultos da 270–540 pellets de 0,8 mm por día.',
    }),
    suspensionAlimentacion: suspension({
      bajoC: 18,
      sobreC: 30,
      bajoEsCriterioDeDiseno: true,
      estimacion: true,
      detalle:
        'Por debajo de 18 °C o desde 30 °C. Sugerencia de diseño. El CTmín de laboratorio va de 11,66 a 13,94 °C. El CTmáx está pendiente.',
    }),
    ambiente: ambiente(
      ['acuario-interior'],
      72,
      'Con calefactor y espacio para nadar. Cardumen de al menos 8 a 10. El MAGyP pide 160 L.',
      true,
    ),
    foto: foto(
      'Tiger_Barb_700.jpg',
      'assets/species/barbo-tigre.webp',
      'Barbo tigre de costado, con franjas negras verticales y las aletas rojizas.',
      'Derek Ramsey (Ram-Man)',
      'CC BY-SA 2.5',
      CC_BY_SA_25,
    ),
  },
  {
    id: 'sp-corydora-pimienta',
    slug: 'corydora-pimienta',
    nombre: 'Corydora pimienta',
    nombresComunes: ['Limpiafondos'],
    nombreCientifico: 'Corydoras paleatus',
    tiposAgua: ['fria', 'tropical'],
    tempRecomendadaC: 22,
    tempRecomendadaEstimada: true,
    acuarioDomestico: true,
    notaTipoAgua:
      'Las fuentes le dan de 18 a 26 °C (FishBase 18–23 °C, Seriously Fish 22–26 °C), así que tolera agua fría y templada.',
    ...VACIO,
    guia: 'Nativa de Argentina, Brasil y Uruguay. Vive en el fondo, sobre arena fina. Tolera agua fría y templada.',
    fuente: FUENTE,
    temperatura: rangos(
      ideal(20, 24, 'Centro entre FishBase (18–23 °C) y Seriously Fish (22–26 °C).'),
      umbral(20, 24, 'Entre 15 y 20 °C, o entre 24 y 30 °C.'),
      umbral(
        15,
        30,
        'Suspender la alimentación. Sugerencia de diseño. En Corydoras aeneus, la alimentación baja a 14,5–13,5 °C.',
      ),
    ),
    ph: rangos(
      ideal(6, 7, 'Seriously Fish. FishBase da 6,0–8,0.'),
      umbral(6, 7, '7,0–8,0 (FishBase).'),
      umbral(6, 8, 'Por debajo de 6,0 o por encima de 8,0.'),
    ),
    notaDureza: 'Hasta 12 dGH (Seriously Fish). FishBase da 5–19 °dH.',
    dosis: dosis({
      porToma: 22,
      porTomaHasta: 44,
      porDia: 44,
      porDiaHasta: 88,
      pelletMm: 0.8,
      tomasPorDia: '2',
      tallaReferencia: 'Adulto de 6 cm (≈ 4,01 g)',
      estimacion: true,
      detalle:
        'Estimación para el adulto de referencia. Solo cuenta si el pellet se hunde. Un grupo de 5 adultos da 220–440 pellets de 0,8 mm por día. El número mínimo del grupo está pendiente.',
    }),
    avisoAlimentacion: aviso(
      'Solo pellet que se hunda',
      'Come del fondo. Solo pellet que se hunda.',
    ),
    suspensionAlimentacion: suspension({
      bajoC: 15,
      sobreC: 30,
      bajoEsCriterioDeDiseno: true,
      estimacion: true,
      detalle:
        'Por debajo de 15 °C o desde 30 °C. Sugerencia de diseño. En C. aeneus la alimentación baja a 14,5–13,5 °C. El CTmín de esta especie está pendiente.',
    }),
    ambiente: ambiente(
      ['acuario-interior'],
      70,
      'Fondo de arena fina: la grava filosa lastima los barbillones. Conviene un grupo. El número mínimo con fuente está pendiente.',
      true,
    ),
    foto: foto(
      'Corydoras_paleatus_84869641.jpg',
      'assets/species/corydora-pimienta.webp',
      'Corydora pimienta de costado, con manchas oscuras sobre el cuerpo claro, contra el vidrio de un acuario.',
      'Guillermo Debandi',
      'CC BY 4.0',
      CC_BY_4,
    ),
  },
  {
    id: 'sp-otocinclus',
    slug: 'otocinclus',
    nombre: 'Otocinclus',
    nombresComunes: ['Oto'],
    nombreCientifico: 'Otocinclus spp.',
    tiposAgua: ['tropical'],
    tempRecomendadaC: 23,
    tempRecomendadaEstimada: true,
    acuarioDomestico: true,
    ...VACIO,
    guia: 'La ficha es del género. El que más se importa es O. vestitus; O. arnoldi es nativo del bajo Paraná. Qué especie se vende en Argentina está pendiente. Acuario plantado y maduro.',
    fuente: FUENTE,
    temperatura: rangos(
      ideal(
        21,
        26,
        'FishBase da 20–26 °C para O. affinis. Seriously Fish da 21–26 °C para O. macrospilus. CTmín y CTmáx pendientes.',
      ),
      umbral(21, 26, 'Entre 18 y 21 °C, o entre 26 y 29 °C.'),
      umbral(18, 29, 'Alarmas de diseño. El alimentador no dosifica esta especie.'),
    ),
    ph: rangos(
      ideal(
        6,
        7.5,
        'La ficha toma 6,0–7,5. Seriously Fish, para O. macrospilus, da 5,5–7,5. FishBase, para O. affinis, da 6,0–8,0.',
      ),
      umbral(6, 7.5, '5,5–6,0 o 7,5–8,0.'),
      umbral(5.5, 8, 'Sugerencia de diseño: fuera de 5,5–8,0.'),
    ),
    notaDureza: '1–12 dGH (Seriously Fish). FishBase, para O. affinis, da 5–19 °dH.',
    dosis: dosis({
      porToma: 0,
      porTomaHasta: null,
      porDia: 0,
      pelletMm: null,
      tomasPorDia: null,
      tallaReferencia: 'Adulto de 4 cm (≈ 0,680 g)',
      estimacion: false,
      detalle:
        'El alimentador le da 0 pellets. La ficha estima 0,0034–0,0068 g/día de alimento vegetal para un adulto de 4 cm, solo como referencia para dar a mano.',
    }),
    avisoAlimentacion: aviso(
      'No come pellets',
      'No come pellets: raspa algas. Wafers de algas y verduras a mano. El alimentador le da 0 pellets.',
    ),
    suspensionAlimentacion: suspension({
      bajoC: 18,
      sobreC: 29,
      bajoEsCriterioDeDiseno: true,
      estimacion: true,
      detalle:
        'No corresponde un corte de alimentación del alimentador, porque le da 0 pellets. Las alarmas por debajo de 18 °C y desde 29 °C son sugerencia de diseño.',
    }),
    ambiente: ambiente(
      ['acuario-interior'],
      41,
      'Acuario plantado y maduro, con algas y biofilm. Grupos de al menos 6. Solo con peces chicos y tranquilos.',
      true,
    ),
    foto: foto(
      'Otocinclus_vestitus.jpg',
      'assets/species/otocinclus.webp',
      'Otocinclus de costado, con una franja negra horizontal, entre plantas.',
      'Fremen',
      'CC BY-SA 4.0',
      CC_BY_SA_4,
    ),
  },
  {
    id: 'sp-ancistrus',
    slug: 'ancistrus',
    nombre: 'Ancistrus',
    nombresComunes: ['Limpiavidrios', 'Cara de bigote'],
    nombreCientifico: 'Ancistrus spp.',
    tiposAgua: ['tropical'],
    tempRecomendadaC: 24,
    tempRecomendadaEstimada: true,
    acuarioDomestico: true,
    ...VACIO,
    guia: 'El ancistrus del comercio es de origen incierto. La ficha es del género. Acuario con escondites y buena oxigenación. Qué especie se vende en Argentina está pendiente.',
    fuente: FUENTE,
    temperatura: rangos(
      ideal(21, 26, 'Seriously Fish. CTmín y CTmáx pendientes.'),
      umbral(21, 26, 'Entre 18 y 21 °C, o entre 26 y 30 °C.'),
      umbral(18, 30, CORTE),
    ),
    ph: rangos(
      ideal(5.5, 7.5, 'Seriously Fish.'),
      umbral(5.5, 7.5, '5,0–5,5 o 7,5–8,0. Sugerencia de diseño.'),
      umbral(5, 8, 'Sugerencia de diseño: fuera de 5,0–8,0.'),
    ),
    notaDureza: '1–15 dGH (Seriously Fish).',
    dosis: dosis({
      porToma: 77,
      porTomaHasta: 150,
      porDia: 150,
      porDiaHasta: 310,
      pelletMm: 0.8,
      tomasPorDia: '2',
      tallaReferencia: 'Adulto de 10 cm (≈ 14,1 g)',
      estimacion: true,
      detalle:
        'Estimación para el adulto de referencia. La ficha deja las tomas en 1 o 2, de noche; los pellets por toma salen de repartir el día en 2. Solo si el pellet o la pastilla se hunden, y hay que sumar verduras a mano.',
    }),
    avisoAlimentacion: aviso(
      'Pellet que se hunda',
      'Pellet o pastilla que se hunda, más verduras a mano.',
    ),
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
      'Bien oxigenado, con cuevas. Un ejemplar o una pareja: es territorial. Lo que importa es el fondo.',
      true,
    ),
    foto: foto(
      'Ancistrus_sp._in_aquarium.jpg',
      'assets/species/ancistrus.webp',
      'Ancistrus sobre la grava, con el cuerpo moteado de blanco y la boca hacia abajo.',
      'Júlio Reis',
      'CC BY-SA 4.0',
      CC_BY_SA_4,
    ),
  },
  {
    id: 'sp-disco',
    slug: 'disco',
    nombre: 'Disco',
    nombreCientifico: 'Symphysodon spp.',
    tiposAgua: ['tropical'],
    tempRecomendadaC: 28,
    tempRecomendadaEstimada: true,
    acuarioDomestico: true,
    ...VACIO,
    guia: 'Introducido. La ficha cubre el género (S. aequifasciatus y S. discus). Acuario de interior, con calefactor y agua muy blanda. El MAGyP da 30 cm de largo máximo y FishBase 12,3–13,7 cm de longitud estándar: la ficha se queda con 15 cm de largo total.',
    fuente: FUENTE,
    temperatura: rangos(
      ideal(
        27,
        30,
        'Superposición de FishBase (26–30 °C) y el MAGyP (27–31 °C). CTmín y CTmáx pendientes.',
      ),
      umbral(27, 30, 'Entre 24 y 27 °C, o entre 30 y 33 °C.'),
      umbral(24, 33, CORTE),
    ),
    ph: rangos(
      ideal(5, 6.5, 'Sugerencia de diseño: FishBase da 5,0–8,0 y el MAGyP 4,2–6,5.'),
      umbral(5, 6.5, '4,2–5,0 o 6,5–7,5.'),
      umbral(4.2, 7.5, 'Sugerencia de diseño: fuera de 4,2–7,5.'),
    ),
    notaDureza: '0–12 °dH (FishBase). Agua muy blanda.',
    dosis: dosis({
      porToma: 220,
      porTomaHasta: 450,
      porDia: 450,
      porDiaHasta: 890,
      pelletMm: 1.1,
      tomasPorDia: '2',
      tallaReferencia: 'Adulto de 15 cm (≈ 98,5 g)',
      estimacion: true,
      detalle:
        'Estimación para el adulto de referencia. Come gránulo que se hunda despacio. La ficha deja las tomas en 2 o 3; los pellets por toma salen de 2.',
    }),
    suspensionAlimentacion: suspension({
      bajoC: 24,
      sobreC: 33,
      bajoEsCriterioDeDiseno: true,
      estimacion: true,
      detalle: 'Por debajo de 24 °C o desde 33 °C. Sugerencia de diseño, no un dato publicado.',
    }),
    ambiente: ambiente(
      ['acuario-interior'],
      255,
      'Con calefactor. El MAGyP pide 300 L. Al menos 3 ejemplares. Acuario alto, con plantas para esconderse.',
      true,
    ),
    foto: foto(
      'Symphysodon_aequifasciatus_-_Karlsruhe_Zoo_04.jpg',
      'assets/species/disco.webp',
      'Disco anaranjado de costado, con el ojo rojo, en un acuario.',
      'H. Zell',
      'CC BY-SA 3.0',
      CC_BY_SA_3,
    ),
  },
  {
    id: 'sp-gourami-azul',
    slug: 'gourami-azul',
    nombre: 'Gourami azul',
    nombresComunes: ['Tricho'],
    nombreCientifico: 'Trichopodus trichopterus',
    tiposAgua: ['tropical'],
    tempRecomendadaC: 26,
    tempRecomendadaEstimada: true,
    acuarioDomestico: true,
    ...VACIO,
    guia: 'Introducido. Acuario de interior con calefactor. Respira aire: la superficie tiene que quedar libre. El macho puede ser agresivo.',
    fuente: FUENTE,
    temperatura: rangos(
      ideal(
        24,
        28,
        'Superposición de FishBase (22–28 °C), Seriously Fish (24–30 °C) y el MAGyP (23–28 °C).',
      ),
      umbral(24, 28, 'Entre 20 y 24 °C, o entre 28 y 32 °C.'),
      umbral(20, 32, CORTE),
    ),
    ph: rangos(
      ideal(6, 8, 'FishBase y el MAGyP. Seriously Fish admite 5,5–8,5.'),
      umbral(6, 8, '5,5–6,0 o 8,0–8,5.'),
      umbral(5.5, 8.5, 'Sugerencia de diseño: fuera de 5,5–8,5.'),
    ),
    notaDureza: '5–19 °dH (FishBase). Seriously Fish admite 3–35 dGH.',
    dosis: dosis({
      porToma: 66,
      porTomaHasta: 130,
      porDia: 130,
      porDiaHasta: 260,
      pelletMm: 1.1,
      tomasPorDia: '2',
      tallaReferencia: 'Adulto de 11 cm (≈ 29,2 g)',
      estimacion: true,
      detalle:
        'Estimación para el adulto de referencia, con pellet flotante. Las tomas de la especie están pendientes.',
    }),
    suspensionAlimentacion: suspension({
      bajoC: 20,
      sobreC: 32,
      bajoEsCriterioDeDiseno: true,
      estimacion: true,
      detalle: 'Por debajo de 20 °C o desde 32 °C. Sugerencia de diseño. CTmín y CTmáx pendientes.',
    }),
    ambiente: ambiente(
      ['acuario-interior'],
      81,
      'Con calefactor, plantas flotantes y la superficie libre. El MAGyP pide 200 L y 3 hembras por macho. No juntarlo con peces que muerden aletas.',
      true,
    ),
    foto: foto(
      'Trichopodus_trichopterus_(3_spot_gourami,_Philippines)_01.jpg',
      'assets/species/gourami-azul.webp',
      'Gourami de tres puntos, plateado con dos manchas negras, entre troncos y plantas.',
      'Obsidian Soul',
      'CC0',
      CC0,
    ),
  },
];
