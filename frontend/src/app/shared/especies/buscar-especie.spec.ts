import { ESPECIES } from '../data/especies.mock';
import { avisoDeEspecie, filtrarEspecies, normalizarBusqueda } from './buscar-especie';

describe('normalizarBusqueda', () => {
  it('ignora mayúsculas y acentos', () => {
    expect(normalizarBusqueda('  Neón  ')).toBe('neon');
    expect(normalizarBusqueda('ARCOÍRIS')).toBe('arcoiris');
  });
});

describe('filtrarEspecies', () => {
  it('con la consulta vacía devuelve las 24', () => {
    expect(filtrarEspecies(ESPECIES, '   ')).toHaveLength(24);
  });

  it('encuentra por nombre común sin acento ni mayúsculas', () => {
    const neon = filtrarEspecies(ESPECIES, 'neon');
    expect(neon.map((especie) => especie.slug)).toEqual(['neon']);

    const trucha = filtrarEspecies(ESPECIES, 'TRUCHA ARCOIRIS');
    expect(trucha.map((especie) => especie.slug)).toEqual(['trucha-arcoiris']);
  });

  it('encuentra por nombre científico', () => {
    expect(filtrarEspecies(ESPECIES, 'Oncorhynchus').map((especie) => especie.slug)).toEqual([
      'trucha-arcoiris',
    ]);
    expect(
      filtrarEspecies(ESPECIES, 'tanichthys albonubes').map((especie) => especie.slug),
    ).toEqual(['nubes-blancas']);
    expect(filtrarEspecies(ESPECIES, 'poecilia').map((especie) => especie.slug)).toEqual([
      'guppy',
      'molly',
      'molly-vela',
    ]);
    expect(filtrarEspecies(ESPECIES, 'latipinna').map((especie) => especie.slug)).toEqual([
      'molly-vela',
    ]);
  });

  it('encuentra alias de la ficha', () => {
    expect(filtrarEspecies(ESPECIES, 'pez dorado').map((especie) => especie.slug)).toEqual([
      'goldfish',
    ]);
    expect(filtrarEspecies(ESPECIES, 'white cloud').map((especie) => especie.slug)).toEqual([
      'nubes-blancas',
    ]);
  });

  it('no mezcla trucha marrón con salmón cuando el epíteto es distinto', () => {
    expect(filtrarEspecies(ESPECIES, 'trutta').map((especie) => especie.slug)).toEqual([
      'trucha-marron',
    ]);
  });

  it('avisa con una lista vacía si no hay coincidencias', () => {
    expect(filtrarEspecies(ESPECIES, 'pez payaso')).toEqual([]);
  });

  it('filtra por agua fría o tropical y por defecto muestra todas', () => {
    expect(filtrarEspecies(ESPECIES, '', 'todas')).toHaveLength(24);
    expect(filtrarEspecies(ESPECIES, '', 'fria').map((especie) => especie.slug)).toEqual([
      'corydora-pimienta',
      'trucha-arcoiris',
      'trucha-marron',
      'salmon-atlantico',
      'goldfish',
      'koi',
      'nubes-blancas',
      'pejerrey',
    ]);
    expect(filtrarEspecies(ESPECIES, '', 'tropical').map((especie) => especie.slug)).toEqual([
      'guppy',
      'neon',
      'molly',
      'molly-vela',
      'platy',
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
    ]);
  });

  it('combina el filtro de agua con la búsqueda', () => {
    expect(filtrarEspecies(ESPECIES, 'trucha', 'fria').map((especie) => especie.slug)).toEqual([
      'trucha-arcoiris',
      'trucha-marron',
    ]);
    expect(filtrarEspecies(ESPECIES, 'molly', 'tropical').map((especie) => especie.slug)).toEqual([
      'molly',
      'molly-vela',
    ]);
    expect(filtrarEspecies(ESPECIES, 'poecilia', 'fria')).toEqual([]);
    expect(filtrarEspecies(ESPECIES, 'oncorhynchus', 'tropical')).toEqual([]);
  });

  it('filtra por ambiente y el goldfish entra en acuario y en estanque', () => {
    expect(filtrarEspecies(ESPECIES, '', 'todas', 'todos')).toHaveLength(24);
    expect(
      filtrarEspecies(ESPECIES, '', 'todas', 'acuario').map((especie) => especie.slug),
    ).toEqual([
      'guppy',
      'neon',
      'molly',
      'molly-vela',
      'platy',
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
      'goldfish',
      'nubes-blancas',
    ]);
    expect(
      filtrarEspecies(ESPECIES, '', 'todas', 'estanque').map((especie) => especie.slug),
    ).toEqual(['goldfish', 'koi']);
    expect(
      filtrarEspecies(ESPECIES, '', 'todas', 'no-apto').map((especie) => especie.slug),
    ).toEqual(['trucha-arcoiris', 'trucha-marron', 'salmon-atlantico', 'pejerrey']);
  });

  it('combina tipo de agua, ambiente y búsqueda', () => {
    expect(
      filtrarEspecies(ESPECIES, 'gold', 'fria', 'acuario').map((especie) => especie.slug),
    ).toEqual(['goldfish']);
    expect(
      filtrarEspecies(ESPECIES, '', 'fria', 'estanque').map((especie) => especie.slug),
    ).toEqual(['goldfish', 'koi']);
    expect(
      filtrarEspecies(ESPECIES, 'koi', 'fria', 'estanque').map((especie) => especie.slug),
    ).toEqual(['koi']);
    expect(
      filtrarEspecies(ESPECIES, 'trucha', 'fria', 'no-apto').map((especie) => especie.slug),
    ).toEqual(['trucha-arcoiris', 'trucha-marron']);
    expect(
      filtrarEspecies(ESPECIES, 'molly', 'tropical', 'acuario').map((especie) => especie.slug),
    ).toEqual(['molly', 'molly-vela']);
    expect(filtrarEspecies(ESPECIES, 'poecilia', 'tropical', 'estanque')).toEqual([]);
    expect(filtrarEspecies(ESPECIES, 'guppy', 'fria', 'acuario')).toEqual([]);
    expect(
      filtrarEspecies(ESPECIES, 'pimienta', 'fria', 'acuario').map((especie) => especie.slug),
    ).toEqual(['corydora-pimienta']);
    expect(
      filtrarEspecies(ESPECIES, 'paleatus', 'tropical', 'acuario').map((especie) => especie.slug),
    ).toEqual(['corydora-pimienta']);
    expect(filtrarEspecies(ESPECIES, 'corydora', 'tropical', 'estanque')).toEqual([]);
    expect(filtrarEspecies(ESPECIES, 'xipho', 'fria', 'acuario')).toEqual([]);
    expect(
      filtrarEspecies(ESPECIES, 'cebrita', 'tropical', 'acuario').map((especie) => especie.slug),
    ).toEqual(['pez-cebra']);
  });

  it('la corydora aparece en agua fría y en tropical', () => {
    const fria = filtrarEspecies(ESPECIES, '', 'fria').map((especie) => especie.slug);
    const tropical = filtrarEspecies(ESPECIES, '', 'tropical').map((especie) => especie.slug);
    expect(fria).toContain('corydora-pimienta');
    expect(tropical).toContain('corydora-pimienta');
    expect(filtrarEspecies(ESPECIES, 'corydora', 'fria').map((especie) => especie.slug)).toEqual([
      'corydora-pimienta',
    ]);
    expect(
      filtrarEspecies(ESPECIES, 'corydora', 'tropical').map((especie) => especie.slug),
    ).toEqual(['corydora-pimienta']);
  });

  it('solo el goldfish está en acuario y en estanque', () => {
    const acuario = new Set(
      filtrarEspecies(ESPECIES, '', 'todas', 'acuario').map((especie) => especie.slug),
    );
    const estanque = filtrarEspecies(ESPECIES, '', 'todas', 'estanque').map(
      (especie) => especie.slug,
    );
    expect(estanque.filter((slug) => acuario.has(slug))).toEqual(['goldfish']);
    expect(estanque).toEqual(['goldfish', 'koi']);
  });
});

describe('avisoDeEspecie', () => {
  it('marca trucha, salmón y pejerrey, y al koi solo de estanque', () => {
    const aviso = (slug: string) =>
      avisoDeEspecie(ESPECIES.find((especie) => especie.slug === slug)!);
    expect(aviso('trucha-arcoiris')).toBe('No apto para acuario');
    expect(aviso('trucha-marron')).toBe('No apto para acuario');
    expect(aviso('salmon-atlantico')).toBe('No apto para acuario');
    expect(aviso('pejerrey')).toBe('No apto para acuario');
    expect(aviso('koi')).toBe('Solo estanque');
    expect(aviso('goldfish')).toBeNull();
    expect(aviso('guppy')).toBeNull();
  });
});
