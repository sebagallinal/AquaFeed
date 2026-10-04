import { ESPECIES } from './especies.mock';

const CIENTIFICOS = [
  'Poecilia reticulata',
  'Paracheirodon innesi',
  'Poecilia sphenops',
  'Poecilia latipinna',
  'Xiphophorus maculatus',
  'Xiphophorus hellerii',
  'Danio rerio',
  'Betta splendens',
  'Gymnocorymbus ternetzi',
  'Paracheirodon axelrodi',
  'Pterophyllum scalare',
  'Puntigrus tetrazona',
  'Corydoras paleatus',
  'Otocinclus spp.',
  'Ancistrus spp.',
  'Symphysodon spp.',
  'Trichopodus trichopterus',
  'Oncorhynchus mykiss',
  'Salmo trutta',
  'Salmo salar',
  'Carassius auratus',
  'Cyprinus carpio',
  'Tanichthys albonubes',
  'Odontesthes bonariensis',
] as const;

const TEMP_RECOMENDADA: Record<string, number> = {
  guppy: 25,
  neon: 23,
  molly: 25,
  'molly-vela': 24,
  platy: 23,
  xipho: 24,
  'pez-cebra': 22,
  betta: 26,
  'tetra-negro': 24,
  cardenal: 25,
  escalar: 27,
  'barbo-tigre': 23,
  'corydora-pimienta': 22,
  otocinclus: 23,
  ancistrus: 24,
  disco: 28,
  'gourami-azul': 26,
  'trucha-arcoiris': 14,
  'trucha-marron': 14,
  'salmon-atlantico': 14,
  goldfish: 21,
  koi: 21,
  'nubes-blancas': 20,
  pejerrey: 21,
};

describe('catálogo de especies', () => {
  it('tiene las 24 especies', () => {
    expect(ESPECIES).toHaveLength(24);
    expect(ESPECIES.map((especie) => especie.nombreCientifico)).toEqual([...CIENTIFICOS]);
    expect(ESPECIES.filter((especie) => especie.tiposAgua.includes('tropical'))).toHaveLength(17);
    expect(ESPECIES.filter((especie) => especie.tiposAgua.includes('fria'))).toHaveLength(8);
  });

  it('guarda la temperatura recomendada de cada perfil', () => {
    for (const especie of ESPECIES) {
      expect(especie.tempRecomendadaC).toBe(TEMP_RECOMENDADA[especie.slug]);
      expect(especie.tempRecomendadaEstimada).toBe(true);
    }
  });

  it('marca como estimación los pellets y el corte de las tropicales, y deja el TDS pendiente', () => {
    const originales = ['guppy', 'neon', 'molly', 'molly-vela', 'platy'];
    for (const especie of ESPECIES.filter((item) => originales.includes(item.slug))) {
      expect(especie.dosis?.estimacion).toBe(true);
      expect(especie.suspensionAlimentacion?.estimacion).toBe(true);
      expect(especie.notaTds).toBeUndefined();
      expect(especie.tdsMaxPpm).toBeNull();
    }
    const guppy = ESPECIES.find((especie) => especie.slug === 'guppy');
    expect(guppy?.dosis).toMatchObject({
      porToma: 28,
      porTomaHasta: 55,
      porDia: 55,
      porDiaHasta: 110,
    });
    expect(guppy?.suspensionAlimentacion).toMatchObject({ bajoC: 17, sobreC: 32 });
    expect(guppy?.ambiente).toMatchObject({
      tipos: ['acuario-interior'],
      volumenMinLitros: 41,
      volumenEstimado: true,
    });
  });

  it('separa los dos molly y no inventa litros donde la ficha los deja pendientes', () => {
    expect(ESPECIES.find((especie) => especie.slug === 'molly')?.nombre).toBe(
      'Molly de aleta corta',
    );
    expect(ESPECIES.find((especie) => especie.slug === 'molly-vela')?.nombreCientifico).toBe(
      'Poecilia latipinna',
    );
    for (const slug of ['trucha-arcoiris', 'trucha-marron', 'pejerrey']) {
      expect(
        ESPECIES.find((especie) => especie.slug === slug)?.ambiente.volumenMinLitros,
      ).toBeNull();
    }
  });

  it('pone el koi en estanque y marca trucha, salmón y pejerrey como no aptos', () => {
    expect(ESPECIES.find((especie) => especie.slug === 'koi')?.ambiente.tipos).toEqual([
      'estanque',
    ]);
    expect(ESPECIES.find((especie) => especie.slug === 'koi')?.acuarioDomestico).toBe(false);
    const noAptos = ['trucha-arcoiris', 'trucha-marron', 'salmon-atlantico', 'pejerrey'];
    for (const slug of noAptos) {
      const especie = ESPECIES.find((item) => item.slug === slug);
      expect(especie?.acuarioDomestico).toBe(false);
      expect(especie?.ambiente.tipos).toEqual(['no-apto-acuario-domestico']);
    }
  });

  it('pone a la corydora en agua fría y en tropical, con la nota de temperatura', () => {
    const cory = ESPECIES.find((especie) => especie.slug === 'corydora-pimienta');
    expect(cory?.tiposAgua).toEqual(['fria', 'tropical']);
    expect(cory?.notaTipoAgua).toContain('18 a 26');
    expect(cory?.notaTipoAgua).toContain('FishBase 18–23');
    expect(cory?.notaTipoAgua).toContain('Seriously Fish 22–26');
    expect(cory?.ambiente.tipos).toEqual(['acuario-interior']);
  });

  it('avisa la alimentación de oto, corydora y ancistrus, y deja en 0 los pellets del oto', () => {
    const aviso = (slug: string) => ESPECIES.find((especie) => especie.slug === slug);
    expect(aviso('otocinclus')?.avisoAlimentacion).toEqual({
      resumen: 'No come pellets',
      detalle:
        'No come pellets: raspa algas. Wafers de algas y verduras a mano. El alimentador le da 0 pellets.',
    });
    expect(aviso('otocinclus')?.dosis).toMatchObject({ porDia: 0, porToma: 0, estimacion: false });
    expect(aviso('corydora-pimienta')?.avisoAlimentacion?.detalle).toBe(
      'Come del fondo. Solo pellet que se hunda.',
    );
    expect(aviso('ancistrus')?.avisoAlimentacion?.detalle).toBe(
      'Pellet o pastilla que se hunda, más verduras a mano.',
    );
    expect(aviso('guppy')?.avisoAlimentacion).toBeUndefined();
    expect(aviso('betta')?.avisoAlimentacion).toBeUndefined();
  });

  it('aclara los cardúmenes de pellet de 0,5 mm sin cambiar el número', () => {
    const dosis = (slug: string) => ESPECIES.find((especie) => especie.slug === slug)?.dosis;
    expect(dosis('tetra-negro')).toMatchObject({ porDia: 84, porDiaHasta: 170, pelletMm: 0.5 });
    expect(dosis('tetra-negro')?.aclaracion).toContain('840–1690');
    expect(dosis('pez-cebra')?.aclaracion).toContain('180–360');
    expect(dosis('cardenal')?.aclaracion).toContain('150–290');
    expect(dosis('neon')?.aclaracion).toContain('90–180');
    for (const slug of ['neon', 'pez-cebra', 'tetra-negro', 'cardenal']) {
      expect(dosis(slug)?.aclaracion).toContain('pellet de 0,5 mm');
      expect(dosis(slug)?.aclaracion).toContain('se define después');
    }
    expect(dosis('betta')?.aclaracion).toBeUndefined();
    expect(dosis('betta')).toMatchObject({ porDia: 32, porDiaHasta: 64 });
  });

  it('deja en acuario a las especies nuevas y solo al goldfish en acuario y estanque', () => {
    const nuevas = [
      'xipho',
      'pez-cebra',
      'betta',
      'tetra-negro',
      'cardenal',
      'escalar',
      'barbo-tigre',
      'corydora-pimienta',
      'otocinclus',
      'ancistrus',
      'disco',
      'gourami-azul',
    ];
    for (const slug of nuevas) {
      expect(ESPECIES.find((especie) => especie.slug === slug)?.ambiente.tipos).toEqual([
        'acuario-interior',
      ]);
    }
    const ambos = ESPECIES.filter(
      (especie) =>
        especie.ambiente.tipos.includes('acuario-interior') &&
        especie.ambiente.tipos.includes('estanque'),
    ).map((especie) => especie.slug);
    expect(ambos).toEqual(['goldfish']);
  });

  it('tiene foto con crédito en las 24', () => {
    for (const especie of ESPECIES) {
      expect(especie.foto.src).toMatch(/^assets\/species\/.+\.webp$/);
      expect(especie.foto.alt.length).toBeGreaterThan(10);
      expect(especie.foto.autor.length).toBeGreaterThan(0);
      expect(especie.foto.licenciaUrl).toMatch(/^https:\/\//);
      expect(especie.foto.pagina).toContain('commons.wikimedia.org');
    }
  });
});
