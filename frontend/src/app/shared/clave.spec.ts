import { generarClave, ID_DISPOSITIVO, normalizarIdDispositivo } from './clave';

describe('generarClave', () => {
  it('genera claves del largo pedido sin caracteres confusos', () => {
    const clave = generarClave(12);
    expect(clave).toHaveLength(12);
    expect(clave).not.toMatch(/[0O1lI]/);
    expect(generarClave()).not.toBe(generarClave());
  });
});

describe('ID de dispositivo', () => {
  it('acepta af- y 12 hexadecimales', () => {
    expect(ID_DISPOSITIVO.test(normalizarIdDispositivo(' AF-240AC45ED754 '))).toBe(true);
    expect(ID_DISPOSITIVO.test('af-240ac45ed75')).toBe(false);
    expect(ID_DISPOSITIVO.test('240ac45ed754')).toBe(false);
  });
});
