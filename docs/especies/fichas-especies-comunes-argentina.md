# AquaFeed — Especies de acuario y estanque más comunes en Argentina: ranking con evidencia y fichas técnicas

Tesis de Horacio Vespoli: alimentador con ESP32, motor paso a paso 28BYJ-48 y sensores de pH, temperatura y TDS, controlado desde una app Angular por MQTT.  
Documento armado el 28-29/09/2026 (hora de Buenos Aires). Mismo formato y criterio que `fichas-especies-tropicales.md`: todos los valores tienen su fuente con URL (entre corchetes, numeradas; la lista completa está al final).

## Convenciones

- **El alimentador dosifica POR PELLET** (decisión de Horacio). El dato principal de cada ficha es la **cantidad de pellets por toma y por día** y el **tamaño de pellet**; los gramos son secundarios. Los pellets se redondean a enteros (mínimo 1).
- **[ESTIMACIÓN]** = calculado o extrapolado (se explica cómo). **PENDIENTE** = no se encontró en una fuente reconocida. **[Sugerencia de diseño]** = umbral de ingeniería para AquaFeed, no un dato biológico publicado.
- **Temperatura recomendada** = un único valor por defecto para la app; salvo aclaración, es el centro del rango ideal redondeado al grado **[ESTIMACIÓN]**.
- **Niveles de alerta:** *ideal* = donde coinciden las fuentes de acuarismo; *advertencia* = fuera del ideal pero dentro de algún rango publicado (o franja de margen marcada como sugerencia de diseño); *crítico* = fuera de todos los rangos publicados. La temperatura crítica es también la de **suspender la alimentación** [sugerencia de diseño]. CTmín/CTmáx y letales de laboratorio son solo referencia fisiológica, no umbrales de alarma.
- **⚠ Alimentación de fondo / sin pellets:** las especies que no comen bien un pellet flotante están marcadas en la tabla resumen y en su ficha, porque afectan el diseño del alimentador.

### Modelo de cálculo de pellets **[ESTIMACIÓN]** (el mismo de `fichas-especies-tropicales.md`)

- Ración: **0,5–1 % del peso vivo por día en adultos** (UF/IFAS) [[52]](https://ask.ifas.ufl.edu/publication/FA096) y **3 % en juveniles** (dentro del 2–5 % de una guía de divulgación) [[53]](https://aquariumscience.org/3-3-1-amount-in-depth/).
- Tomas: **2 por día en adultos** [[54]](http://ij-aquaticbiology.com/index.php/ijab/article/download/570/505/1904) y **3 en juveniles** [[55]](https://vingnanam.sljol.info/articles/4257/files/693c219a931a9.pdf). No hay datos de tomas específicos para estas 12 especies: **PENDIENTE** por especie.
- Tamaño de pellet: regla del 25–50 % del ancho de boca [[56]](https://thefishsite.com/articles/how-big-are-your-fish-pellets) (ancho de boca **PENDIENTE**); micro-pellet de 0,5 mm para peces chicos [[57]](https://www.aquariumcoop.com/products/xtreme-nano-0-5mm-pellet). Se usa **0,5 mm (< 6 cm)**, **0,8 mm (6–10 cm)** y **1,1 mm (> 10 cm)**.
- Masa por pellet (BioMar, pellet de trucha): 0,5 mm ≈ 0,18 mg; 0,8 mm ≈ 0,46 mg; 1,1 mm ≈ 1,1 mg [[58]](https://www.naturewater.ru/upload/iblock/10a/10ac1373d93147007daf983dd9276c25.pdf). Conviene pesar 100 pellets de la marca real y recalcular.
- Peso del pez: relación largo-peso bayesiana de FishBase, W = a·L^b (L = largo total en cm), con los a y b de cada ficha.
- Contraste: Hikari indica **6 micro-pellets por toma y 2 tomas por día** para un betta de 3,8 cm [[59]](https://hikariusa.com/tropical_folder/micro_pellets.html), menos que el cálculo por % PV. Arrancar por el extremo bajo del rango y ajustar según lo que quede sin comer.
- **TDS:** ninguna fuente da rangos de TDS para estas especies (**PENDIENTE**); solo dureza (1 °dH ≈ 17,8 mg/L CaCO₃). El TDS real es igual o mayor que la dureza expresada en mg/L; el factor EC→TDS varía entre 0,55 y 0,75 [[61]](https://iopscience.iop.org/article/10.1088/1755-1315/118/1/012019/pdf). En las fichas, el "piso orientativo de TDS" es la dureza mínima en mg/L CaCO₃ **[ESTIMACIÓN]**.

## 1. Ranking de especies comunes en Argentina y evidencia

### 1.1 Fuentes de evidencia y sus límites

1. **MAGyP: informes anuales de importación y exportación de organismos ornamentales 2023, 2024 y 2025** [[1]](https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Informe%20Importaciones%20y%20Exportaciones%20Ornamentales%202023.pdf) [[2]](https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Importaciones%20y%20exportaciones%20de%20organismos%20ornamentales%202024.pdf) [[3]](https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Informe%20Importaciones%20y%20Exportaciones%20Ornamentales%202025.pdf). Las exportaciones van todas a Chile y salen de criaderos de Córdoba, Buenos Aires, Mendoza, Santa Fe, Corrientes y Misiones [[5]](https://www.magyp.gob.ar/sitio/areas/acuicultura/cultivos/_archivos/000000_Desarrollo%20del%20cultivo%20de%20peces%20ornamentales.pdf): son un buen indicador de **producción local**. Las importaciones reflejan lo que se trae para el comercio local; el MAGyP dice que el mercado argentino "se mueve por las importaciones" [[5]](https://www.magyp.gob.ar/sitio/areas/acuicultura/cultivos/_archivos/000000_Desarrollo%20del%20cultivo%20de%20peces%20ornamentales.pdf). **Límite:** los porcentajes son la participación de cada especie en el gráfico de principales especies de cada informe, no ventas minoristas, y no se pueden sumar importaciones con exportaciones.
2. **MAGyP: "Peces de cultivo y captura que se trasladan en Argentina con finalidad ornamental" (Tomo 1, Dirección Nacional de Acuicultura, 2025)**. Es un inventario de 35 "principales especies de peces ornamentales de cultivo en Argentina", con ficha de acuario (pH, temperatura, litros mínimos) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf). Es evidencia cualitativa (una lista, sin cantidades) y además es una fuente local para las fichas.
3. **Catálogos de 4 tiendas argentinas de acuarismo con venta online**, relevados el 28/09/2026 entre las 23:30 y las 24:00 (hora de Buenos Aires). Se contó si la especie aparece en la categoría de peces vivos: Acuario Atlántida (El Palomar, 86 publicaciones) [[6]](https://www.acuarioatlantida.com.ar/agua-dulce/peces-agua-dulce/), Acuarios Plantados (San Isidro, 235) [[7]](https://acuariosplantados.com.ar/categoria-producto/vivos/peces/), Aqua Bahía (417) [[8]](https://www.aquabahia.com.ar/peces/) y Acuario ICE (tienda en pesos argentinos, 161) [[9]](https://acuarioice.com/peces/). **Límites:** es una foto de un día (el stock cambia), la ubicación de Aqua Bahía y de Acuario ICE no se verificó, y el número de variedades publicadas de una especie **no** mide ventas. **MercadoLibre Argentina: PENDIENTE.** El listado de peces vivos devolvió una verificación de cuenta (error 403) y no se pudo relevar [[10]](https://listado.mercadolibre.com.ar/animales-mascotas/peces/peces-vivos).
4. **Fuentes locales cualitativas:** Universidad Nacional de Misiones (columna "Peces del río Paraná") [[11]](https://www.primeraedicion.com.ar/nota/100747630/peces-del-rio-parana-cichlasoma-dimerus/); Gómez (MACN-CONICET) sobre peces nativos de valor ornamental [[12]](https://seacuicultura.es/images/aquatic-pdf/41_1.pdf); Círculo Rosarino de Acuaristas (CRoA) [[13]](https://www.croa.com.ar/el-acuario-de-ciclidos-africanos/) [[14]](https://www.croa.com.ar/guia-acuarista/). **INIDEP: no se encontró material sobre peces de acuario** (su foco es la pesca marina): PENDIENTE / no aplica.

### 1.2 Datos del MAGyP (porcentaje en el gráfico de principales especies de agua dulce)

| Especie | Export. 2023 | Export. 2024 | Export. 2025 | Import. 2023 | Import. 2024 | Import. 2025 |
|---|---|---|---|---|---|---|
| *Xiphophorus maculatus* (platy) | 17,9 | 22,2 | 22,3 | — | — | — |
| *Xiphophorus hellerii* (pez espada / xipho) | 15,1 | 21,2 | 18,6 | — | — | — |
| *Carassius auratus* (goldfish) | 16,8 | 14,2 | 14,7 | — | — | — |
| *Poecilia reticulata* (guppy) | 13,2 | 11,3 | 11,8 | 11,7 | 9,8 | 12,8 |
| *Poecilia sphenops* (molly) | 10,0 | 12,3 | 12,0 | — | — | — |
| *Poecilia latipinna* (molly vela) | 6,3 | 7,5 | 7,3 | — | — | — |
| *Danio rerio* (pez cebra) | 6,0 | 7,0 (4,1 + 2,9 como *Branchydanio*) | 6,4 | — | — | — |
| *Gymnocorymbus ternetzi* (tetra negro / monjita) | 4,4 | 2,5 | 2,4 | — | — | — |
| *Betta splendens* (betta) | 6,3 | — | 2,6 | — | — | — |
| *Puntigrus tetrazona* (barbo tigre) | 3,9 | — | — | — | — | — |
| *Corydoras paleatus* (corydora pimienta, **nativa**) | — | — | 1,9 | — | — | — |
| *Cyprinus carpio* (carpa / koi) | — | 1,7 | — | — | — | — |
| *Paracheirodon axelrodi* (tetra cardenal) | — | — | — | 61,7 | 51,4 | 40,5 |
| *Paracheirodon innesi* (neón) | — | — | — | 3,4 | 9,0 | 24,4 |
| *Paracheirodon simulans* (neón verde) | — | — | — | 7,5 | 7,9 | 2,0 |
| *Hemigrammus bleheri* / *H. rhodostomus* (borrachitos) | — | — | — | 3,5 / 3,6 | 3,3 / 3,3 | 4,3 / — |
| *Otocinclus vestitus* (otocinclus) | — | — | — | 2,8 | 6,3 | — |
| *Hyphessobrycon* sp. (tetras varios) | — | — | — | — | 3,9 | 4,9 |
| *Rasbora (Trigonostigma) heteromorpha* (rasbora arlequín) | — | — | — | 3,2 | — | 3,6 |
| *Mikrogeophagus ramirezi* (ramirezi) | — | — | — | 2,7 | — | 2,3 |
| *Nematobrycon lacortei* (tetra emperador arcoíris) | — | — | — | — | 2,6 | — |
| *Pangio kuhlii* (locha kuhli) | — | — | — | — | — | 2,9 |
| *Tanichthys albonubes* (nubes blancas) | — | — | — | — | — | 2,4 |

Fuentes: [[1]](https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Informe%20Importaciones%20y%20Exportaciones%20Ornamentales%202023.pdf) (2023: 413 903 organismos importados, de ellos 366 406 peces de agua dulce; 100 864 exportados), [[2]](https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Importaciones%20y%20exportaciones%20de%20organismos%20ornamentales%202024.pdf) (2024: 313 550 importados, de ellos 266 656 peces de agua dulce; 78 652 exportados) y [[3]](https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Informe%20Importaciones%20y%20Exportaciones%20Ornamentales%202025.pdf) (2025: 86 929 exportados). "—" = no figura entre las principales especies de ese año (no quiere decir cero).

### 1.3 Presencia en catálogos de tiendas argentinas (28/09/2026)

Número de tiendas (de 4) en las que aparece la especie, y cantidad de publicaciones (variedades o tallas) en cada una. El conteo se hizo buscando el nombre común o científico en los títulos **[ESTIMACIÓN: puede haber errores al clasificar nombres comerciales]**.

| Especie o grupo | Tiendas (de 4) | Atlántida | Acuarios Plantados | Aqua Bahía | Acuario ICE |
|---|---|---|---|---|---|
| Corydoras spp. (cualquiera) | **4** | 7 | 14 | 29 | 6 |
| Symphysodon spp. (disco) | **4** | 7 | 31 | 8 | 2 |
| Betta splendens (betta) | **4** | 2 | 26 | 11 | 8 |
| Carassius auratus (goldfish/cometa) | **4** | 1 | 11 | 16 | 10 |
| Barbos (cualquiera: Puntius, Pethia, etc.) | **4** | 4 | 3 | 14 | 7 |
| Pterophyllum scalare (escalar) | **4** | 3 | 7 | 11 | 1 |
| Xiphophorus maculatus (platy) | **4** | 2 | 2 | 12 | 3 |
| Poecilia reticulata (guppy/lebiste) | **4** | 1 | 6 | 9 | 3 |
| Ancistrus spp. | **4** | 2 | 5 | 7 | 2 |
| Poecilia sphenops/latipinna (molly) | **4** | 2 | 5 | 7 | 1 |
| Gourami/tricho (Trichogaster/Trichopodus/Colisa) | **4** | 1 | 1 | 9 | 3 |
| Otocinclus spp. | **4** | 1 | 2 | 2 | 2 |
| Paracheirodon axelrodi (tetra cardenal) | **4** | 1 | 1 | 1 | 2 |
| Paracheirodon innesi (neón) | **4** | 1 | 2 | 1 | 1 |
| Tanichthys albonubes (nubes blancas) | **4** | 2 | 1 | 1 | 1 |
| Corydoras paleatus (corydora pimienta, nativa) | **4** | 1 | 1 | 1 | 1 |
| Pangio kuhlii | **4** | 1 | 1 | 1 | 1 |
| Cíclidos africanos (cualquiera) | **3** | 6 | 0 | 51 | 14 |
| Xiphophorus hellerii (xipho/espada) | **3** | 0 | 2 | 6 | 2 |
| Cyprinus carpio (koi/carpa) | **3** | 0 | 5 | 4 | 1 |
| Mikrogeophagus ramirezi (ramirezi) | **3** | 0 | 3 | 6 | 1 |
| Danio rerio (pez cebra/cebrita) | **3** | 2 | 0 | 5 | 1 |
| Puntigrus tetrazona (barbo tigre/sumatrano) | **3** | 2 | 0 | 5 | 1 |
| Astronotus ocellatus (oscar) | **3** | 2 | 0 | 5 | 1 |
| Hyphessobrycon eques (serpae) | **3** | 1 | 3 | 2 | 0 |
| Hemigrammus rhodostomus/bleheri (borrachito) | **3** | 2 | 2 | 0 | 2 |
| Hypostomus/pleco común (vieja del agua) | **3** | 0 | 2 | 2 | 2 |
| Corydoras aeneus | **3** | 0 | 3 | 2 | 1 |
| Trigonostigma heteromorpha (rasbora arlequín) | **3** | 0 | 3 | 1 | 1 |
| Labidochromis caeruleus (limón) | **3** | 1 | 0 | 2 | 1 |
| Paracheirodon simulans (neón verde) | **3** | 0 | 1 | 1 | 1 |
| Apistogramma borellii (nativa) | **3** | 0 | 1 | 1 | 1 |
| Gymnocorymbus ternetzi (monjita/tetra negro) | **2** | 0 | 0 | 9 | 1 |
| Hypostomus commersoni (vieja del agua, nativa) | **2** | 0 | 2 | 0 | 1 |
| Andinoacara pulcher (acará azul) | **2** | 0 | 0 | 2 | 1 |
| Aphyocharax anisitsi (aletas sangrantes/colita colorada, nativa) | **2** | 0 | 1 | 1 | 0 |
| Otocinclus arnoldi / oto de agua fría (nativa) | **2** | 0 | 1 | 0 | 1 |
| Pimelodella/bagrecitos (nativa) | **1** | 0 | 0 | 2 | 0 |
| Pyrrhulina australis (nativa) | **1** | 0 | 1 | 0 | 0 |
| Gymnogeophagus balzanii (nativa) | **1** | 0 | 0 | 1 | 0 |
| Crenicichla (batrachops, nativa) | **1** | 0 | 0 | 0 | 1 |
| Cichlasoma dimerus (chanchita, nativa) | **0** | 0 | 0 | 0 | 0 |
| Australoheros facetus (chanchita, nativa) | **0** | 0 | 0 | 0 | 0 |

Fuentes: [[6]](https://www.acuarioatlantida.com.ar/agua-dulce/peces-agua-dulce/) [[7]](https://acuariosplantados.com.ar/categoria-producto/vivos/peces/) [[8]](https://www.aquabahia.com.ar/peces/) [[9]](https://acuarioice.com/peces/). Las listas completas de títulos están en `/workspace/aquafeed/src/stores/` y los conteos en `/workspace/aquafeed/store_counts.json`.

### 1.4 Ranking por niveles de evidencia

No se inventan posiciones. El orden **dentro** del nivel A sale del promedio de la participación en las exportaciones 2023-2025 **[ESTIMACIÓN: promedio simple de tres porcentajes]**. En los demás niveles, las especies se agrupan sin orden interno, salvo lo que indican los datos.

**Nivel A: producción local comprobada.** Entre las principales exportaciones los 3 años (2023-2025) y presente en tiendas.

| # | Especie | Export. prom. 2023-25 [ESTIM.] | Tiendas | Otra evidencia | ¿Ficha? |
|---|---|---|---|---|---|
| 1 | Platy (*X. maculatus*) | 20,8 % | 4/4 | Guía MAGyP Tomo 1 | Ya existe |
| 2 | **Pez espada / xipho (*X. hellerii*)** | 18,3 % | 3/4 | Guía MAGyP Tomo 1 | **Nueva (3.1)** |
| 3 | Goldfish (*C. auratus*) | 15,2 % | 4/4 | Guía MAGyP; según el MAGyP, "la más comercializada" en acuariofilia | Ya existe |
| 4 | Guppy (*P. reticulata*) | 12,1 % | 4/4 | Además, entre las 3 más importadas los 3 años | Ya existe |
| 5 | Molly (*P. sphenops*) | 11,4 % | 4/4 | Guía MAGyP | Ya existe |
| 6 | Molly vela (*P. latipinna*) | 7,0 % | 4/4 ("molly" genérico) | Guía MAGyP | Ya existe |
| 7 | **Pez cebra / cebrita (*Danio rerio*)** | 6,5 % | 3/4 | Guía MAGyP | **Nueva (3.2)** |
| 8 | **Tetra negro / monjita (*G. ternetzi*)**, nativo del norte argentino | 3,1 % | 2/4 | Guía MAGyP; Gómez (MACN) lo cita como especie de valor ornamental | **Nueva (3.4)** |

Fuentes: [[1]](https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Informe%20Importaciones%20y%20Exportaciones%20Ornamentales%202023.pdf) [[2]](https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Importaciones%20y%20exportaciones%20de%20organismos%20ornamentales%202024.pdf) [[3]](https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Informe%20Importaciones%20y%20Exportaciones%20Ornamentales%202025.pdf) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf) [[5]](https://www.magyp.gob.ar/sitio/areas/acuicultura/cultivos/_archivos/000000_Desarrollo%20del%20cultivo%20de%20peces%20ornamentales.pdf) [[12]](https://seacuicultura.es/images/aquatic-pdf/41_1.pdf) y tiendas [[6]](https://www.acuarioatlantida.com.ar/agua-dulce/peces-agua-dulce/) [[7]](https://acuariosplantados.com.ar/categoria-producto/vivos/peces/) [[8]](https://www.aquabahia.com.ar/peces/) [[9]](https://acuarioice.com/peces/).

**Nivel B: evidencia cuantitativa del MAGyP en 1 o 2 años (exportación) o importación sostenida, más presencia en tiendas.** Sin orden interno, salvo el cardenal, que es por lejos la especie más importada los 3 años.

| Especie | Evidencia MAGyP | Tiendas | Otra evidencia | ¿Ficha? |
|---|---|---|---|---|
| **Tetra cardenal (*P. axelrodi*)** | 1.ª importación en 2023, 2024 y 2025 (61,7 / 51,4 / 40,5 %) | 4/4 | — | **Nueva (3.5)** |
| Neón (*P. innesi*) | Importación los 3 años (3,4 / 9,0 / 24,4 %) | 4/4 | — | Ya existe |
| **Betta (*B. splendens*)** | Exportación 2023 (6,3 %) y 2025 (2,6 %) | 4/4 (la especie con más publicaciones en Acuarios Plantados: 26) | Guía MAGyP | **Nueva (3.3)** |
| **Barbo tigre / sumatrano (*P. tetrazona*)** | Exportación 2023 (3,9 %) | 3/4 | Guía MAGyP | **Nueva (3.7)** |
| **Corydora pimienta (*C. paleatus*), nativa** | Exportación 2025 (1,9 %) | 4/4 | Gómez (MACN): nativa de valor ornamental, llevada a Europa en 1876 | **Nueva (3.8)** |
| **Otocinclus (*O. vestitus* y otros)** | Importación 2023 (2,8 %) y 2024 (6,3 %) | 4/4 | — | **Nueva (3.9)** |
| Neón verde (*P. simulans*) | Importación los 3 años (7,5 / 7,9 / 2,0 %) | 3/4 | — | No |
| Borrachitos (*H. bleheri*, *H. rhodostomus*) | Importación los 3 años | 3/4 | — | No |
| Rasbora arlequín (*T. heteromorpha*) | Importación 2023 y 2025 | 3/4 | — | No |
| Ramirezi (*M. ramirezi*) | Importación 2023 y 2025 | 3/4 | — | No (PENDIENTE) |
| Carpa koi (*C. carpio*) | Exportación 2024 (1,7 %) | 3/4 | Guía MAGyP | Ya existe |
| Nubes blancas (*T. albonubes*) | Importación 2025 (2,4 %) | 4/4 | Guía MAGyP | Ya existe |
| Locha kuhli (*Pangio kuhlii*) | Importación 2025 (2,9 %) | 4/4 | — | No |

**Nivel C: sin datos en los gráficos de principales especies del MAGyP, pero presentes en las 4 (o 3) tiendas o en la guía de especies cultivadas del MAGyP.**

| Especie o grupo | Tiendas | Guía MAGyP Tomo 1 | Otra evidencia | ¿Ficha? |
|---|---|---|---|---|
| **Escalar (*Pterophyllum scalare*)** | 4/4 | Sí | El informe MAGyP 2023 trae una foto de escalares "expuestos en un local comercial de acuarismo"; el MAGyP lo nombra entre las especies de la acuicultura ornamental | **Nueva (3.6)** |
| **Disco (*Symphysodon* spp.)** | 4/4 (Acuarios Plantados: 31 publicaciones, la mayor cantidad de variedades del relevamiento) | Sí (*S. discus*) | — | **Nueva (3.11)** |
| **Ancistrus (*Ancistrus* spp.)** | 4/4 | No | El MAGyP lo nombra (*Ancistrus* spp.) entre las especies de la acuicultura ornamental | **Nueva (3.10)** |
| **Gourami / tricho (*Trichopodus trichopterus* y afines)** | 4/4 como grupo (*T. trichopterus*: 2/4; *T. leerii*: 4/4) | Sí (*T. trichopterus* y *T. leerii*) | — | **Nueva (3.12)** (*T. trichopterus*) |
| Cíclidos africanos (Malawi/Tanganica; p. ej. *Labidochromis caeruleus*) | 3/4 (Aqua Bahía: 51 publicaciones) | Sí (*Chindongo socolofi*) | Artículo del CRoA (Rosario) sobre acuario de mbunas: mínimo 170 L, agua dura y alcalina | No (PENDIENTE) |
| Oscar (*Astronotus ocellatus*) | 3/4 | No | — | No |
| *Corydoras aeneus* / *C. panda* | 3/4 y 4/4 | Sí | — | No (el género queda cubierto por *C. paleatus*) |

Fuentes: [[6]](https://www.acuarioatlantida.com.ar/agua-dulce/peces-agua-dulce/) [[7]](https://acuariosplantados.com.ar/categoria-producto/vivos/peces/) [[8]](https://www.aquabahia.com.ar/peces/) [[9]](https://acuarioice.com/peces/) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf) [[1]](https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Informe%20Importaciones%20y%20Exportaciones%20Ornamentales%202023.pdf) [[5]](https://www.magyp.gob.ar/sitio/areas/acuicultura/cultivos/_archivos/000000_Desarrollo%20del%20cultivo%20de%20peces%20ornamentales.pdf) [[13]](https://www.croa.com.ar/el-acuario-de-ciclidos-africanos/).

### 1.5 Peces nativos argentinos usados en acuarismo

| Especie nativa | Presencia real en el comercio | Evidencia | Conclusión |
|---|---|---|---|
| *Corydoras paleatus* (corydora pimienta) | 4/4 tiendas; exportación 2025 (1,9 %) | FishBase: Argentina, Brasil y Uruguay [[22]](https://www.fishbase.se/summary/Corydoras-paleatus.html); Gómez (MACN): especie argentina de valor ornamental [[12]](https://seacuicultura.es/images/aquatic-pdf/41_1.pdf) | **Presencia real y comprobada** → ficha 3.8 |
| *Gymnocorymbus ternetzi* (tetra negro / monjita) | 2/4 tiendas; exportación los 3 años | FishBase: cuencas del Paraguay y del Guaporé hasta Argentina [[18]](https://www.fishbase.se/summary/Gymnocorymbus-ternetzi.html); Gómez: los ejemplares silvestres son raros en los comercios argentinos (lo que se vende es de criadero, incluidas variedades importadas) [[12]](https://seacuicultura.es/images/aquatic-pdf/41_1.pdf) | **Presencia real** (formas de criadero) → ficha 3.4 |
| *Apistogramma borellii* | 3/4 tiendas | FishBase: cuenca del Paraguay y bajo Paraná en Argentina [[30]](https://www.fishbase.se/summary/Apistogramma-borellii.html) | Presencia real (nicho); sin ficha |
| *Hypostomus commersoni* (vieja del agua) | 2/4 tiendas (Acuario ICE con nombre científico; Acuarios Plantados como "vieja del agua") | FishBase: bajo Paraná, Paraguay y Río de la Plata [[32]](https://www.fishbase.se/summary/Hypostomus-commersoni.html) | Presencia real (nicho); sin ficha |
| *Otocinclus arnoldi* ("otocinclus de agua fría") | 2/4 tiendas | FishBase: bajo Paraná, Uruguay y Río de la Plata [[34]](https://www.fishbase.se/summary/Otocinclus-arnoldi.html) | Presencia real (nicho); la ficha 3.9 cubre el género |
| *Aphyocharax anisitsi* (tetra aletas sangrantes) | 2/4 tiendas ("Tetra aletas sangrantes"; "Colita colorada" en Aqua Bahía, identificada por el nombre común **[ESTIMACIÓN]**) | FishBase: cuenca del Paraná [[31]](https://www.fishbase.se/summary/Aphyocharax-anisitsi.html) | Presencia real (nicho); sin ficha |
| *Pyrrhulina australis* | 1/4 tiendas | FishBase: cuencas del Plata y del Paraguay [[33]](https://www.fishbase.se/summary/Pyrrhulina-australis.html) | Presencia marginal |
| *Ancistrus cirrhosus* | El ancistrus común del comercio es de origen incierto (Seriously Fish) | FishBase: cuenca del Paraná [[25]](https://www.fishbase.se/summary/Ancistrus-cirrhosus.html); Seriously Fish: el 'bristlenose' del hobby se cría en masa y no se conoce su origen preciso [[44]](https://www.seriouslyfish.com/species/ancistrus-cf-cirrhosus/) | Ficha 3.10 a nivel de género |
| Bagrecitos (*Pimelodella*) | 1/4 tiendas (Aqua Bahía: "Pimelodella", sin especie) | Gómez (MACN) estudió *P. laticeps* de Chascomús y la considera **sin valor ornamental** [[12]](https://seacuicultura.es/images/aquatic-pdf/41_1.pdf) | **Presencia marginal**; sin ficha |
| Chanchita (*Cichlasoma dimerus*) | **0/4 tiendas** | UNaM: "de mucha importancia" como especie ornamental, se adapta a los acuarios y se reproduce fácilmente [[11]](https://www.primeraedicion.com.ar/nota/100747630/peces-del-rio-parana-cichlasoma-dimerus/); Gómez la incluye entre las nativas de valor ornamental [[12]](https://seacuicultura.es/images/aquatic-pdf/41_1.pdf); **FishBase, en cambio, dice que no es muy colorida ni interesante para el comercio** [[28]](https://www.fishbase.se/summary/Cichlasoma-dimerus.html) | **Sin presencia comercial comprobada** (uso en biotopos de aficionados y en laboratorio). No entra en las 12 fichas: PENDIENTE |
| Chanchita pampeana (*Australoheros facetus*) | 0/4 tiendas | Gómez: valor ornamental; "el cíclido más austral del mundo", tolera aguas templado-frías [[12]](https://seacuicultura.es/images/aquatic-pdf/41_1.pdf); FishBase: bajo Paraná en Argentina [[29]](https://www.fishbase.se/summary/Australoheros-facetus.html) | Sin presencia comercial comprobada |

**Estanque:** en el relevamiento, las únicas especies de estanque con presencia real son goldfish (cometas, shubunkin) y carpas koi (4/4 y 3/4 tiendas), ya cubiertas en `fichas-especies-agua-fria.md`. Ninguna de las 12 especies nuevas es apta para estanque exterior en Argentina.

## 2. Tabla resumen de las 12 especies nuevas

Pellets/día por **pez adulto de talla de referencia**, con 0,5–1 % PV/día y 2 tomas **[ESTIMACIÓN]**. La temperatura de suspensión es **[sugerencia de diseño]**: ninguna fuente da una temperatura de corte, salvo el dato de laboratorio de betta y de *Corydoras aeneus*.

| Especie | Origen | Tipo de agua | **Temp. recomendada (°C)** | Temp. ideal (°C) | pH ideal | Dureza / TDS | **Pellets/día por pez [ESTIM.]** | **Pellets por toma** | Tamaño de pellet | Talla de referencia | ¿Come pellet flotante? | Suspender alimentación | Ambiente | Litros mínimos |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Pez espada / xipho (*X. hellerii*) | Introducido (México a Honduras) | Tropical (agua cálida) | **24** [ESTIM.] | 22–26 | 7,0–8,0 | 9–19 °dH (≈ 160–338 mg/L); TDS PENDIENTE | **130–250** | **63–130** | 0,8 mm | hembra adulta 10,0 cm (≈ 11,5 g) | Sí | < 16 °C o ≥ 31 °C | Acuario | ≈ 108–120 L |
| Pez cebra / cebrita (*Danio rerio*) | Introducido (sur de Asia) | Tropical (agua cálida) | **22** [ESTIM.] | 20–24 | 6,0–8,0 | 5–19 °dH (≈ 89–338 mg/L); TDS PENDIENTE | **18–36** | **9–18** | 0,5 mm | adulto 4,0 cm (≈ 0,661 g) | Sí | < 16 °C o ≥ 28 °C | Acuario | ≈ 81–100 L |
| Betta (*Betta splendens*) | Introducido (cuenca del Mekong) | Tropical (agua cálida) | **26** [ESTIM.] | 24–28 | 6,0–7,5 | 5–15 °dH (≈ 89–267 mg/L); TDS PENDIENTE | **32–64** | **16–32** | 0,5 mm | adulto (cuerpo, sin aletas largas) 5,0 cm (≈ 1,16 g) | Sí (pellet flotante chico) | < 18 °C o ≥ 31 °C | Acuario | ≈ 41 L (1 macho) |
| Tetra negro / monjita (*G. ternetzi*) | **Nativo** (cuencas del Paraguay y el Guaporé hasta Argentina); lo que se vende es de criadero | Tropical (agua cálida) | **24** [ESTIM.] | 23–26 | 6,0–7,0 | 5–19 °dH (≈ 89–338 mg/L); TDS PENDIENTE | **84–170** | **42–84** | 0,5 mm | adulto 5,5 cm (≈ 3,08 g) | Sí | < 18 °C o ≥ 29 °C | Acuario | ≈ 68–120 L |
| Tetra cardenal (*P. axelrodi*) | Introducido (alto Orinoco y río Negro) | Tropical (agua cálida) | **25** [ESTIM.] | 23–27 | 4,0–6,0 | 5–12 °dH (≈ 89–214 mg/L); TDS PENDIENTE | **15–29** | **7–15** | 0,5 mm | adulto 3,5 cm (≈ 0,532 g) | Sí (micro-pellet) | < 21 °C o ≥ 30 °C | Acuario | ≈ 54 L |
| Escalar (*Pterophyllum scalare*) | Introducido (cuenca amazónica) | Tropical (agua cálida) | **27** [ESTIM.] | 24–30 | 6,0–7,4 | 5–13 °dH (≈ 89–231 mg/L); TDS PENDIENTE | **340–680** | **170–340** | 0,8 mm | adulto 10,0 cm (≈ 30,9 g) | Sí | < 22 °C o ≥ 32 °C | Acuario (alto) | ≈ 200–300 L |
| Barbo tigre / sumatrano (*P. tetrazona*) | Introducido (Sumatra y Borneo) | Tropical (agua cálida) | **23** [ESTIM.] | 20–26 | 6,0–8,0 | 5–19 °dH (≈ 89–338 mg/L); TDS PENDIENTE | **34–67** | **17–34** | 0,8 mm | adulto 6,0 cm (≈ 3,07 g) | Sí | < 18 °C o ≥ 30 °C | Acuario | ≈ 72–160 L |
| Corydora pimienta (*Corydoras paleatus*) | **Nativo** (Argentina, Brasil, Uruguay) | Agua fría (subtropical; ver ficha) | **22** [ESTIM.] | 20–24 | 6,0–7,0 | ≤ 12 dGH (Seriously Fish; FishBase 5–19); TDS PENDIENTE | **44–88** | **22–44** | 0,8 mm | adulto 6,0 cm (≈ 4,01 g) | **⚠ No: come del fondo; solo pellet que se HUNDA** | < 15 °C o ≥ 30 °C | Acuario | ≈ 70 L |
| Otocinclus (*Otocinclus* spp.) | Introducido o nativo según la especie (Amazonas y bajo Paraná) | Tropical (agua cálida) | **23** [ESTIM.] | 21–26 | 6,0–7,5 | 1–12 dGH (≈ 18–214 mg/L); TDS PENDIENTE | **0 (no apto)** | — | — | adulto 4,0 cm (≈ 0,680 g) | **⚠ No: raspa algas y biofilm; dieta vegetal (wafers, verduras)** | < 18 °C o ≥ 29 °C | Acuario plantado y maduro | ≈ 41 L |
| Ancistrus (*Ancistrus* spp.) | El ancistrus comercial es de origen incierto; *A. cirrhosus* es de la cuenca del Paraná | Tropical (agua cálida) | **24** [ESTIM.] | 21–26 | 5,5–7,5 | 1–15 dGH (≈ 18–267 mg/L); TDS PENDIENTE | **150–310** | **77–150** | 0,8 mm | adulto 10,0 cm (≈ 14,1 g) | **⚠ Parcial: pellet o pastilla que se HUNDA + vegetales a mano** | < 18 °C o ≥ 30 °C | Acuario | ≈ 54 L (1 ejemplar o pareja) |
| Disco (*Symphysodon* spp.) | Introducido (Amazonas) | Tropical (agua cálida) | **28** [ESTIM.] | 27–30 | 5,0–6,5 | 0–12 °dH (≈ 0–214 mg/L); TDS PENDIENTE | **450–890** | **220–450** | 1,1 mm | adulto 15,0 cm (≈ 98,5 g) | Sí | < 24 °C o ≥ 33 °C | Acuario | ≈ 255–300 L |
| Gourami azul / tricho (*Trichopodus trichopterus*) | Introducido (cuenca del Mekong) | Tropical (agua cálida) | **26** [ESTIM.] | 24–28 | 6,0–8,0 | 5–19 °dH (≈ 89–338 mg/L); TDS PENDIENTE | **130–260** | **66–130** | 1,1 mm | adulto 11,0 cm (≈ 29,2 g) | Sí | < 20 °C o ≥ 32 °C | Acuario | ≈ 81–200 L |

## 3. Fichas por especie

### 3.1 Pez espada / xipho / cola de espada — *Xiphophorus hellerii*

**Origen:** introducido en Argentina. Nativo de América del Norte y Central, desde el río Nantla (Veracruz, México) hasta el noroeste de Honduras. Hay poblaciones asilvestradas en África, y varios países informan impacto ecológico negativo tras su introducción [[15]](https://www.fishbase.se/summary/Xiphophorus-hellerii.html). En Argentina se cría, y fue la **2.ª especie de agua dulce más exportada** en 2024 y 2025 (21,2 % y 18,6 %) [[2]](https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Importaciones%20y%20exportaciones%20de%20organismos%20ornamentales%202024.pdf) [[3]](https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Informe%20Importaciones%20y%20Exportaciones%20Ornamentales%202025.pdf); figura en la guía de especies cultivadas del MAGyP [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf). Fecha de introducción: **PENDIENTE**.

**Tipo de agua:** Tropical (agua cálida). **Temperatura recomendada: 24 °C** [ESTIMACIÓN: centro del rango ideal 22–26 °C, que es la superposición de FishBase (22–28 °C) y la guía del MAGyP (21–26 °C); Seriously Fish admite 16–28 °C] [[15]](https://www.fishbase.se/summary/Xiphophorus-hellerii.html) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf) [[35]](https://www.seriouslyfish.com/species/xiphophorus-hellerii/).

**Temperatura (°C)**

| Parámetro | Valor | Fuente |
|---|---|---|
| Rango de mantenimiento | 22–28 (FishBase); 21–26 (MAGyP); 16–28 (Seriously Fish) | [[15]](https://www.fishbase.se/summary/Xiphophorus-hellerii.html) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf) [[35]](https://www.seriouslyfish.com/species/xiphophorus-hellerii/) |
| CTmín (laboratorio) | 11,37 °C (aclimatados a 24 °C; machos 11,61, hembras 11,12); 9,38 / 11,53 / 13,23 °C con aclimatación a 20 / 24 / 28 °C | [[48]](https://www.trjfas.org/pdf.php?id=14952) [[49]](http://www.egejfas.org/tr/pub/article/809511) |
| CTmáx (laboratorio) | 39,12 °C (24 °C); 36,94 / 38,89 / 40,07 °C con aclimatación a 20 / 24 / 28 °C | [[48]](https://www.trjfas.org/pdf.php?id=14952) [[49]](http://www.egejfas.org/tr/pub/article/809511) |

**pH:** 7,0–8,0 (FishBase y Seriously Fish) [[15]](https://www.fishbase.se/summary/Xiphophorus-hellerii.html) [[35]](https://www.seriouslyfish.com/species/xiphophorus-hellerii/); 6,8–8,0 (MAGyP) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf). Tolera agua salobre [[15]](https://www.fishbase.se/summary/Xiphophorus-hellerii.html) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf).

**Dureza y TDS:** 9–19 °dH (≈ 160–338 mg/L CaCO₃) según FishBase [[15]](https://www.fishbase.se/summary/Xiphophorus-hellerii.html); 10–25 dGH (≈ 178–445 mg/L) según Seriously Fish [[35]](https://www.seriouslyfish.com/species/xiphophorus-hellerii/). **TDS: PENDIENTE** (piso orientativo ≈ 160 mg/L [ESTIMACIÓN]).

**Alimentación**

- Dieta: omnívoro generalista; en el acuario acepta casi todo. Seriously Fish recomienda una dieta balanceada de alimento seco más vivo o congelado (*Daphnia*, *Artemia*, larvas de quironómido) [[35]](https://www.seriouslyfish.com/species/xiphophorus-hellerii/). Según el MAGyP, acepta hojuelas y alimento vivo, y hay que agregar un suplemento vegetal si no hay plantas [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf).
- **Come pellets: sí** (alimento seco).
- Tomas: **PENDIENTE** para la especie. **[ESTIMACIÓN]** 2 en adultos y 3 en juveniles; la revisión citada menciona mejor crecimiento con 3 tomas en juveniles de cola de espada [[55]](https://vingnanam.sljol.info/articles/4257/files/693c219a931a9.pdf).

Pellets por talla **[ESTIMACIÓN]** (peso con FishBase, a = 0,01000 y b = 3,06 [[15]](https://www.fishbase.se/summary/Xiphophorus-hellerii.html); LT sin contar la espada del macho):

| Talla (LT) | Peso est. (g) | Tamaño de pellet (mm) | **Pellets por día** | **Pellets por toma** | Tomas/día | % PV/día usado | g/día (secundario) |
|---|---|---|---|---|---|---|---|
| Juvenil 2,0 cm | 0,0834 | 0,5 | **14** | **5** | 3 | 3,0 % | 0,0025 |
| Macho adulto 8,0 cm | 5,80 | 0,8 | **64–130** | **32–64** | 2 | 0,5–1,0 % | 0,0290–0,0580 |
| Hembra adulta 10,0 cm | 11,5 | 0,8 | **130–250** | **63–130** | 2 | 0,5–1,0 % | 0,0574–0,115 |

**Temperatura para suspender la alimentación:** **PENDIENTE** (ninguna fuente la da). **[Sugerencia de diseño]** Suspender por debajo de 16 °C (el mínimo de Seriously Fish, ≈ 4,6 °C por encima del CTmín a 24 °C) y a 31 °C o más (3 °C por encima del máximo publicado).

**Alertas sugeridas para AquaFeed:**

| Variable | Ideal | Advertencia | Crítico |
|---|---|---|---|
| Temperatura | 22–26 °C | 16–22 °C o 26–31 °C | < 16 °C o ≥ 31 °C → suspender la alimentación [sugerencia de diseño] |
| pH | 7,0–8,0 | 6,8–7,0 (MAGyP) o 8,0–8,3 [sugerencia de diseño] | < 6,8 o > 8,3 [sugerencia de diseño] |
| Dureza / TDS | 10–19 dGH | 9–10 o 19–25 dGH | < 9 dGH; TDS PENDIENTE; avisar ante cambios bruscos [sugerencia de diseño] |

**Ambiente recomendado**

| Aspecto | Recomendación | Fuente |
|---|---|---|
| Tipo | **Acuario** de interior con calefactor | [[35]](https://www.seriouslyfish.com/species/xiphophorus-hellerii/) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf) |
| Volumen mínimo | **≈ 108 L** (base 120 × 30 cm) según Seriously Fish; **120 L** (80 cm) según el MAGyP; FishBase: 80 cm | [[35]](https://www.seriouslyfish.com/species/xiphophorus-hellerii/) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf) [[15]](https://www.fishbase.se/summary/Xiphophorus-hellerii.html) |
| Compañía | Pacífico con otras especies, pero los machos son territoriales y agresivos entre sí (FishBase, MAGyP). El MAGyP recomienda grupos de al menos 10, con **1 macho cada 3 o 4 hembras**: los ejemplares solos se estresan. Los padres se comen las crías | [[15]](https://www.fishbase.se/summary/Xiphophorus-hellerii.html) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf) |
| Espacio | Nadador activo: conviene un acuario largo. RSPCA: 1,5–2 L por cm de pez. **[ESTIMACIÓN]** 1 macho de 8 cm y 3 hembras de 10 cm (LT) suman 38 cm, o sea 57–76 L de carga; el mínimo sigue siendo el de las fuentes | [[60]](https://www.rspca.org.uk/adviceandwelfare/pets/fish/environment) [[35]](https://www.seriouslyfish.com/species/xiphophorus-hellerii/) |

### 3.2 Pez cebra / cebrita — *Danio rerio*

**Origen:** introducido en Argentina. Nativo de Pakistán, India, Bangladesh, Nepal y Myanmar, con registros en Bután [[16]](https://www.fishbase.se/summary/Danio-rerio.html). Argentina lo cría y lo exporta: 6,0 % (2023), 7,0 % (2024, sumando los registros como *Danio rerio* y *Branchydanio rerio*) y 6,4 % (2025) de las exportaciones de agua dulce [[1]](https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Informe%20Importaciones%20y%20Exportaciones%20Ornamentales%202023.pdf) [[2]](https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Importaciones%20y%20exportaciones%20de%20organismos%20ornamentales%202024.pdf) [[3]](https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Informe%20Importaciones%20y%20Exportaciones%20Ornamentales%202025.pdf). En las tiendas se ven sobre todo variedades fluorescentes ("cebritas fluor") [[6]](https://www.acuarioatlantida.com.ar/agua-dulce/peces-agua-dulce/) [[8]](https://www.aquabahia.com.ar/peces/) [[9]](https://acuarioice.com/peces/). Fecha de introducción: **PENDIENTE**.

**Tipo de agua:** Tropical (agua cálida), aunque es de los más tolerantes al frío de esta lista. **Temperatura recomendada: 22 °C** [ESTIMACIÓN: centro del rango ideal 20–24 °C, superposición de FishBase (18–24), Seriously Fish (18–25) y MAGyP (20–26 °C)] [[16]](https://www.fishbase.se/summary/Danio-rerio.html) [[36]](https://www.seriouslyfish.com/species/danio-rerio/) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf).

**Temperatura (°C)**

| Parámetro | Valor | Fuente |
|---|---|---|
| Rango de mantenimiento | 18–24 (FishBase); 18–25 (Seriously Fish); 20–26 (MAGyP, que agrega que "no debe superar nunca los 27 °C") | [[16]](https://www.fishbase.se/summary/Danio-rerio.html) [[36]](https://www.seriouslyfish.com/species/danio-rerio/) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf) |
| Ecología | en su zona de origen soporta desde 6 °C en invierno hasta 38 °C en verano (MAGyP); 24,6–38,6 °C medidos en julio (Seriously Fish) | [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf) [[36]](https://www.seriouslyfish.com/species/danio-rerio/) |
| CTmín (laboratorio) | 8,21 °C (aclimatados a 24 °C) | [[48]](https://www.trjfas.org/pdf.php?id=14952) |
| CTmáx (laboratorio) | 40,30 °C (aclimatados a 24 °C) | [[48]](https://www.trjfas.org/pdf.php?id=14952) |

**pH:** 6,0–8,0 (FishBase, Seriously Fish y MAGyP) [[16]](https://www.fishbase.se/summary/Danio-rerio.html) [[36]](https://www.seriouslyfish.com/species/danio-rerio/) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf).

**Dureza y TDS:** 5–19 °dH (≈ 89–338 mg/L CaCO₃) según FishBase [[16]](https://www.fishbase.se/summary/Danio-rerio.html); 5–20 dGH según Seriously Fish [[36]](https://www.seriouslyfish.com/species/danio-rerio/). El MAGyP pide mantener el nitrato por debajo de 50 mg/L y renovar cada mes el 20–30 % del agua [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf). **TDS: PENDIENTE** (piso orientativo ≈ 89 mg/L [ESTIMACIÓN]).

**Alimentación**

- Dieta: micropredador; en el acuario acepta casi todo. Seriously Fish recomienda alimento seco de calidad más vivo o congelado chico [[36]](https://www.seriouslyfish.com/species/danio-rerio/). Come en la columna de agua y en la superficie [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf).
- **Come pellets: sí** (micro-pellet de 0,5 mm).
- Tomas: **PENDIENTE**. **[ESTIMACIÓN]** 2 en adultos y 3 en juveniles.

Pellets por talla **[ESTIMACIÓN]** (peso con FishBase, a = 0,00977 y b = 3,04 [[16]](https://www.fishbase.se/summary/Danio-rerio.html)):

| Talla (LT) | Peso est. (g) | Tamaño de pellet (mm) | **Pellets por día** | **Pellets por toma** | Tomas/día | % PV/día usado | g/día (secundario) |
|---|---|---|---|---|---|---|---|
| Juvenil 1,5 cm | 0,0335 | 0,5 | **5** | **2** | 3 | 3,0 % | 0,0010 |
| Adulto 4,0 cm | 0,661 | 0,5 | **18–36** | **9–18** | 2 | 0,5–1,0 % | 0,0033–0,0066 |

Conviene programar **por cardumen**: 10 adultos → **180–360 pellets de 0,5 mm por día** (90–180 por toma) **[ESTIMACIÓN]**.

**Temperatura para suspender la alimentación:** **PENDIENTE**. **[Sugerencia de diseño]** Suspender por debajo de 16 °C (2 °C por debajo del mínimo publicado; el CTmín es 8,2 °C) y a 28 °C o más (el MAGyP pide no superar nunca los 27 °C).

**Alertas sugeridas para AquaFeed:**

| Variable | Ideal | Advertencia | Crítico |
|---|---|---|---|
| Temperatura | 20–24 °C | 16–20 °C o 24–28 °C | < 16 °C o ≥ 28 °C → suspender la alimentación [sugerencia de diseño] |
| pH | 6,0–8,0 | 5,5–6,0 o 8,0–8,5 [sugerencia de diseño] | < 5,5 o > 8,5 [sugerencia de diseño] |
| Dureza / TDS | 5–19 dGH | 19–20 dGH (Seriously Fish) | < 5 o > 20 dGH; TDS PENDIENTE |

**Ambiente recomendado**

| Aspecto | Recomendación | Fuente |
|---|---|---|
| Tipo | **Acuario** de interior (con calefactor en invierno) | [[36]](https://www.seriouslyfish.com/species/danio-rerio/) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf) |
| Volumen mínimo | **≈ 81 L** (base 90 × 30 cm) según Seriously Fish, porque es muy activo; **100 L** (60 cm) según el MAGyP; FishBase: 60 cm | [[36]](https://www.seriouslyfish.com/species/danio-rerio/) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf) [[16]](https://www.fishbase.se/summary/Danio-rerio.html) |
| Compañía | Muy pacífico; convive con tetras, vivíparos, peces arcoíris, anabántidos, corydoras y lochas. **Cardumen de al menos 8 a 10** (Seriously Fish); grupos de 10 (MAGyP) | [[36]](https://www.seriouslyfish.com/species/danio-rerio/) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf) |
| Espacio | Nada en la mitad superior y necesita espacio libre para nadar (importa más el largo del acuario que la altura) | [[36]](https://www.seriouslyfish.com/species/danio-rerio/) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf) |

### 3.3 Betta / pez luchador — *Betta splendens*

**Origen:** introducido en Argentina. Nativo de la cuenca del Mekong (Tailandia, Camboya, Vietnam, Malasia) [[17]](https://www.fishbase.se/summary/Betta-splendens.html) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf). Argentina lo exportó en 2023 (6,3 %) y en 2025 (2,6 %) [[1]](https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Informe%20Importaciones%20y%20Exportaciones%20Ornamentales%202023.pdf) [[3]](https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Informe%20Importaciones%20y%20Exportaciones%20Ornamentales%202025.pdf). Está en las 4 tiendas relevadas y es la especie con más publicaciones en Acuarios Plantados (26 variedades) [[7]](https://acuariosplantados.com.ar/categoria-producto/vivos/peces/). Según el MAGyP, la UICN lo considera Vulnerable [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf). Fecha de introducción: **PENDIENTE**.

**Tipo de agua:** Tropical (agua cálida). **Temperatura recomendada: 26 °C** [ESTIMACIÓN: centro del rango ideal 24–28 °C del MAGyP, que cae dentro de FishBase (24–30) y Seriously Fish (22–30 °C)] [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf) [[17]](https://www.fishbase.se/summary/Betta-splendens.html) [[37]](https://www.seriouslyfish.com/species/betta-splendens/).

**Temperatura (°C)**

| Parámetro | Valor | Fuente |
|---|---|---|
| Rango de mantenimiento | 24–28 (MAGyP); 24–30 (FishBase); 22–30 (Seriously Fish) | [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf) [[17]](https://www.fishbase.se/summary/Betta-splendens.html) [[37]](https://www.seriouslyfish.com/species/betta-splendens/) |
| Reproducción | 26–30 °C, pH ≈ 7,0, agua sin aireación (MAGyP) | [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf) |
| **Frío: baja la alimentación (laboratorio)** | la actividad y la alimentación disminuyeron a **17,5–16,5 °C** (enfriamiento de 1 °C por día desde 20,5 °C) | [[50]](https://cdnsciencepub.com/doi/10.1139/cjz-2025-0030) |
| Pérdida de equilibrio por frío (crónico) | 10,0 ± 1,2 °C | [[50]](https://cdnsciencepub.com/doi/10.1139/cjz-2025-0030) |
| CTmáx | **PENDIENTE** | — |

**pH:** 6,0–7,5 (MAGyP) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf); 6,0–8,0 (FishBase) [[17]](https://www.fishbase.se/summary/Betta-splendens.html). Seriously Fish: 5,0–7,0 para los silvestres y 6,0–8,0 para las variedades ornamentales [[37]](https://www.seriouslyfish.com/species/betta-splendens/).

**Dureza y TDS:** 5–19 °dH según FishBase [[17]](https://www.fishbase.se/summary/Betta-splendens.html); 1–15 dGH según Seriously Fish [[37]](https://www.seriouslyfish.com/species/betta-splendens/). **TDS: PENDIENTE** (piso orientativo ≈ 89 mg/L [ESTIMACIÓN]).

**Alimentación**

- Dieta: carnívoro (zooplancton, larvas de mosquito) [[17]](https://www.fishbase.se/summary/Betta-splendens.html) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf). Según Seriously Fish, acepta alimento seco una vez que lo reconoce como comida, pero conviene darle seguido *Daphnia*, *Artemia* o larvas de quironómido vivas o congeladas [[37]](https://www.seriouslyfish.com/species/betta-splendens/).
- **Come pellets: sí**, un pellet flotante chico (come en la superficie). Respira aire de forma facultativa [[17]](https://www.fishbase.se/summary/Betta-splendens.html): hay que dejarle acceso a la superficie.
- Tomas: el fabricante Hikari indica **6 micro-pellets por toma y 2 tomas por día** para un betta de 3,8 cm, nunca más de 6 por toma [[59]](https://hikariusa.com/tropical_folder/micro_pellets.html). Es el único dato de fabricante por especie de este documento.

Pellets por talla **[ESTIMACIÓN]** (peso con FishBase, a = 0,00977 y b = 2,97 [[17]](https://www.fishbase.se/summary/Betta-splendens.html); talla del cuerpo, sin las aletas largas de las variedades de cría):

| Talla (LT) | Peso est. (g) | Tamaño de pellet (mm) | **Pellets por día** | **Pellets por toma** | Tomas/día | % PV/día usado | g/día (secundario) |
|---|---|---|---|---|---|---|---|
| Juvenil 2,0 cm | 0,0766 | 0,5 | **13** | **4** | 3 | 3,0 % | 0,0023 |
| Adulto (cuerpo, sin aletas largas) 5,0 cm | 1,16 | 0,5 | **32–64** | **16–32** | 2 | 0,5–1,0 % | 0,0058–0,0116 |

*Discrepancia:* el cálculo por % PV da más pellets que Hikari (12 por día para 3,8 cm). **Para el betta se recomienda usar el dato de Hikari (6 × 2 = 12 pellets/día)** como valor inicial, y subir solo si no queda alimento sin comer [sugerencia de diseño].

**Temperatura para suspender la alimentación:** hay un dato de laboratorio: la actividad y la alimentación bajan a 17,5–16,5 °C [[50]](https://cdnsciencepub.com/doi/10.1139/cjz-2025-0030). **[Sugerencia de diseño]** Suspender por debajo de 18 °C y a 31 °C o más (1 °C por encima del máximo publicado; el CTmáx está PENDIENTE).

**Alertas sugeridas para AquaFeed:**

| Variable | Ideal | Advertencia | Crítico |
|---|---|---|---|
| Temperatura | 24–28 °C | 18–24 °C o 28–31 °C (FishBase y Seriously Fish llegan a 30 °C) | < 18 °C o ≥ 31 °C → suspender la alimentación [sugerencia de diseño; el límite frío se apoya en el dato de laboratorio] |
| pH | 6,0–7,5 | 5,5–6,0 o 7,5–8,0 | < 5,5 o > 8,0 [sugerencia de diseño] |
| Dureza / TDS | 5–15 dGH | 1–5 o 15–19 dGH | fuera de 1–19 dGH; TDS PENDIENTE |

**Ambiente recomendado**

| Aspecto | Recomendación | Fuente |
|---|---|---|
| Tipo | **Acuario** de interior con calefactor. El MAGyP pide desalentar la tenencia de machos en recipientes muy chicos, y Seriously Fish no apoya mantenerlos en frascos | [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf) [[37]](https://www.seriouslyfish.com/species/betta-splendens/) |
| Volumen mínimo | **≈ 41 L** (base 45 × 30 cm) para un macho o una pareja (Seriously Fish). MAGyP: tanque de cría de 20–30 L con una sola hembra | [[37]](https://www.seriouslyfish.com/species/betta-splendens/) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf) |
| Compañía | **No es para el acuario comunitario común**: lo mejor es tenerlo solo (Seriously Fish). Los machos pelean entre sí y hay que separarlos cuando maduran; las hembras pueden criarse juntas (MAGyP). Evitar peces de aletas largas (el macho los toma como rivales) y peces que muerden aletas | [[37]](https://www.seriouslyfish.com/species/betta-splendens/) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf) |
| Espacio | Gran saltador: el acuario tiene que estar tapado (MAGyP). Dejar la superficie accesible para que respire aire | [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf) [[17]](https://www.fishbase.se/summary/Betta-splendens.html) |

### 3.4 Tetra negro / monjita / viuda negra — *Gymnocorymbus ternetzi*

**Origen:** **nativo de Sudamérica, incluida Argentina**: según FishBase, de las cuencas de los ríos Paraguay y Guaporé hasta Argentina [[18]](https://www.fishbase.se/summary/Gymnocorymbus-ternetzi.html); el MAGyP da como origen Paraguay [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf). Gómez (MACN-CONICET) lo menciona como especie de valor ornamental y dice que los ejemplares silvestres son raros en los comercios argentinos; las variedades albina y velífera se importan del sudeste asiático [[12]](https://seacuicultura.es/images/aquatic-pdf/41_1.pdf). Argentina lo exportó los 3 años (4,4 / 2,5 / 2,4 %) [[1]](https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Informe%20Importaciones%20y%20Exportaciones%20Ornamentales%202023.pdf) [[2]](https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Importaciones%20y%20exportaciones%20de%20organismos%20ornamentales%202024.pdf) [[3]](https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Informe%20Importaciones%20y%20Exportaciones%20Ornamentales%202025.pdf). En las tiendas se ve sobre todo como "monjita", incluidas variedades "fluor" [[8]](https://www.aquabahia.com.ar/peces/).

**Tipo de agua:** Tropical (agua cálida; FishBase lo clasifica como subtropical). **Temperatura recomendada: 24 °C** [ESTIMACIÓN: centro del rango ideal 23–26 °C del MAGyP (24,5 °C, redondeado hacia abajo), dentro del rango de FishBase y Seriously Fish (20–26 °C)] [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf) [[18]](https://www.fishbase.se/summary/Gymnocorymbus-ternetzi.html) [[38]](https://www.seriouslyfish.com/species/gymnocorymbus-ternetzi/).

**Temperatura (°C)**

| Parámetro | Valor | Fuente |
|---|---|---|
| Rango de mantenimiento | 23–26 (MAGyP); 20–26 (FishBase); 20–26 (Seriously Fish) | [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf) [[18]](https://www.fishbase.se/summary/Gymnocorymbus-ternetzi.html) [[38]](https://www.seriouslyfish.com/species/gymnocorymbus-ternetzi/) |
| Ecología | subtropical, 20–28 °C (MAGyP) | [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf) |
| CTmín / CTmáx | **PENDIENTE** | — |

**pH:** 6,0–7,0 (Seriously Fish) [[38]](https://www.seriouslyfish.com/species/gymnocorymbus-ternetzi/); 6,0–8,0 (FishBase) [[18]](https://www.fishbase.se/summary/Gymnocorymbus-ternetzi.html); 5,8–8,0 (MAGyP) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf).

**Dureza y TDS:** 5–19 °dH (FishBase) [[18]](https://www.fishbase.se/summary/Gymnocorymbus-ternetzi.html); 5–20 dGH (Seriously Fish) [[38]](https://www.seriouslyfish.com/species/gymnocorymbus-ternetzi/). **TDS: PENDIENTE** (piso orientativo ≈ 89 mg/L [ESTIMACIÓN]).

**Alimentación**

- Dieta: omnívoro muy poco exigente; Seriously Fish recomienda escamas y gránulos más vivo o congelado [[38]](https://www.seriouslyfish.com/species/gymnocorymbus-ternetzi/). Según el MAGyP, acepta congelado, liofilizado, escamas y gránulos chicos [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf).
- **Come pellets: sí** (gránulo chico).
- Tomas: **PENDIENTE**. **[ESTIMACIÓN]** 2 en adultos y 3 en juveniles.

Pellets por talla **[ESTIMACIÓN]** (peso con FishBase, a = 0,01950 y b = 2,97 [[18]](https://www.fishbase.se/summary/Gymnocorymbus-ternetzi.html)):

| Talla (LT) | Peso est. (g) | Tamaño de pellet (mm) | **Pellets por día** | **Pellets por toma** | Tomas/día | % PV/día usado | g/día (secundario) |
|---|---|---|---|---|---|---|---|
| Juvenil 2,0 cm | 0,153 | 0,5 | **25** | **8** | 3 | 3,0 % | 0,0046 |
| Adulto 5,5 cm | 3,08 | 0,5 | **84–170** | **42–84** | 2 | 0,5–1,0 % | 0,0154–0,0308 |

Conviene programar **por cardumen**: 10 adultos → **840–1690 pellets de 0,5 mm por día** (420–840 por toma) **[ESTIMACIÓN]**.

**Temperatura para suspender la alimentación:** **PENDIENTE**. **[Sugerencia de diseño]** Suspender por debajo de 18 °C (2 °C por debajo del mínimo publicado) y a 29 °C o más (1 °C por encima del máximo ecológico de 28 °C).

**Alertas sugeridas para AquaFeed:**

| Variable | Ideal | Advertencia | Crítico |
|---|---|---|---|
| Temperatura | 23–26 °C | 18–23 °C o 26–29 °C | < 18 °C o ≥ 29 °C → suspender la alimentación [sugerencia de diseño] |
| pH | 6,0–7,0 | 5,8–6,0 o 7,0–8,0 | < 5,8 o > 8,0 |
| Dureza / TDS | 5–19 dGH | 19–20 dGH | < 5 o > 20 dGH; TDS PENDIENTE |

**Ambiente recomendado**

| Aspecto | Recomendación | Fuente |
|---|---|---|
| Tipo | **Acuario** de interior con calefactor | [[38]](https://www.seriouslyfish.com/species/gymnocorymbus-ternetzi/) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf) |
| Volumen mínimo | **≈ 68 L** (base 75 × 30 cm) para un grupo según Seriously Fish; **120 L** (60 cm) para 10 ejemplares según el MAGyP; FishBase: 60 cm | [[38]](https://www.seriouslyfish.com/species/gymnocorymbus-ternetzi/) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf) [[18]](https://www.fishbase.se/summary/Gymnocorymbus-ternetzi.html) |
| Compañía | Pacífico y activo; grupos de 5 o más (FishBase). Seriously Fish dice que tiene fama de morder aletas y que eso se corrige con un **cardumen de al menos 12**. Convive con vivíparos, danios, rasboras, otros tetras, corydoras y loricáridos chicos (Seriously Fish). **Puede morder aletas largas**: el MAGyP recomienda no juntarlo con peces de aletas largas y vistosas (bettas, escalares de velo) | [[18]](https://www.fishbase.se/summary/Gymnocorymbus-ternetzi.html) [[38]](https://www.seriouslyfish.com/species/gymnocorymbus-ternetzi/) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf) |
| Espacio | Nada en la zona media; prefiere luz tenue (se puede tamizar con plantas flotantes) y algo de corriente | [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf) |

### 3.5 Tetra cardenal — *Paracheirodon axelrodi*

**Origen:** introducido en Argentina y **no se cría en el país**: se importa. Nativo del alto Orinoco y del río Negro (Brasil, Colombia, Venezuela) [[19]](https://www.fishbase.se/summary/Paracheirodon-axelrodi.html). Es, lejos, **la especie más importada**: 61,7 % (2023), 51,4 % (2024) y 40,5 % (2025) de los peces de agua dulce importados [[1]](https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Informe%20Importaciones%20y%20Exportaciones%20Ornamentales%202023.pdf) [[2]](https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Importaciones%20y%20exportaciones%20de%20organismos%20ornamentales%202024.pdf) [[3]](https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Informe%20Importaciones%20y%20Exportaciones%20Ornamentales%202025.pdf). Está en las 4 tiendas relevadas. Según Seriously Fish, buena parte de lo que se comercia sigue siendo de captura silvestre, por ejemplo del Proyecto Piaba en el río Negro [[39]](https://www.seriouslyfish.com/species/paracheirodon-axelrodi/); el origen de los lotes que llegan a Argentina está **PENDIENTE**.

**Tipo de agua:** Tropical (agua cálida). **Temperatura recomendada: 25 °C** [ESTIMACIÓN: centro del rango de FishBase (23–27 °C), dentro del rango de Seriously Fish (23–29 °C)] [[19]](https://www.fishbase.se/summary/Paracheirodon-axelrodi.html) [[39]](https://www.seriouslyfish.com/species/paracheirodon-axelrodi/).

**Temperatura (°C)**

| Parámetro | Valor | Fuente |
|---|---|---|
| Rango de mantenimiento | 23–27 (FishBase); 23–29 (Seriously Fish) | [[19]](https://www.fishbase.se/summary/Paracheirodon-axelrodi.html) [[39]](https://www.seriouslyfish.com/species/paracheirodon-axelrodi/) |
| LT50 a 96 h (laboratorio) | **19,6 °C** por frío y **33,3 °C** por calor | [[51]](https://acta.inpa.gov.br/fasciculos/38-4/BODY/v38n4a23.html) |
| Otros límites de laboratorio | pH letal (CL50): 2,9 (ácido) y 8,8 (alcalino); amoníaco total CL50 a 96 h: 23,7 mg/L; con nitrito por encima de 1,1 mg/L se compromete la supervivencia | [[51]](https://acta.inpa.gov.br/fasciculos/38-4/BODY/v38n4a23.html) |

**pH:** 4,0–6,0 (FishBase) [[19]](https://www.fishbase.se/summary/Paracheirodon-axelrodi.html); Seriously Fish admite 3,5–7,5 [[39]](https://www.seriouslyfish.com/species/paracheirodon-axelrodi/).

**Dureza y TDS:** 5–12 °dH (FishBase) [[19]](https://www.fishbase.se/summary/Paracheirodon-axelrodi.html); 1–12 dGH (Seriously Fish) [[39]](https://www.seriouslyfish.com/species/paracheirodon-axelrodi/). Prefiere agua blanda y ácida. **TDS: PENDIENTE** (piso orientativo ≈ 18 mg/L [ESTIMACIÓN]).

**Alimentación**

- Dieta: micropredador (pequeños invertebrados); Seriously Fish recomienda alimento seco chico de calidad más vivo o congelado (*Artemia*, *Daphnia*) [[39]](https://www.seriouslyfish.com/species/paracheirodon-axelrodi/).
- **Come pellets: sí**, micro-pellet (boca muy chica).
- Tomas: **PENDIENTE**. **[ESTIMACIÓN]** 2 en adultos y 3 en juveniles.

Pellets por talla **[ESTIMACIÓN]** (peso con FishBase, a = 0,01122 y b = 3,08 [[19]](https://www.fishbase.se/summary/Paracheirodon-axelrodi.html)):

| Talla (LT) | Peso est. (g) | Tamaño de pellet (mm) | **Pellets por día** | **Pellets por toma** | Tomas/día | % PV/día usado | g/día (secundario) |
|---|---|---|---|---|---|---|---|
| Juvenil 1,5 cm | 0,0391 | 0,5 | **6** | **2** | 3 | 3,0 % | 0,0012 |
| Adulto 3,5 cm | 0,532 | 0,5 | **15–29** | **7–15** | 2 | 0,5–1,0 % | 0,0027–0,0053 |

Conviene programar **por cardumen**: 10 adultos → **150–290 pellets de 0,5 mm por día** (73–150 por toma) **[ESTIMACIÓN]**.

**Temperatura para suspender la alimentación:** **PENDIENTE**. **[Sugerencia de diseño]** Suspender por debajo de 21 °C (1,4 °C por encima de la LT50 por frío de 19,6 °C) y a 30 °C o más (3,3 °C por debajo de la LT50 por calor) [[51]](https://acta.inpa.gov.br/fasciculos/38-4/BODY/v38n4a23.html).

**Alertas sugeridas para AquaFeed:**

| Variable | Ideal | Advertencia | Crítico |
|---|---|---|---|
| Temperatura | 23–27 °C | 21–23 °C o 27–30 °C | < 21 °C o ≥ 30 °C → suspender la alimentación [sugerencia de diseño con LT50 de laboratorio] |
| pH | 4,0–6,0 (FishBase) | 3,5–4,0 o 6,0–7,5 (Seriously Fish) | < 3,5 o > 7,5 (el pH letal es 2,9 y 8,8) |
| Dureza / TDS | 1–12 dGH | 12–15 dGH [sugerencia de diseño] | > 15 dGH; TDS PENDIENTE |

**Ambiente recomendado**

| Aspecto | Recomendación | Fuente |
|---|---|---|
| Tipo | **Acuario** de interior con calefactor; mejor si está plantado y con luz tenue | [[39]](https://www.seriouslyfish.com/species/paracheirodon-axelrodi/) |
| Volumen mínimo | **≈ 54 L** (base 60 × 30 cm) según Seriously Fish | [[39]](https://www.seriouslyfish.com/species/paracheirodon-axelrodi/) |
| Compañía | Cardumen de al menos 8 a 10. Pacífico; **es presa de escalares y discos adultos** (el MAGyP lo advierte para el escalar con los neones) | [[39]](https://www.seriouslyfish.com/species/paracheirodon-axelrodi/) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf) |
| Espacio | Zona media; necesita espacio abierto para nadar en cardumen | [[39]](https://www.seriouslyfish.com/species/paracheirodon-axelrodi/) |

### 3.6 Escalar / pez ángel — *Pterophyllum scalare*

**Origen:** introducido en Argentina. Nativo de la cuenca amazónica (Perú, Colombia, Brasil), los ríos Oyapock y Essequibo [[20]](https://www.fishbase.se/summary/Pterophyllum-scalare.html). El MAGyP lo incluye entre las especies de la acuicultura ornamental argentina y en la guía de especies cultivadas [[5]](https://www.magyp.gob.ar/sitio/areas/acuicultura/cultivos/_archivos/000000_Desarrollo%20del%20cultivo%20de%20peces%20ornamentales.pdf) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf). No aparece en las tortas de exportación de 2023 a 2025, pero está en las 4 tiendas relevadas.

**Tipo de agua:** Tropical (agua cálida). **Temperatura recomendada: 27 °C** [ESTIMACIÓN: centro del rango 24–30 °C en el que coinciden FishBase, Seriously Fish y el MAGyP] [[20]](https://www.fishbase.se/summary/Pterophyllum-scalare.html) [[40]](https://www.seriouslyfish.com/species/pterophyllum-scalare/) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf).

**Temperatura (°C)**

| Parámetro | Valor | Fuente |
|---|---|---|
| Rango de mantenimiento | 24–30 (FishBase, Seriously Fish y MAGyP) | [[20]](https://www.fishbase.se/summary/Pterophyllum-scalare.html) [[40]](https://www.seriouslyfish.com/species/pterophyllum-scalare/) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf) |
| CTmín / CTmáx | **PENDIENTE**: Yanar et al. (2019) lo midieron, pero solo pude leer el resumen | [[47]](https://avesis.cu.edu.tr/yayin/4b106d62-7ebd-43cc-a345-cf60ab55cac8/thermal-tolerance-of-thirteen-popular-ornamental-fish-species) |

**pH:** 6,0–7,4 (Seriously Fish) [[40]](https://www.seriouslyfish.com/species/pterophyllum-scalare/); 6,0–8,0 (FishBase y MAGyP) [[20]](https://www.fishbase.se/summary/Pterophyllum-scalare.html) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf).

**Dureza y TDS:** 5–13 °dH (FishBase) [[20]](https://www.fishbase.se/summary/Pterophyllum-scalare.html); 0–15 dGH (Seriously Fish) [[40]](https://www.seriouslyfish.com/species/pterophyllum-scalare/). **TDS: PENDIENTE**.

**Alimentación**

- Dieta: omnívoro con tendencia carnívora; en la naturaleza come peces chicos e invertebrados. Acepta seco, vivo y congelado [[40]](https://www.seriouslyfish.com/species/pterophyllum-scalare/) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf).
- **Come pellets: sí** (pellet que flote o se hunda despacio).
- Tomas: **PENDIENTE**. **[ESTIMACIÓN]** 2 en adultos y 3 en juveniles.

Pellets por talla **[ESTIMACIÓN]** (peso con FishBase, a = 0,03236 y b = 2,98 [[20]](https://www.fishbase.se/summary/Pterophyllum-scalare.html); talla del cuerpo):

| Talla (LT) | Peso est. (g) | Tamaño de pellet (mm) | **Pellets por día** | **Pellets por toma** | Tomas/día | % PV/día usado | g/día (secundario) |
|---|---|---|---|---|---|---|---|
| Juvenil 3,0 cm | 0,855 | 0,5 | **140** | **47** | 3 | 3,0 % | 0,0256 |
| Adulto 10,0 cm | 30,9 | 0,8 | **340–680** | **170–340** | 2 | 0,5–1,0 % | 0,155–0,309 |
| Adulto grande 14,0 cm | 84,2 | 1,1 | **380–760** | **190–380** | 2 | 0,5–1,0 % | 0,421–0,842 |

**Temperatura para suspender la alimentación:** **PENDIENTE**. **[Sugerencia de diseño]** Suspender por debajo de 22 °C y a 32 °C o más (2 °C fuera del rango publicado).

**Alertas sugeridas para AquaFeed:**

| Variable | Ideal | Advertencia | Crítico |
|---|---|---|---|
| Temperatura | 24–30 °C | 22–24 °C o 30–32 °C | < 22 °C o ≥ 32 °C → suspender la alimentación [sugerencia de diseño] |
| pH | 6,0–7,4 | 5,5–6,0 o 7,4–8,0 | < 5,5 o > 8,0 |
| Dureza / TDS | 5–13 dGH | 0–5 o 13–15 dGH | > 15 dGH; TDS PENDIENTE |

**Ambiente recomendado**

| Aspecto | Recomendación | Fuente |
|---|---|---|
| Tipo | **Acuario alto** de interior con calefactor (el cuerpo y las aletas son altos) | [[40]](https://www.seriouslyfish.com/species/pterophyllum-scalare/) |
| Volumen mínimo | **≈ 200 L** (100 × 40 × 50 cm) según Seriously Fish; **300 L** (100 cm) según el MAGyP | [[40]](https://www.seriouslyfish.com/species/pterophyllum-scalare/) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf) |
| Compañía | Grupos de 5 o más para repartir la agresión (MAGyP); las parejas se ponen territoriales cuando desovan. **Se come a los neones, cardenales y peces chicos**. Evitar los que muerden aletas (barbo tigre, tetra negro) | [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf) [[40]](https://www.seriouslyfish.com/species/pterophyllum-scalare/) |
| Espacio | Necesita altura, plantas altas y zonas despejadas | [[40]](https://www.seriouslyfish.com/species/pterophyllum-scalare/) |

### 3.7 Barbo tigre / barbo sumatrano — *Puntigrus tetrazona*

**Origen:** introducido en Argentina. Nativo de Sumatra y Borneo [[21]](https://www.fishbase.se/summary/Puntigrus-tetrazona.html). Argentina lo exportó en 2023 (3,9 %) [[1]](https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Informe%20Importaciones%20y%20Exportaciones%20Ornamentales%202023.pdf) y figura en la guía del MAGyP [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf). Está en 3 de las 4 tiendas (como barbo tigre, verde o albino). El grupo "barbos" aparece en las 4.

**Tipo de agua:** Tropical (agua cálida). **Temperatura recomendada: 23 °C** [ESTIMACIÓN: centro del rango ideal 20–26 °C de FishBase y Seriously Fish; el MAGyP admite 20–28 °C] [[21]](https://www.fishbase.se/summary/Puntigrus-tetrazona.html) [[41]](https://www.seriouslyfish.com/species/puntigrus-tetrazona/) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf).

**Temperatura (°C)**

| Parámetro | Valor | Fuente |
|---|---|---|
| Rango de mantenimiento | 20–26 (FishBase); 20–26 (Seriously Fish); 20–28 (MAGyP) | [[21]](https://www.fishbase.se/summary/Puntigrus-tetrazona.html) [[41]](https://www.seriouslyfish.com/species/puntigrus-tetrazona/) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf) |
| CTmín (laboratorio) | 11,66–13,94 °C según la aclimatación; los autores la describen como relativamente estenoterma | [[47]](https://avesis.cu.edu.tr/yayin/4b106d62-7ebd-43cc-a345-cf60ab55cac8/thermal-tolerance-of-thirteen-popular-ornamental-fish-species) |
| CTmáx | **PENDIENTE** (en el resumen de Yanar et al. 2019 no figura el valor por especie) | [[47]](https://avesis.cu.edu.tr/yayin/4b106d62-7ebd-43cc-a345-cf60ab55cac8/thermal-tolerance-of-thirteen-popular-ornamental-fish-species) |

**pH:** 6,0–8,0 (FishBase) [[21]](https://www.fishbase.se/summary/Puntigrus-tetrazona.html); 5,0–8,0 (Seriously Fish y MAGyP) [[41]](https://www.seriouslyfish.com/species/puntigrus-tetrazona/) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf).

**Dureza y TDS:** 5–19 °dH (FishBase) [[21]](https://www.fishbase.se/summary/Puntigrus-tetrazona.html); 1–20 dGH (Seriously Fish) [[41]](https://www.seriouslyfish.com/species/puntigrus-tetrazona/). **TDS: PENDIENTE**.

**Alimentación**

- Dieta: omnívoro; acepta seco (escamas, gránulos) y vivo o congelado [[41]](https://www.seriouslyfish.com/species/puntigrus-tetrazona/) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf).
- **Come pellets: sí**.
- Tomas: **PENDIENTE**. **[ESTIMACIÓN]** 2 en adultos y 3 en juveniles.

Pellets por talla **[ESTIMACIÓN]** (peso con FishBase, a = 0,01585 y b = 2,94 [[21]](https://www.fishbase.se/summary/Puntigrus-tetrazona.html)):

| Talla (LT) | Peso est. (g) | Tamaño de pellet (mm) | **Pellets por día** | **Pellets por toma** | Tomas/día | % PV/día usado | g/día (secundario) |
|---|---|---|---|---|---|---|---|
| Juvenil 2,0 cm | 0,122 | 0,5 | **20** | **7** | 3 | 3,0 % | 0,0036 |
| Adulto 6,0 cm | 3,07 | 0,8 | **34–67** | **17–34** | 2 | 0,5–1,0 % | 0,0154–0,0307 |

Conviene programar **por cardumen**: 8 adultos → **270–540 pellets de 0,8 mm por día** (130–270 por toma) **[ESTIMACIÓN]**.

**Temperatura para suspender la alimentación:** **PENDIENTE**. **[Sugerencia de diseño]** Suspender por debajo de 18 °C (≈ 4 °C por encima del CTmín, porque es estenotermo) y a 30 °C o más (2 °C por encima del máximo del MAGyP).

**Alertas sugeridas para AquaFeed:**

| Variable | Ideal | Advertencia | Crítico |
|---|---|---|---|
| Temperatura | 20–26 °C | 18–20 °C o 26–30 °C | < 18 °C o ≥ 30 °C → suspender la alimentación [sugerencia de diseño] |
| pH | 6,0–8,0 | 5,0–6,0 (Seriously Fish y MAGyP) o 8,0–8,3 | < 5,0 o > 8,3 [sugerencia de diseño] |
| Dureza / TDS | 5–19 dGH | 1–5 o 19–20 dGH | > 20 dGH; TDS PENDIENTE |

**Ambiente recomendado**

| Aspecto | Recomendación | Fuente |
|---|---|---|
| Tipo | **Acuario** de interior con calefactor | [[41]](https://www.seriouslyfish.com/species/puntigrus-tetrazona/) |
| Volumen mínimo | **≈ 72 L** (base 80 × 30 cm) según Seriously Fish; **160 L** (100 cm) según el MAGyP | [[41]](https://www.seriouslyfish.com/species/puntigrus-tetrazona/) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf) |
| Compañía | **Cardumen de al menos 8 a 10** (Seriously Fish): en grupos chicos se vuelve agresivo. **Muerde aletas**: el MAGyP desaconseja juntarlo con guppys y escalares (y lo mismo vale para bettas y gouramis) | [[41]](https://www.seriouslyfish.com/species/puntigrus-tetrazona/) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf) |
| Espacio | Muy activo; necesita espacio libre para nadar | [[41]](https://www.seriouslyfish.com/species/puntigrus-tetrazona/) |

### 3.8 Corydora pimienta / limpiafondos — *Corydoras paleatus*

**Origen:** **nativo de Argentina** (cuenca del Paraná y del Plata; también Brasil y Uruguay) [[22]](https://www.fishbase.se/summary/Corydoras-paleatus.html). Gómez (MACN-CONICET) cuenta que se llevó a Europa en 1876 y que es de las especies argentinas con más valor ornamental [[12]](https://seacuicultura.es/images/aquatic-pdf/41_1.pdf). Argentina lo exportó en 2025 (1,9 %) [[3]](https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Informe%20Importaciones%20y%20Exportaciones%20Ornamentales%202025.pdf). Está en las 4 tiendas relevadas; el grupo "corydoras" es de los más ofrecidos. El MAGyP cita a *C. aeneus* como especie cultivada [[5]](https://www.magyp.gob.ar/sitio/areas/acuicultura/cultivos/_archivos/000000_Desarrollo%20del%20cultivo%20de%20peces%20ornamentales.pdf) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf).

**Tipo de agua: «Agua fría»**, como criterio de la app, porque es subtropical. FishBase da 18–23 °C [[22]](https://www.fishbase.se/summary/Corydoras-paleatus.html) y Acuario ICE vende las corydoras en su sección de agua fría [[9]](https://acuarioice.com/peces/). **Discrepancia:** Seriously Fish da 22–26 °C [[42]](https://www.seriouslyfish.com/species/corydoras-paleatus/). Conviene revisar esta clasificación con Horacio. **Temperatura recomendada: 22 °C** [ESTIMACIÓN: centro del rango ideal 20–24 °C, entre FishBase y Seriously Fish].

**Temperatura (°C)**

| Parámetro | Valor | Fuente |
|---|---|---|
| Rango de mantenimiento | 18–23 (FishBase); 22–26 (Seriously Fish) | [[22]](https://www.fishbase.se/summary/Corydoras-paleatus.html) [[42]](https://www.seriouslyfish.com/species/corydoras-paleatus/) |
| CTmáx (laboratorio) | 33,91–37,51 °C según la aclimatación | [[47]](https://avesis.cu.edu.tr/yayin/4b106d62-7ebd-43cc-a345-cf60ab55cac8/thermal-tolerance-of-thirteen-popular-ornamental-fish-species) |
| CTmín | **PENDIENTE** para *C. paleatus* | [[47]](https://avesis.cu.edu.tr/yayin/4b106d62-7ebd-43cc-a345-cf60ab55cac8/thermal-tolerance-of-thirteen-popular-ornamental-fish-species) |
| Referencia del género, *C. aeneus* (laboratorio) | la alimentación bajó a **14,5–13,5 °C**; pierde el equilibrio a 12,7 °C | [[50]](https://cdnsciencepub.com/doi/10.1139/cjz-2025-0030) |

**pH:** 6,0–7,0 (Seriously Fish) [[42]](https://www.seriouslyfish.com/species/corydoras-paleatus/); 6,0–8,0 (FishBase) [[22]](https://www.fishbase.se/summary/Corydoras-paleatus.html).

**Dureza y TDS:** 5–19 °dH (FishBase) [[22]](https://www.fishbase.se/summary/Corydoras-paleatus.html); hasta 12 dGH (Seriously Fish) [[42]](https://www.seriouslyfish.com/species/corydoras-paleatus/). **TDS: PENDIENTE**.

**Alimentación**

- Dieta: omnívoro de fondo; revuelve el sustrato buscando invertebrados [[42]](https://www.seriouslyfish.com/species/corydoras-paleatus/).
- **⚠ Come pellets: no del flotante.** Come en el fondo, así que necesita **pellets o pastillas que se hundan** [[42]](https://www.seriouslyfish.com/species/corydoras-paleatus/); el MAGyP también indica, para *C. aeneus*, "alimentos secos que se hunden" y dice que está más activo al comer y de noche [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf). El alimentador sirve solo si se carga con **pellet que se hunda**. Conviene una toma con poca luz y comprobar que el alimento llegue al fondo y no se lo coman los peces de arriba.
- Tomas: **PENDIENTE**. **[ESTIMACIÓN]** 2 (una al apagarse las luces).

Pellets por talla **[ESTIMACIÓN]** (peso con FishBase, a = 0,01995 y b = 2,96 [[22]](https://www.fishbase.se/summary/Corydoras-paleatus.html); control cruzado con la ecuación local de Gómez: P = 2,6762·10⁻⁵ · LE(mm)^3,0909 da ≈ 4,77 g para 5 cm de longitud estándar, contra ≈ 4,01 g con FishBase para 6 cm de longitud total [[12]](https://seacuicultura.es/images/aquatic-pdf/41_1.pdf)):

| Talla (LT) | Peso est. (g) | Tamaño de pellet (mm) | **Pellets por día** | **Pellets por toma** | Tomas/día | % PV/día usado | g/día (secundario) |
|---|---|---|---|---|---|---|---|
| Juvenil 2,0 cm | 0,155 | 0,5 | **25** | **8** | 3 | 3,0 % | 0,0047 |
| Adulto 6,0 cm | 4,01 | 0,8 | **44–88** | **22–44** | 2 | 0,5–1,0 % | 0,0201–0,0401 |

Conviene programar **por cardumen**: 5 adultos → **220–440 pellets de 0,8 mm por día** (110–220 por toma) **[ESTIMACIÓN]**.

**Temperatura para suspender la alimentación:** **PENDIENTE** para la especie. **[Sugerencia de diseño]** Suspender por debajo de 15 °C (en *C. aeneus*, la alimentación baja a 14,5–13,5 °C [[50]](https://cdnsciencepub.com/doi/10.1139/cjz-2025-0030)) y a 30 °C o más (≈ 4 °C por debajo del CTmáx más bajo).

**Alertas sugeridas para AquaFeed:**

| Variable | Ideal | Advertencia | Crítico |
|---|---|---|---|
| Temperatura | 20–24 °C | 15–20 °C o 24–30 °C | < 15 °C o ≥ 30 °C → suspender la alimentación [sugerencia de diseño] |
| pH | 6,0–7,0 | 7,0–8,0 (FishBase) | < 6,0 o > 8,0 |
| Dureza / TDS | ≤ 12 dGH | 12–19 dGH (FishBase) | > 19 dGH; TDS PENDIENTE |

**Ambiente recomendado**

| Aspecto | Recomendación | Fuente |
|---|---|---|
| Tipo | **Acuario** con fondo de arena fina (se lastima los barbillones con la grava filosa) | [[42]](https://www.seriouslyfish.com/species/corydoras-paleatus/) |
| Volumen mínimo | **≈ 70 L** (base 61 × 38 cm) según Seriously Fish; el MAGyP pide 60 cm para *C. aeneus* | [[42]](https://www.seriouslyfish.com/species/corydoras-paleatus/) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf) |
| Compañía | Muy pacífico; conviene tenerlo en grupo, pero el número mínimo con fuente está **PENDIENTE** (5 o más es [sugerencia de diseño]). Convive con peces chicos y tranquilos | [[42]](https://www.seriouslyfish.com/species/corydoras-paleatus/) |
| Espacio | Lo que importa es la superficie de fondo (arena, piedras o madera para esconderse) | [[42]](https://www.seriouslyfish.com/species/corydoras-paleatus/) |

### 3.9 Otocinclus / oto — *Otocinclus* spp.

**Origen:** varía según la especie. El que más se importa es *O. vestitus*, del Amazonas (2,8 % de las importaciones en 2023 y 6,3 % en 2024) [[1]](https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Informe%20Importaciones%20y%20Exportaciones%20Ornamentales%202023.pdf) [[2]](https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Importaciones%20y%20exportaciones%20de%20organismos%20ornamentales%202024.pdf) [[23]](https://www.fishbase.se/summary/Otocinclus-vestitus.html); *O. arnoldi* es nativo del bajo Paraná y del Plata [[34]](https://www.fishbase.se/summary/Otocinclus-arnoldi.html). Está en las 4 tiendas relevadas, casi siempre sin nombre de especie. Qué especie se vende exactamente en Argentina: **PENDIENTE**.

**Tipo de agua:** Tropical (agua cálida). **Temperatura recomendada: 23 °C** [ESTIMACIÓN: centro del rango de FishBase para *O. affinis* (20–26 °C), dentro del rango de Seriously Fish para *O. macrospilus* (21–26 °C)] [[24]](https://www.fishbase.se/summary/Otocinclus-affinis.html) [[43]](https://www.seriouslyfish.com/species/otocinclus-macrospilus/).

**Temperatura (°C)**

| Parámetro | Valor | Fuente |
|---|---|---|
| Rango de mantenimiento | 20–26 (FishBase, *O. affinis*); 21–26 (Seriously Fish, *O. macrospilus*) | [[24]](https://www.fishbase.se/summary/Otocinclus-affinis.html) [[43]](https://www.seriouslyfish.com/species/otocinclus-macrospilus/) |
| CTmín / CTmáx | **PENDIENTE** | — |

**pH:** 5,5–7,5 (Seriously Fish, *O. macrospilus*) [[43]](https://www.seriouslyfish.com/species/otocinclus-macrospilus/); 6,0–8,0 (FishBase, *O. affinis*) [[24]](https://www.fishbase.se/summary/Otocinclus-affinis.html).

**Dureza y TDS:** 1–12 dGH (Seriously Fish) [[43]](https://www.seriouslyfish.com/species/otocinclus-macrospilus/); 5–19 °dH (FishBase, *O. affinis*) [[24]](https://www.fishbase.se/summary/Otocinclus-affinis.html). Casi todos son de captura silvestre y sensibles a la mala calidad del agua; conviene un acuario maduro. **TDS: PENDIENTE**.

**Alimentación**

- Dieta: **raspa algas y biofilm** de hojas y vidrios. Necesita un acuario maduro con algas; como complemento, wafers de algas, pastillas de espirulina y verduras (zucchini, pepino, espinaca escaldada); come casi todo el tiempo y muchos mueren de hambre después de la importación [[43]](https://www.seriouslyfish.com/species/otocinclus-macrospilus/).
- **⚠ Come pellets: NO.** El alimentador no sirve para esta especie: **cargar 0 pellets en la app** y alimentarlo a mano. Los gramos de la tabla son solo orientativos.

Pellets por talla **[ESTIMACIÓN]** (peso con FishBase, a = 0,00977 y b = 3,06 [[24]](https://www.fishbase.se/summary/Otocinclus-affinis.html); referencia del género):

| Talla (LT) | Peso est. (g) | % PV/día usado | g/día de alimento vegetal (referencia para alimentar a mano) |
|---|---|---|---|
| Juvenil 2,0 cm | 0,0815 | 3,0 % | 0,0024 |
| Adulto 4,0 cm | 0,680 | 0,5–1,0 % | 0,0034–0,0068 |

**Temperatura para suspender la alimentación:** no corresponde, porque no la da el alimentador. **[Sugerencia de diseño]** Alarmas por debajo de 18 °C y a 29 °C o más.

**Alertas sugeridas para AquaFeed:**

| Variable | Ideal | Advertencia | Crítico |
|---|---|---|---|
| Temperatura | 21–26 °C | 18–21 °C o 26–29 °C | < 18 °C o ≥ 29 °C [sugerencia de diseño] |
| pH | 6,0–7,5 | 5,5–6,0 o 7,5–8,0 | < 5,5 o > 8,0 [sugerencia de diseño] |
| Dureza / TDS | 1–12 dGH | 12–15 dGH | > 15 dGH; TDS PENDIENTE |

**Ambiente recomendado**

| Aspecto | Recomendación | Fuente |
|---|---|---|
| Tipo | **Acuario plantado y maduro** (con biofilm y algas) | [[43]](https://www.seriouslyfish.com/species/otocinclus-macrospilus/) |
| Volumen mínimo | **≈ 41 L** (base 45 × 30 cm) según Seriously Fish | [[43]](https://www.seriouslyfish.com/species/otocinclus-macrospilus/) |
| Compañía | Muy pacífico; **grupos de al menos 6**. Solo con peces chicos y tranquilos | [[43]](https://www.seriouslyfish.com/species/otocinclus-macrospilus/) |
| Espacio | Necesita superficies (hojas y vidrios) para raspar, más que volumen de agua | [[43]](https://www.seriouslyfish.com/species/otocinclus-macrospilus/) |

### 3.10 Ancistrus / limpiavidrios / cara de bigote — *Ancistrus* spp.

**Origen:** varía según la especie. El ancistrus comercial (a menudo llamado *A. cf. cirrhosus* o "bristlenose") es un híbrido o una especie sin identificar, de criadero [[44]](https://www.seriouslyfish.com/species/ancistrus-cf-cirrhosus/); *A. cirrhosus* es nativo de la cuenca del Paraná [[25]](https://www.fishbase.se/summary/Ancistrus-cirrhosus.html). El MAGyP lo incluye en la acuicultura ornamental argentina [[5]](https://www.magyp.gob.ar/sitio/areas/acuicultura/cultivos/_archivos/000000_Desarrollo%20del%20cultivo%20de%20peces%20ornamentales.pdf). Está en las 4 tiendas relevadas (común, albino, velo, "super red"). Qué especie se vende exactamente: **PENDIENTE**.

**Tipo de agua:** Tropical (agua cálida). **Temperatura recomendada: 24 °C** [ESTIMACIÓN: centro del rango de Seriously Fish (21–26 °C)] [[44]](https://www.seriouslyfish.com/species/ancistrus-cf-cirrhosus/).

**Temperatura (°C)**

| Parámetro | Valor | Fuente |
|---|---|---|
| Rango de mantenimiento | 21–26 (Seriously Fish) | [[44]](https://www.seriouslyfish.com/species/ancistrus-cf-cirrhosus/) |
| CTmín / CTmáx | **PENDIENTE** | — |

**pH:** 5,5–7,5 (Seriously Fish) [[44]](https://www.seriouslyfish.com/species/ancistrus-cf-cirrhosus/).

**Dureza y TDS:** 1–15 dGH (Seriously Fish) [[44]](https://www.seriouslyfish.com/species/ancistrus-cf-cirrhosus/). **TDS: PENDIENTE**.

**Alimentación**

- Dieta: omnívoro con mucho componente vegetal. Seriously Fish recomienda alimento seco que se hunda, congelado (*Daphnia*, larvas) y vegetales frescos (fruta, papa hervida, verduras) [[44]](https://www.seriouslyfish.com/species/ancistrus-cf-cirrhosus/).
- **⚠ Come pellets: en parte.** No come pellet flotante. El alimentador sirve solo con **pellet o pastilla que se hunda**, y hay que completar con vegetales a mano.
- Tomas: **PENDIENTE**. **[ESTIMACIÓN]** 1–2 (de noche).

Pellets por talla **[ESTIMACIÓN]** (peso con FishBase, a = 0,01479 y b = 2,98 [[25]](https://www.fishbase.se/summary/Ancistrus-cirrhosus.html)):

| Talla (LT) | Peso est. (g) | Tamaño de pellet (mm) | **Pellets por día** | **Pellets por toma** | Tomas/día | % PV/día usado | g/día (secundario) |
|---|---|---|---|---|---|---|---|
| Juvenil 4,0 cm | 0,921 | 0,5 | **150** | **50** | 3 | 3,0 % | 0,0276 |
| Adulto 10,0 cm | 14,1 | 0,8 | **150–310** | **77–150** | 2 | 0,5–1,0 % | 0,0706–0,141 |
| Adulto grande 13,0 cm | 30,9 | 1,1 | **140–280** | **70–140** | 2 | 0,5–1,0 % | 0,154–0,309 |

**Temperatura para suspender la alimentación:** **PENDIENTE**. **[Sugerencia de diseño]** Suspender por debajo de 18 °C y a 30 °C o más.

**Alertas sugeridas para AquaFeed:**

| Variable | Ideal | Advertencia | Crítico |
|---|---|---|---|
| Temperatura | 21–26 °C | 18–21 °C o 26–30 °C | < 18 °C o ≥ 30 °C → suspender la alimentación [sugerencia de diseño] |
| pH | 5,5–7,5 | 5,0–5,5 o 7,5–8,0 | < 5,0 o > 8,0 [sugerencia de diseño] |
| Dureza / TDS | 1–15 dGH | 15–20 dGH | > 20 dGH; TDS PENDIENTE |

**Ambiente recomendado**

| Aspecto | Recomendación | Fuente |
|---|---|---|
| Tipo | **Acuario** bien oxigenado y con escondites | [[44]](https://www.seriouslyfish.com/species/ancistrus-cf-cirrhosus/) |
| Volumen mínimo | **≈ 54 L** (base 60 × 30 cm) para un ejemplar o una pareja (Seriously Fish) | [[44]](https://www.seriouslyfish.com/species/ancistrus-cf-cirrhosus/) |
| Compañía | Apto para acuario comunitario; temperamento **territorial** (Seriously Fish lo recomienda solo o en pareja) | [[44]](https://www.seriouslyfish.com/species/ancistrus-cf-cirrhosus/) |
| Espacio | Lo que importa es la superficie de fondo y las cuevas | [[44]](https://www.seriouslyfish.com/species/ancistrus-cf-cirrhosus/) |

### 3.11 Disco — *Symphysodon* spp. (*S. aequifasciatus*, *S. discus*)

**Origen:** introducido en Argentina. Nativo de la cuenca amazónica [[26]](https://www.fishbase.se/summary/Symphysodon-aequifasciatus.html). Figura en la guía del MAGyP como *S. discus* [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf). Está en las 4 tiendas; en Acuarios Plantados es la especie con más publicaciones (31 variedades) [[7]](https://acuariosplantados.com.ar/categoria-producto/vivos/peces/).

**Tipo de agua:** Tropical (agua cálida). **Temperatura recomendada: 28 °C** [ESTIMACIÓN: centro del rango ideal 27–30 °C, superposición de FishBase (26–30 °C) y el MAGyP (27–31 °C)] [[26]](https://www.fishbase.se/summary/Symphysodon-aequifasciatus.html) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf).

**Temperatura (°C)**

| Parámetro | Valor | Fuente |
|---|---|---|
| Rango de mantenimiento | 26–30 (FishBase); 27–31 (MAGyP); Seriously Fish no lo registra | [[26]](https://www.fishbase.se/summary/Symphysodon-aequifasciatus.html) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf) |
| CTmín / CTmáx | **PENDIENTE** | — |

**pH:** 5,0–6,5 [sugerencia de diseño]: FishBase da 5,0–8,0 [[26]](https://www.fishbase.se/summary/Symphysodon-aequifasciatus.html) y el MAGyP 4,2–6,5 [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf).

**Dureza y TDS:** 0–12 °dH (FishBase) [[26]](https://www.fishbase.se/summary/Symphysodon-aequifasciatus.html). Agua muy blanda. **TDS: PENDIENTE**.

**Alimentación**

- Dieta: omnívoro con tendencia carnívora; en la naturaleza come sobre todo zooplancton; acepta gránulos de calidad, congelado y vivo [[45]](https://www.seriouslyfish.com/species/symphysodon-aequifasciatus/) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf).
- **Come pellets: sí**, gránulo que se hunda despacio.
- Tomas: **PENDIENTE**. **[ESTIMACIÓN]** 2–3.

Pellets por talla **[ESTIMACIÓN]** (peso con FishBase, a = 0,02692 y b = 3,03 [[26]](https://www.fishbase.se/summary/Symphysodon-aequifasciatus.html)):

| Talla (LT) | Peso est. (g) | Tamaño de pellet (mm) | **Pellets por día** | **Pellets por toma** | Tomas/día | % PV/día usado | g/día (secundario) |
|---|---|---|---|---|---|---|---|
| Juvenil 6,0 cm | 6,14 | 0,8 | **400** | **130** | 3 | 3,0 % | 0,184 |
| Adulto 15,0 cm | 98,5 | 1,1 | **450–890** | **220–450** | 2 | 0,5–1,0 % | 0,493–0,985 |

*Discrepancia:* el MAGyP da una longitud máxima de 30 cm; FishBase da 12,3–13,7 cm de longitud estándar. Acá se usan 15 cm de longitud total.

**Temperatura para suspender la alimentación:** **PENDIENTE**. **[Sugerencia de diseño]** Suspender por debajo de 24 °C y a 33 °C o más.

**Alertas sugeridas para AquaFeed:**

| Variable | Ideal | Advertencia | Crítico |
|---|---|---|---|
| Temperatura | 27–30 °C | 24–27 °C o 30–33 °C | < 24 °C o ≥ 33 °C → suspender la alimentación [sugerencia de diseño] |
| pH | 5,0–6,5 | 4,2–5,0 o 6,5–7,5 | < 4,2 o > 7,5 [sugerencia de diseño] |
| Dureza / TDS | 0–12 dGH | 12–15 dGH | > 15 dGH; TDS PENDIENTE |

**Ambiente recomendado**

| Aspecto | Recomendación | Fuente |
|---|---|---|
| Tipo | **Acuario** de interior con calefactor | [[45]](https://www.seriouslyfish.com/species/symphysodon-aequifasciatus/) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf) |
| Volumen mínimo | **≈ 255 L** (120 × 45 × 45 cm) para una pareja reproductora según Seriously Fish; **300 L** según el MAGyP | [[45]](https://www.seriouslyfish.com/species/symphysodon-aequifasciatus/) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf) |
| Compañía | Gregario (Seriously Fish lo clasifica como de cardumen): **al menos 3** (MAGyP) | [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf) [[45]](https://www.seriouslyfish.com/species/symphysodon-aequifasciatus/) |
| Espacio | Puede ser tan alto como largo: necesita acuario alto; es muy tímido y necesita muchos escondites (plantas) | [[45]](https://www.seriouslyfish.com/species/symphysodon-aequifasciatus/) |

### 3.12 Gourami azul / tricho — *Trichopodus trichopterus*

**Origen:** introducido en Argentina. Nativo del sudeste asiático (cuenca del Mekong, Tailandia, Indonesia) [[27]](https://www.fishbase.se/summary/Trichopodus-trichopterus.html). Figura en la guía del MAGyP [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf). El grupo "gourami" (azul, dorado, perla, enano) está en las 4 tiendas.

**Tipo de agua:** Tropical (agua cálida). **Temperatura recomendada: 26 °C** [ESTIMACIÓN: centro del rango ideal 24–28 °C, superposición de FishBase (22–28), Seriously Fish (24–30) y MAGyP (23–28 °C)] [[27]](https://www.fishbase.se/summary/Trichopodus-trichopterus.html) [[46]](https://www.seriouslyfish.com/species/trichopodus-trichopterus/) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf).

**Temperatura (°C)**

| Parámetro | Valor | Fuente |
|---|---|---|
| Rango de mantenimiento | 22–28 (FishBase); 24–30 (Seriously Fish); 23–28 (MAGyP) | [[27]](https://www.fishbase.se/summary/Trichopodus-trichopterus.html) [[46]](https://www.seriouslyfish.com/species/trichopodus-trichopterus/) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf) |
| CTmín / CTmáx | **PENDIENTE** | — |

**pH:** 6,0–8,0 (FishBase y MAGyP) [[27]](https://www.fishbase.se/summary/Trichopodus-trichopterus.html) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf); 5,5–8,5 (Seriously Fish) [[46]](https://www.seriouslyfish.com/species/trichopodus-trichopterus/).

**Dureza y TDS:** 5–19 °dH (FishBase) [[27]](https://www.fishbase.se/summary/Trichopodus-trichopterus.html); 3–35 dGH (Seriously Fish) [[46]](https://www.seriouslyfish.com/species/trichopodus-trichopterus/). **TDS: PENDIENTE**.

**Alimentación**

- Dieta: omnívoro; acepta seco, vivo y congelado [[46]](https://www.seriouslyfish.com/species/trichopodus-trichopterus/) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf).
- **Come pellets: sí**, pellet flotante. Respira aire de forma obligada [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf): la superficie tiene que quedar libre.
- Tomas: **PENDIENTE**. **[ESTIMACIÓN]** 2 en adultos.

Pellets por talla **[ESTIMACIÓN]** (peso con FishBase, a = 0,02089 y b = 3,02 [[27]](https://www.fishbase.se/summary/Trichopodus-trichopterus.html)):

| Talla (LT) | Peso est. (g) | Tamaño de pellet (mm) | **Pellets por día** | **Pellets por toma** | Tomas/día | % PV/día usado | g/día (secundario) |
|---|---|---|---|---|---|---|---|
| Juvenil 4,0 cm | 1,37 | 0,5 | **230** | **75** | 3 | 3,0 % | 0,0412 |
| Adulto 11,0 cm | 29,2 | 1,1 | **130–260** | **66–130** | 2 | 0,5–1,0 % | 0,146–0,292 |

**Temperatura para suspender la alimentación:** **PENDIENTE**. **[Sugerencia de diseño]** Suspender por debajo de 20 °C y a 32 °C o más.

**Alertas sugeridas para AquaFeed:**

| Variable | Ideal | Advertencia | Crítico |
|---|---|---|---|
| Temperatura | 24–28 °C | 20–24 °C o 28–32 °C | < 20 °C o ≥ 32 °C → suspender la alimentación [sugerencia de diseño] |
| pH | 6,0–8,0 | 5,5–6,0 o 8,0–8,5 | < 5,5 o > 8,5 [sugerencia de diseño] |
| Dureza / TDS | 5–19 dGH | 3–5 o 19–35 dGH | < 3 o > 35 dGH; TDS PENDIENTE |

**Ambiente recomendado**

| Aspecto | Recomendación | Fuente |
|---|---|---|
| Tipo | **Acuario** de interior con calefactor | [[46]](https://www.seriouslyfish.com/species/trichopodus-trichopterus/) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf) |
| Volumen mínimo | **≈ 81 L** (90 × 30 × 30 cm) según Seriously Fish; **200 L** (100 cm) según el MAGyP | [[46]](https://www.seriouslyfish.com/species/trichopodus-trichopterus/) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf) |
| Compañía | Los machos pueden ser agresivos; el MAGyP recomienda **3 hembras por macho**. No juntarlo con peces que muerden aletas | [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf) [[46]](https://www.seriouslyfish.com/species/trichopodus-trichopterus/) |
| Espacio | Acuario plantado con plantas flotantes y zonas abiertas para nadar | [[46]](https://www.seriouslyfish.com/species/trichopodus-trichopterus/) |

## 4. Discrepancias y limitaciones

- **El ranking no se basa en ventas.** Usa la participación de cada especie en las tortas del informe del MAGyP (exportaciones e importaciones de 2023 a 2025) [[1]](https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Informe%20Importaciones%20y%20Exportaciones%20Ornamentales%202023.pdf) [[2]](https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Importaciones%20y%20exportaciones%20de%20organismos%20ornamentales%202024.pdf) [[3]](https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Informe%20Importaciones%20y%20Exportaciones%20Ornamentales%202025.pdf) y la presencia en solo 4 tiendas online, relevadas un solo día (28/09/2026) [[6]](https://www.acuarioatlantida.com.ar/agua-dulce/peces-agua-dulce/) [[7]](https://acuariosplantados.com.ar/categoria-producto/vivos/peces/) [[8]](https://www.aquabahia.com.ar/peces/) [[9]](https://acuarioice.com/peces/). No hay datos públicos de ventas en el mercado interno. **MercadoLibre no se pudo relevar**: pidió verificar la cuenta o devolvió 403 [[10]](https://listado.mercadolibre.com.ar/animales-mascotas/peces/peces-vivos). No intenté saltear el bloqueo.
- **Litros mínimos:** el MAGyP pide volúmenes mucho mayores que Seriously Fish (por ejemplo, barbo tigre 160 contra 72 L, gourami 200 contra 81 L) [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf). En la tabla se ven los dos valores; para la app conviene tomar el mayor como recomendado y el menor como mínimo absoluto [sugerencia de diseño].
- **Chanchita (*Cichlasoma dimerus*):** según la UNaM tiene "mucha importancia" como ornamental [[11]](https://www.primeraedicion.com.ar/nota/100747630/peces-del-rio-parana-cichlasoma-dimerus/), pero FishBase dice que no es vistosa ni interesante para el comercio [[28]](https://www.fishbase.se/summary/Cichlasoma-dimerus.html), y no apareció en ninguna de las 4 tiendas. Por eso no tiene ficha.
- **Corydora pimienta, «Agua fría» o «Tropical»:** FishBase la da como subtropical (18–23 °C) [[22]](https://www.fishbase.se/summary/Corydoras-paleatus.html) y Seriously Fish entre 22 y 26 °C [[42]](https://www.seriouslyfish.com/species/corydoras-paleatus/). La clasifiqué como agua fría por criterio de la app: **revisarlo con Horacio**.
- **Talla del disco:** el MAGyP da 30 cm [[4]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf) y FishBase 12,3–13,7 cm de longitud estándar [[26]](https://www.fishbase.se/summary/Symphysodon-aequifasciatus.html). El dato del MAGyP parece un error.
- **Pellets:** el modelo de 0,5–1 % del peso corporal por día [[52]](https://ask.ifas.ufl.edu/publication/FA096) [[53]](https://aquariumscience.org/3-3-1-amount-in-depth/) con la masa de pellet de BioMar (trucha) [[58]](https://www.naturewater.ru/upload/iblock/10a/10ac1373d93147007daf983dd9276c25.pdf) da más pellets que la indicación de Hikari para betta (6 por toma) [[59]](https://hikariusa.com/tropical_folder/micro_pellets.html). Además, con micro-pellet de 0,5 mm, un cardumen de 10 peces chicos necesitaría cientos de pellets por día: **dosificar pellet por pellet no es práctico para los peces chicos en cardumen**. Conviene un pellet más grande o calibrar por gramos para esas especies [sugerencia de diseño]. Hay que medir la masa real de los pellets comerciales (PENDIENTE).
- **Temperaturas de suspensión:** todas son [sugerencia de diseño], salvo las que se apoyan en datos de laboratorio: betta y *C. aeneus* [[50]](https://cdnsciencepub.com/doi/10.1139/cjz-2025-0030) y la LT50 del cardenal [[51]](https://acta.inpa.gov.br/fasciculos/38-4/BODY/v38n4a23.html).
- **Especies de fondo o que no comen pellets:** otocinclus (0 pellets), ancistrus (en parte, con pellet que se hunda) y corydoras (solo pellet que se hunda). El alimentador tiene que permitir marcar la especie como "no apta" o "requiere pellet que se hunda" [sugerencia de diseño].

## 5. PENDIENTES

- Relevar MercadoLibre Argentina y más tiendas, incluidas las del interior; conseguir datos de ventas en el mercado interno (cámaras del sector o criaderos). INIDEP: no encontré nada sobre acuarismo ornamental.
- TDS para las 12 especies: ninguna fuente lo da directamente.
- Temperaturas de corte con fuente (salvo betta, corydoras por el género y cardenal por la LT50).
- CTmín y CTmáx del escalar, gourami, ancistrus y *C. paleatus* (texto completo de Yanar et al. 2019); CTmáx del betta; datos térmicos del tetra negro, disco y otocinclus.
- Ancho de boca y número de tomas por especie (las tomas son [ESTIMACIÓN]).
- Masa real de los pellets tropicales comerciales de 0,5–2 mm (el modelo usa pellet de trucha de BioMar).
- Qué especies de otocinclus y ancistrus se venden exactamente en Argentina; si los cardenales importados son silvestres o de criadero.
- pH y dureza del agua de red en las ciudades argentinas (para decidir los valores por defecto de la app).
- Posibles fichas adicionales: ramirezi, cíclidos africanos (mbunas), neón verde, borrachitos, rasbora arlequín, *Pangio kuhlii*, chanchita y *Apistogramma borellii*.
- Fechas de introducción de las especies exóticas en Argentina.

## 6. Fuentes

1. MAGyP, Dirección de Acuicultura: informe de importaciones y exportaciones de organismos ornamentales 2023. https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Informe%20Importaciones%20y%20Exportaciones%20Ornamentales%202023.pdf
2. MAGyP: importaciones y exportaciones de organismos ornamentales 2024. https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Importaciones%20y%20exportaciones%20de%20organismos%20ornamentales%202024.pdf
3. MAGyP: informe de importaciones y exportaciones de organismos ornamentales 2025. https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Informe%20Importaciones%20y%20Exportaciones%20Ornamentales%202025.pdf
4. MAGyP (2025): Peces de cultivo y captura que se trasladan en Argentina con finalidad ornamental, Tomo 1. https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_Peces%20de%20cultivo%20y%20captura%20que%20se%20trasladan%20en%20Argentina%20con%20finalidad%20ornamental%20(Tomo%201).pdf
5. MAGyP: Desarrollo del cultivo de peces ornamentales. https://www.magyp.gob.ar/sitio/areas/acuicultura/cultivos/_archivos/000000_Desarrollo%20del%20cultivo%20de%20peces%20ornamentales.pdf
6. Acuario Atlántida: catálogo de peces de agua dulce (consultado el 28/09/2026). https://www.acuarioatlantida.com.ar/agua-dulce/peces-agua-dulce/
7. Acuarios Plantados: catálogo de peces (consultado el 28/09/2026). https://acuariosplantados.com.ar/categoria-producto/vivos/peces/
8. Aqua Bahía: catálogo de peces (consultado el 28/09/2026). https://www.aquabahia.com.ar/peces/
9. Acuario ICE: catálogo de peces (consultado el 28/09/2026). https://acuarioice.com/peces/
10. MercadoLibre Argentina, peces vivos: no accesible (verificación de cuenta / 403). https://listado.mercadolibre.com.ar/animales-mascotas/peces/peces-vivos
11. Primera Edición (Misiones), nota con fuente en la UNaM: Peces del río Paraná, *Cichlasoma dimerus*. https://www.primeraedicion.com.ar/nota/100747630/peces-del-rio-parana-cichlasoma-dimerus/
12. Gómez, S. E. (2014): peces nativos argentinos de interés ornamental. AquaTIC 41 (MACN-CONICET). https://seacuicultura.es/images/aquatic-pdf/41_1.pdf
13. CRoA (Círculo Rosarino de Acuaristas): El acuario de cíclidos africanos. https://www.croa.com.ar/el-acuario-de-ciclidos-africanos/
14. CRoA: guía del acuarista. https://www.croa.com.ar/guia-acuarista/
15. FishBase: *Xiphophorus hellerii*. https://www.fishbase.se/summary/Xiphophorus-hellerii.html
16. FishBase: *Danio rerio*. https://www.fishbase.se/summary/Danio-rerio.html
17. FishBase: *Betta splendens*. https://www.fishbase.se/summary/Betta-splendens.html
18. FishBase: *Gymnocorymbus ternetzi*. https://www.fishbase.se/summary/Gymnocorymbus-ternetzi.html
19. FishBase: *Paracheirodon axelrodi*. https://www.fishbase.se/summary/Paracheirodon-axelrodi.html
20. FishBase: *Pterophyllum scalare*. https://www.fishbase.se/summary/Pterophyllum-scalare.html
21. FishBase: *Puntigrus tetrazona*. https://www.fishbase.se/summary/Puntigrus-tetrazona.html
22. FishBase: *Corydoras paleatus*. https://www.fishbase.se/summary/Corydoras-paleatus.html
23. FishBase: *Otocinclus vestitus*. https://www.fishbase.se/summary/Otocinclus-vestitus.html
24. FishBase: *Otocinclus affinis*. https://www.fishbase.se/summary/Otocinclus-affinis.html
25. FishBase: *Ancistrus cirrhosus*. https://www.fishbase.se/summary/Ancistrus-cirrhosus.html
26. FishBase: *Symphysodon aequifasciatus*. https://www.fishbase.se/summary/Symphysodon-aequifasciatus.html
27. FishBase: *Trichopodus trichopterus*. https://www.fishbase.se/summary/Trichopodus-trichopterus.html
28. FishBase: *Cichlasoma dimerus*. https://www.fishbase.se/summary/Cichlasoma-dimerus.html
29. FishBase: *Australoheros facetus*. https://www.fishbase.se/summary/Australoheros-facetus.html
30. FishBase: *Apistogramma borellii*. https://www.fishbase.se/summary/Apistogramma-borellii.html
31. FishBase: *Aphyocharax anisitsi*. https://www.fishbase.se/summary/Aphyocharax-anisitsi.html
32. FishBase: *Hypostomus commersoni*. https://www.fishbase.se/summary/Hypostomus-commersoni.html
33. FishBase: *Pyrrhulina australis*. https://www.fishbase.se/summary/Pyrrhulina-australis.html
34. FishBase: *Otocinclus arnoldi*. https://www.fishbase.se/summary/Otocinclus-arnoldi.html
35. Seriously Fish: *Xiphophorus hellerii*. https://www.seriouslyfish.com/species/xiphophorus-hellerii/
36. Seriously Fish: *Danio rerio*. https://www.seriouslyfish.com/species/danio-rerio/
37. Seriously Fish: *Betta splendens*. https://www.seriouslyfish.com/species/betta-splendens/
38. Seriously Fish: *Gymnocorymbus ternetzi*. https://www.seriouslyfish.com/species/gymnocorymbus-ternetzi/
39. Seriously Fish: *Paracheirodon axelrodi*. https://www.seriouslyfish.com/species/paracheirodon-axelrodi/
40. Seriously Fish: *Pterophyllum scalare*. https://www.seriouslyfish.com/species/pterophyllum-scalare/
41. Seriously Fish: *Puntigrus tetrazona*. https://www.seriouslyfish.com/species/puntigrus-tetrazona/
42. Seriously Fish: *Corydoras paleatus*. https://www.seriouslyfish.com/species/corydoras-paleatus/
43. Seriously Fish: *Otocinclus macrospilus*. https://www.seriouslyfish.com/species/otocinclus-macrospilus/
44. Seriously Fish: *Ancistrus* cf. *cirrhosus*. https://www.seriouslyfish.com/species/ancistrus-cf-cirrhosus/
45. Seriously Fish: *Symphysodon aequifasciatus*. https://www.seriouslyfish.com/species/symphysodon-aequifasciatus/
46. Seriously Fish: *Trichopodus trichopterus*. https://www.seriouslyfish.com/species/trichopodus-trichopterus/
47. Yanar et al. (2019): Thermal tolerance of thirteen popular ornamental fish species (resumen). https://avesis.cu.edu.tr/yayin/4b106d62-7ebd-43cc-a345-cf60ab55cac8/thermal-tolerance-of-thirteen-popular-ornamental-fish-species
48. Yanar et al. (2023), Turkish Journal of Fisheries and Aquatic Sciences: tolerancia térmica (CTmín y CTmáx) de peces ornamentales. https://www.trjfas.org/pdf.php?id=14952
49. Özdeş et al.: tolerancia térmica de *X. hellerii* según la temperatura de aclimatación (Ege J. Fish. Aquat. Sci.). http://www.egejfas.org/tr/pub/article/809511
50. Canadian Journal of Zoology (2025), doi 10.1139/cjz-2025-0030: tolerancia al frío crónico de peces ornamentales tropicales. https://cdnsciencepub.com/doi/10.1139/cjz-2025-0030
51. Acta Amazonica 38(4): tolerancia del tetra cardenal a la temperatura, el pH, el amoníaco y el nitrito. https://acta.inpa.gov.br/fasciculos/38-4/BODY/v38n4a23.html
52. UF/IFAS FA096: nutrición de peces ornamentales. https://ask.ifas.ufl.edu/publication/FA096
53. AquariumScience.org: cantidad de alimento en detalle. https://aquariumscience.org/3-3-1-amount-in-depth/
54. Sirimanna et al.: alimentación de peces ornamentales (Int. J. Aquatic Biology). http://ij-aquaticbiology.com/index.php/ijab/article/download/570/505/1904
55. Revisión sobre nutrición y alimentación de peces ornamentales (Vingnanam Journal). https://vingnanam.sljol.info/articles/4257/files/693c219a931a9.pdf
56. The Fish Site: How big are your fish pellets? https://thefishsite.com/articles/how-big-are-your-fish-pellets
57. Aquarium Co-Op: pellet Xtreme Nano de 0,5 mm. https://www.aquariumcoop.com/products/xtreme-nano-0-5mm-pellet
58. Guía de alimentación de BioMar (tamaños y masas de pellet). https://www.naturewater.ru/upload/iblock/10a/10ac1373d93147007daf983dd9276c25.pdf
59. Hikari: Micro Pellets (indicación de 6 pellets por toma). https://hikariusa.com/tropical_folder/micro_pellets.html
60. RSPCA: ambiente para peces (regla de litros por cm de pez). https://www.rspca.org.uk/adviceandwelfare/pets/fish/environment
61. Rusydi (2018): correlación entre conductividad y TDS (IOP Conf. Ser. Earth Environ. Sci. 118). https://iopscience.iop.org/article/10.1088/1755-1315/118/1/012019/pdf

*Nota metodológica:* documento generado con `/workspace/aquafeed/gen_comunes.py` el 28/09/2026 (hora de Buenos Aires). Todo lo marcado [ESTIMACIÓN] es cálculo propio; [sugerencia de diseño] son umbrales de ingeniería para AquaFeed, no datos biológicos publicados.
