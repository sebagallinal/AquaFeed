const ETIQUETAS_DIA = ['', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const;

export function etiquetaDia(dia: number): string {
  return ETIQUETAS_DIA[dia] ?? String(dia);
}

export function numero(valor: number | null, decimales: number): string {
  if (valor === null) {
    return '—';
  }
  return valor.toLocaleString('es-AR', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });
}

export function textoPh(valor: number | null): string {
  return numero(valor, 1);
}

export function textoTemp(valor: number | null): string {
  return valor === null ? '—' : `${numero(valor, 1)} °C`;
}

export function textoTds(valor: number | null): string {
  return valor === null ? '—' : `${numero(valor, 0)} ppm`;
}

export function textoPorciones(cantidad: number): string {
  return cantidad === 1 ? '1 porción' : `${cantidad} porciones`;
}

export function haceCuanto(epochSegundos: number | null, ahoraMs = Date.now()): string {
  if (epochSegundos === null) {
    return 'sin lectura';
  }
  const delta = Math.max(0, Math.floor(ahoraMs / 1000 - epochSegundos));
  if (delta < 60) {
    return 'hace unos segundos';
  }
  if (delta < 3600) {
    const minutos = Math.floor(delta / 60);
    return minutos === 1 ? 'hace 1 minuto' : `hace ${minutos} minutos`;
  }
  if (delta < 86_400) {
    const horas = Math.floor(delta / 3600);
    return horas === 1 ? 'hace 1 hora' : `hace ${horas} horas`;
  }
  const dias = Math.floor(delta / 86_400);
  return dias === 1 ? 'hace 1 día' : `hace ${dias} días`;
}

export function fechaHora(iso: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(new Date(iso));
}
