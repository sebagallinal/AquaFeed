import { haceCuanto } from './formato';

describe('haceCuanto', () => {
  const ahora = 1_700_000_000_000;

  it('no dice 0 minutos cuando pasó menos de un minuto', () => {
    expect(haceCuanto(ahora / 1000 - 55, ahora)).toBe('hace unos segundos');
    expect(haceCuanto(ahora / 1000 - 90, ahora)).toBe('hace 1 minuto');
  });
});
