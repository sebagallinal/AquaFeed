import { Component, input } from '@angular/core';

import { avisoDeEspecie } from '../../especies/buscar-especie';
import {
  etiquetaAmbiente,
  etiquetaTipoAgua,
  type AmbienteRecomendado,
  type BandaIdeal,
  type BandaUmbral,
  type PerfilEspecie,
} from '../../models/perfil-especie.model';
import {
  textoIntervalo,
  textoPelletMm,
  textoPelletsPorDia,
  textoPelletsPorToma,
  textoSuspension,
  textoUmbral,
} from '../../models/texto-rango';

@Component({
  selector: 'app-ficha-especie',
  templateUrl: './ficha-especie.html',
})
export class FichaEspecie {
  readonly especie = input.required<PerfilEspecie>();

  protected readonly etiquetaTipoAgua = etiquetaTipoAgua;
  protected readonly avisoDeEspecie = avisoDeEspecie;
  protected readonly etiquetaAmbiente = etiquetaAmbiente;
  protected readonly datoPendiente = 'Dato pendiente';
  protected readonly textoPelletsPorToma = textoPelletsPorToma;
  protected readonly textoPelletsPorDia = textoPelletsPorDia;
  protected readonly textoPelletMm = textoPelletMm;
  protected readonly textoSuspension = textoSuspension;

  protected rango(valor: number | null, unidad: string): string {
    return valor === null ? 'Pendiente de bibliografía' : `${valor} ${unidad}`.trim();
  }

  protected ideal(banda: BandaIdeal, unidad = ''): string | null {
    return textoIntervalo(banda.intervalo, unidad);
  }

  protected umbral(banda: BandaUmbral, unidad: string): string | null {
    return textoUmbral(banda.umbral, unidad);
  }

  protected textoVolumen(ambiente: AmbienteRecomendado): string {
    if (ambiente.volumenMinLitros === null) {
      return this.datoPendiente;
    }
    const litros = ambiente.volumenMinLitros.toLocaleString('es-AR');
    const aprox = ambiente.volumenEstimado ? '≈ ' : '';
    const porPez = ambiente.volumenPorPez ? ' por pez' : '';
    return `${aprox}${litros} L${porPez}`;
  }
}
