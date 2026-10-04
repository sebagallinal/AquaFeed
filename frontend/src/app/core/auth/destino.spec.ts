import { destinoSeguro, rutaPorRol } from './destino';

describe('destinoSeguro', () => {
  it('manda a cada rol a su inicio', () => {
    expect(rutaPorRol('admin')).toBe('/admin');
    expect(rutaPorRol('user')).toBe('/app');
    expect(destinoSeguro(null, 'user')).toBe('/app');
    expect(destinoSeguro(null, 'admin')).toBe('/admin');
  });

  it('respeta un retorno interno del mismo rol', () => {
    expect(destinoSeguro('/app/alertas', 'user')).toBe('/app/alertas');
    expect(destinoSeguro('/admin/usuarios', 'admin')).toBe('/admin/usuarios');
    expect(destinoSeguro('/app/dispositivos/af-1', 'admin')).toBe('/app/dispositivos/af-1');
  });

  it('rechaza destinos externos o de otro rol', () => {
    expect(destinoSeguro('https://evil.test', 'user')).toBe('/app');
    expect(destinoSeguro('//evil.test', 'admin')).toBe('/admin');
    expect(destinoSeguro('/admin', 'user')).toBe('/app');
    expect(destinoSeguro('/app/../admin', 'user')).toBe('/app');
  });
});
