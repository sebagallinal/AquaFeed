import {
  armarPlantilla,
  CLAVE_PLANTILLAS,
  datosDePlantilla,
  especiePorId,
  guardarPlantilla,
  nuevoIdPlantilla,
  validarPlantilla,
} from './plantillas';

const BASE = {
  nombre: 'Betta de la sala',
  tipoAgua: 'tropical' as const,
  tempMin: 24,
  tempMax: 28,
  phMin: 6.5,
  phMax: 7.5,
  tdsMax: 200,
  porciones: 2,
  tomasPorDia: 2,
};

describe('plantillas personalizadas', () => {
  beforeEach(() => localStorage.removeItem(CLAVE_PLANTILLAS));
  afterEach(() => localStorage.removeItem(CLAVE_PLANTILLAS));

  it('rechaza un rango de temperatura al revés', () => {
    expect(validarPlantilla({ ...BASE, tempMin: 30, tempMax: 20 })).toContain('temperatura');
  });

  it('guarda la plantilla del usuario y se puede buscar por id', () => {
    const perfil = guardarPlantilla('usr-nahuel', BASE);

    expect(perfil.personalizada).toBe(true);
    expect(perfil.temperatura?.ideal.intervalo).toEqual({ min: 24, max: 28 });
    expect(especiePorId(perfil.id)?.nombre).toBe('Betta de la sala');
    expect(especiePorId('sp-guppy')?.slug).toBe('guppy');
    expect(guardarPlantilla('usr-horacio', { ...BASE, nombre: 'Otra' }).id).not.toBe(perfil.id);
  });

  it('guarda la foto subida y rechaza una que no es imagen', () => {
    const foto = 'data:image/jpeg;base64,abc';
    expect(
      guardarPlantilla('usr-nahuel', { ...BASE, nombre: 'Con foto', fotoSrc: foto }).foto.src,
    ).toBe(foto);
    expect(validarPlantilla({ ...BASE, fotoSrc: 'https://ejemplo.com/pez.jpg' })).toContain('foto');
  });
});

describe('especies propias en el backend', () => {
  it('genera ids con el formato que acepta el backend', () => {
    expect(nuevoIdPlantilla()).toMatch(/^pers-[0-9a-f]{12}$/);
  });

  it('recupera los datos cargados a partir de la ficha armada', () => {
    const perfil = armarPlantilla('pers-0123456789ab', BASE);
    expect(perfil.id).toBe('pers-0123456789ab');
    expect(datosDePlantilla(perfil)).toEqual({ ...BASE, fotoSrc: null });
  });

  it('conserva una foto propia y descarta el dibujo genérico', () => {
    const foto = 'data:image/jpeg;base64,AAAA';
    expect(
      datosDePlantilla(armarPlantilla('pers-0123456789ab', { ...BASE, fotoSrc: foto })).fotoSrc,
    ).toBe(foto);
  });
});
