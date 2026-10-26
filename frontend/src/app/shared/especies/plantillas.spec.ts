import { CLAVE_PLANTILLAS, especiePorId, guardarPlantilla, validarPlantilla } from './plantillas';

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
    expect(guardarPlantilla('usr-nahuel', { ...BASE, nombre: 'Con foto', fotoSrc: foto }).foto.src).toBe(
      foto,
    );
    expect(validarPlantilla({ ...BASE, fotoSrc: 'https://ejemplo.com/pez.jpg' })).toContain('foto');
  });
});
