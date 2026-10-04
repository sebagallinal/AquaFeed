import type { PerfilEspecie, TipoAmbiente } from '../models/perfil-especie.model';

export type FiltroAgua = 'todas' | 'fria' | 'tropical';
export type FiltroAmbiente = 'todos' | 'acuario' | 'estanque' | 'no-apto';

const TIPO_DEL_FILTRO: Record<Exclude<FiltroAmbiente, 'todos'>, TipoAmbiente> = {
  acuario: 'acuario-interior',
  estanque: 'estanque',
  'no-apto': 'no-apto-acuario-domestico',
};

const AVISO_NO_APTO = 'No apto para acuario';
const AVISO_ESTANQUE = 'Solo estanque';

/** Minúsculas y sin acentos, para comparar nombres. */
export function normalizarBusqueda(valor: string): string {
  return valor.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('es').trim();
}

export function coincideEspecie(
  especie: Pick<PerfilEspecie, 'nombre' | 'nombreCientifico' | 'nombresComunes'>,
  consulta: string,
): boolean {
  const q = normalizarBusqueda(consulta);
  if (!q) {
    return true;
  }
  const texto = normalizarBusqueda(
    [especie.nombre, especie.nombreCientifico, ...(especie.nombresComunes ?? [])].join(' '),
  );
  return texto.includes(q);
}

export function avisoDeEspecie(
  especie: Pick<PerfilEspecie, 'acuarioDomestico' | 'ambiente'>,
): string | null {
  if (especie.ambiente.tipos.includes('no-apto-acuario-domestico')) {
    return AVISO_NO_APTO;
  }
  if (
    !especie.acuarioDomestico &&
    especie.ambiente.tipos.length === 1 &&
    especie.ambiente.tipos[0] === 'estanque'
  ) {
    return AVISO_ESTANQUE;
  }
  return null;
}

export function filtrarEspecies<
  T extends Pick<
    PerfilEspecie,
    'nombre' | 'nombreCientifico' | 'nombresComunes' | 'tiposAgua' | 'ambiente'
  >,
>(
  lista: readonly T[],
  consulta: string,
  filtroAgua: FiltroAgua = 'todas',
  filtroAmbiente: FiltroAmbiente = 'todos',
): T[] {
  return lista.filter((especie) => {
    if (filtroAgua !== 'todas' && !especie.tiposAgua.includes(filtroAgua)) {
      return false;
    }
    if (
      filtroAmbiente !== 'todos' &&
      !especie.ambiente.tipos.includes(TIPO_DEL_FILTRO[filtroAmbiente])
    ) {
      return false;
    }
    return coincideEspecie(especie, consulta);
  });
}
