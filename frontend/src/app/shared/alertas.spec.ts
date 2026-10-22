import { aplicarEspecie, listaSensores, rangoIdeal } from './alertas';
import { ESPECIES } from './data/especies.mock';
import { CONFIG_ALERTAS_DEFECTO, type ConfigAlertas } from './models/alerta.model';

const GUPPY = ESPECIES.find((e) => e.slug === 'guppy')!;
const PEJERREY = ESPECIES.find((e) => e.slug === 'pejerrey')!;

describe('aplicarEspecie', () => {
  it('cambia los límites de los sensores que siguen a la especie', () => {
    const guppy = rangoIdeal(GUPPY, 'temp')!;
    const pejerrey = rangoIdeal(PEJERREY, 'temp')!;
    expect(guppy).not.toEqual(pejerrey);

    const config: ConfigAlertas = {
      ...CONFIG_ALERTAS_DEFECTO,
      tempMin: guppy.min,
      tempMax: guppy.max,
      tempEspecie: true,
    };
    const resultado = aplicarEspecie(config, PEJERREY);
    expect(resultado.config.tempMin).toBe(pejerrey.min);
    expect(resultado.config.tempMax).toBe(pejerrey.max);
    expect(resultado.actualizados).toEqual(['temp']);
    expect(resultado.config.tempEspecie).toBe(true);
  });

  it('no toca los límites personalizados', () => {
    const config: ConfigAlertas = { ...CONFIG_ALERTAS_DEFECTO, tempMin: 20, tempMax: 30 };
    const resultado = aplicarEspecie(config, PEJERREY);
    expect(resultado.config).toEqual(config);
    expect(resultado.actualizados).toEqual([]);
  });

  it('deja sin controlar el sensor si la ficha nueva no trae rango', () => {
    const config: ConfigAlertas = {
      ...CONFIG_ALERTAS_DEFECTO,
      tempMin: 22,
      tempMax: 28,
      tempEspecie: true,
    };
    const resultado = aplicarEspecie(config, null);
    expect(resultado.config.tempMin).toBeNull();
    expect(resultado.config.tempMax).toBeNull();
    expect(resultado.sinRango).toEqual(['temp']);
  });
});

describe('listaSensores', () => {
  it('arma la lista en castellano', () => {
    expect(listaSensores(['temp'])).toBe('temperatura');
    expect(listaSensores(['temp', 'ph'])).toBe('temperatura y pH');
    expect(listaSensores(['temp', 'ph', 'tds'])).toBe('temperatura, pH y TDS');
  });
});
