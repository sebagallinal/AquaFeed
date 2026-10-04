# AquaFeed — Fichas técnicas de especies de agua fría (y templada-fría) para el alimentador automático

Tesis de Horacio Vespoli: alimentador con ESP32, motor paso a paso 28BYJ-48 y sensores de pH, temperatura y TDS, controlado desde una app Angular por MQTT.  
Documento armado el 28/09/2026 (hora de Buenos Aires); **actualizado el 28/09/2026 para que la cantidad de pellets sea el dato principal** (decisión de dosificar por pellet, ver Convenciones). Todos los valores tienen su fuente con URL (entre corchetes, numeradas; la lista completa está al final).

## Convenciones

- **% PV/día** = porcentaje del peso vivo (biomasa) que se da como alimento seco por día.
- **[ESTIMACIÓN]** marca todo lo que se calculó o extrapoló (no es un dato directo de la fuente). Se explica cómo se calculó.
- **Temperatura recomendada** = un solo valor objetivo en °C para usar como valor por defecto en la app (pedido de Horacio). Normalmente es el **centro del rango óptimo** de la fuente, redondeado al grado, y por eso lleva **[ESTIMACIÓN]**.
- **Redondeo:** como el alimentador dosifica por pellet, las cantidades de pellets se redondean a pellets enteros (mínimo 1).
- **PENDIENTE** = no se encontró el dato en una fuente reconocida (en la versión anterior figuraba como "sin dato confiable").
- **Decisión de diseño de Horacio (28/09/2026): el alimentador dosifica POR PELLET.** Por eso, en todas las tablas de ración el **dato principal es la cantidad de pellets** (por toma y por día) junto con el tamaño de pellet de cada talla. Los gramos (g/día) quedan como dato secundario, útil para comparar con las tablas de las fuentes, que siempre vienen en % del peso vivo.
- Peso a partir de la talla: con la relación largo-peso bayesiana de FishBase, W(g) = a·L(cm)^b (largo total). Los valores de a y b figuran en cada ficha. **[ESTIMACIÓN]**: es el peso promedio de la especie; los goldfish "fancy" de cuerpo redondo pesan más que un goldfish común del mismo largo.
- Ración en gramos: g/día = peso del pez × % PV / 100. Para un grupo, se multiplica por la cantidad de peces (o se usa la biomasa total del tanque).

### Peso de un pellet y conversión a cantidad de pellets

- Dato de fábrica (BioMar INICIO Plus, alimento de trucha, extrusado): pellets por kg ≈ 5 470 000 (0,5 mm), 2 190 000 (0,8 mm), 905 000 (1,1 mm), 325 000 (1,5 mm) y 138 000 (2 mm), con ±10 % según el lote [[13]](https://www.naturewater.ru/upload/iblock/10a/10ac1373d93147007daf983dd9276c25.pdf) [[14]](https://aquafeed-biomar.ro/wp-content/uploads/2024/01/en-dk-inicio-702-2-mm-trout.pdf). Eso da un peso por pellet de ≈ 0,18 / 0,46 / 1,1 / 3,1 / 7,2 mg.
- Para pellets de más de 2 mm no se encontró el dato de fábrica. **[ESTIMACIÓN]** Se supone un pellet cilíndrico con largo ≈ diámetro y la misma densidad que el de 2 mm: masa (mg) ≈ 0,906 × d³ (d en mm). El modelo reproduce bien el dato de BioMar para 1,5 mm (3,06 frente a 3,08 mg) y 0,8 mm (0,46 mg). Con eso: 2,4 mm ≈ 12,5 mg; 2,7 mm ≈ 17,8 mg; 3,2 mm ≈ 29,7 mg; 4 mm ≈ 58 mg; 4,8 mm ≈ 100 mg; 5 mm ≈ 113 mg; 6,4 mm ≈ 238 mg.
- Límites: los alimentos **flotantes** para goldfish y koi están más expandidos y son menos densos que un pellet de trucha que se hunde, así que pesan menos por pellet. Los pellets también pueden ser más largos que su diámetro. Por eso la cantidad real de pellets puede apartarse bastante del cálculo. **Consecuencia para la dosificación por pellet:** las cantidades de pellets de este documento se calcularon así: pellets = g/día ÷ peso de un pellet. Si el alimento real pesa distinto por pellet, la cantidad correcta cambia en la misma proporción. **Recomendación práctica [sugerencia de diseño]:** pesar 100 pellets de la marca que se use (balanza de 0,01 g) para recalcular la cantidad de pellets a partir de la ración en gramos, y verificar que el mecanismo del 28BYJ-48 entregue efectivamente un pellet (o un número conocido de pellets) por ciclo. *Esta recomendación reemplaza la de la versión anterior, que proponía dosificar por gramos.*

### TDS, conductividad y dureza

- La relación TDS/EC no es fija: depende de la composición iónica del agua. En aguas naturales TDS (mg/L) ≈ 0,55–0,75 × EC (µS/cm) [[42]](https://iopscience.iop.org/article/10.1088/1755-1315/118/1/012019/pdf), y se suele usar 0,65 como factor por defecto [[43]](https://scielo.org.za/scielo.php?pid=S1816-79502015000400008&script=sci_arttext). El rango 0,5–0,7 que usan muchos medidores de TDS queda dentro de esto. Los medidores de TDS baratos miden EC y multiplican por un factor fijo (a menudo 0,5 o 0,7), así que conviene registrar también la EC cruda.
- **La dureza no es TDS.** La dureza (en mg/L como CaCO₃ o en °dH) mide solo calcio y magnesio. El TDS incluye todos los iones disueltos (sodio, cloruros, sulfatos, bicarbonatos, etc.), así que para un mismo agua el TDS es normalmente mayor que la dureza expresada en mg/L. No hay una conversión exacta entre las dos. Conversión estándar de unidades de dureza: 1 °dH ≈ 17,8 mg/L como CaCO₃.
- Para casi ninguna de estas especies hay un **rango de TDS** publicado en las fuentes consultadas. Lo que hay es dureza, alcalinidad o salinidad. En cada ficha se aclara.

## 1. Peces de agua fría más comunes en Argentina

Contexto: la acuicultura argentina produjo 12 175 t en 2024. La trucha arcoíris fue el 86,99 % (10 591 t) y se cultiva sobre todo en jaulas en los embalses Alicurá y Piedra del Águila (río Limay, Neuquén y Río Negro) [[36]](https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Producci%C3%B3n%20Acu%C3%ADcola%20Argentina%202024.pdf). Las primeras introducciones oficiales de salmónidos en la Patagonia fueron en 1904, con dos estaciones de piscicultura (Nahuel Huapi, 1904–1931, y río Santa Cruz, 1904–1913). El objetivo era aumentar la diversidad de la fauna de peces y crear pesquerías de valor deportivo y económico [[34]](https://www.scielo.org.ar/scielo.php?pid=S1667-782X2014000200005&script=sci_arttext&tlng=en). En ornamentales de agua fría, la cría local de *Carassius auratus* y *Cyprinus carpio* (koi) alcanza para abastecer el mercado interno [[39]](https://sedici.unlp.edu.ar/handle/10915/150955), y *C. auratus* está entre los peces ornamentales de agua dulce que más exporta Argentina (a Chile) [[38]](https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Importaciones%20y%20exportaciones%20de%20organismos%20ornamentales%202024.pdf).

| Grupo | Nombre común (AR) | Nombre científico | Origen | Región / uso en Argentina | ¿Sirve para un alimentador automático? | Fuentes |
|---|---|---|---|---|---|---|
| Acuicultura | Trucha arcoíris | *Oncorhynchus mykiss* | Introducida. Nativa de las cuencas del Pacífico de Norteamérica (Alaska a México). En la Patagonia desde 1904 (el grueso de las especies se trajo entre 1904 y 1910) para pesca deportiva y comercial. Desde los años 70 se importaron variedades comerciales para acuicultura | Neuquén y Río Negro (embalses Alicurá y Piedra del Águila, más del 95 % en jaulas). Hatcheries en Junín de los Andes, Aluminé, Bariloche y El Bolsón. También hay truchas silvestres en la Patagonia (pesca deportiva) | **Sí** (tanque o estanque; en acuario solo alevines). Ficha completa | [[1]](https://www.fao.org/fishery/en/culturedspecies/oncorhynchus_mykiss/en) [[34]](https://www.scielo.org.ar/scielo.php?pid=S1667-782X2014000200005&script=sci_arttext&tlng=en) [[36]](https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Producci%C3%B3n%20Acu%C3%ADcola%20Argentina%202024.pdf) [[37]](https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_An%C3%A1lisis%20de%20la%20producci%C3%B3n%20de%20trucha%20en%20Patagonia%20norte.pdf) |
| Acuicultura (templada-fría) | Pejerrey (bonaerense) | *Odontesthes bonariensis* | **Nativo** (región pampeana y Río de la Plata) | Cría experimental y para siembra en la Estación Hidrobiológica Chascomús y el INTECH (CONICET-UNSAM). No figura en la tabla de producción comercial 2024 del MAGyP. Muy importante en la pesca deportiva | **Sí, con reservas** (estanque; su óptimo es templado, 17–24 °C). Ficha completa | [[25]](https://www.fishbase.se/summary/Odontesthes-bonariensis.html) [[31]](https://revistas.unlp.edu.ar/bacuatica/article/download/16102/16121/71729) [[36]](https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Producci%C3%B3n%20Acu%C3%ADcola%20Argentina%202024.pdf) |
| Acuicultura (histórica / sin producción comercial) | Salmón del Atlántico | *Salmo salar* | Introducido. Nativo del Atlántico Norte (Portugal a Rusia; Cape Cod a Labrador). Se sembró en la Patagonia desde 1904–1910; se estableció en pocas cuencas (30,4 %) | No aparece en la producción acuícola argentina 2024 | Sí, como especie de referencia para salmónidos (tanque de agua dulce en etapa juvenil). Ficha completa | [[2]](https://www.fao.org/fishery/en/culturedspecies/salmo_salar/en) [[34]](https://www.scielo.org.ar/scielo.php?pid=S1667-782X2014000200005&script=sci_arttext&tlng=en) [[36]](https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Producci%C3%B3n%20Acu%C3%ADcola%20Argentina%202024.pdf) |
| Acuario / ornamental | Goldfish, pez dorado, "carasius" | *Carassius auratus* | Introducido. Nativo de Asia oriental (China y Japón). Llegó a fines del siglo XIX por iniciativa privada [[41]](http://aquaticcommons.org/1705/1/Inf.Tec.AC2.pdf) o a principios del siglo XX con inmigrantes europeos [[39]](https://sedici.unlp.edu.ar/handle/10915/150955) (las fuentes no coinciden en la fecha exacta) | Acuarios y estanques de todo el país. Cría en Córdoba, Buenos Aires, Mendoza, Santa Fe, Corrientes y Misiones | **Sí** (el caso más típico de acuario de agua fría). Ficha completa | [[22]](https://www.fishbase.se/summary/Carassius-auratus.html) [[5]](https://extension.rwfm.tamu.edu/wp-content/uploads/sites/8/2013/09/SRAC-Publication-No.-7201-Species-Profile-Koi-and-Goldfish.pdf) [[39]](https://sedici.unlp.edu.ar/handle/10915/150955) [[38]](https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Importaciones%20y%20exportaciones%20de%20organismos%20ornamentales%202024.pdf) |
| Acuario / estanque ornamental | Koi, carpa koi | *Cyprinus carpio* (variedad ornamental) | Introducida. La carpa común es nativa de Eurasia (cuencas de los mares Negro, Caspio y Aral). La carpa se aclimató en Entre Ríos en la segunda mitad del siglo XIX, traída desde Brasil con fines ornamentales y de acuicultura; la introducción oficial fue en 1925 (estanques públicos de Buenos Aires). Las variedades ornamentales llegaron junto con la carpa | Estanques de jardín en todo el país. La carpa común está asilvestrada y es invasora | **Sí** (estanque). Ficha completa | [[23]](https://www.fishbase.se/summary/Cyprinus-carpio.html) [[5]](https://extension.rwfm.tamu.edu/wp-content/uploads/sites/8/2013/09/SRAC-Publication-No.-7201-Species-Profile-Koi-and-Goldfish.pdf) [[40]](http://sedici.unlp.edu.ar/bitstream/handle/10915/151187/Documento_completo.pdf?sequence=1) [[41]](http://aquaticcommons.org/1705/1/Inf.Tec.AC2.pdf) [[39]](https://sedici.unlp.edu.ar/handle/10915/150955) |
| Acuario (agua fría) | Pez de las nubes blancas, "white cloud" | *Tanichthys albonubes* | Introducido. Nativo del sur de China y de Vietnam | En el comercio acuarista. **PENDIENTE**: no se encontró cuán común es en Argentina ni de cuándo llegó | **Sí** (acuario sin calefactor). Ficha completa | [[24]](https://www.fishbase.se/summary/Tanichthys-albonubes.html) [[18]](https://seriouslyfish.com/species/tanichthys-albonubes) |
| Nativos / introducidos de aguas frías | Trucha marrón | *Salmo trutta* | Introducida. Nativa de Europa y Asia occidental (cuencas del Atlántico, mar del Norte, mar Blanco y Báltico). En la Patagonia desde 1904–1910 para pesca deportiva y comercial. Hoy está presente en el 97 % de las cuencas lacustres donde se sembró | Ríos y lagos patagónicos (pesca deportiva) | Sí, en estanque (en la práctica se alimenta igual que la arcoíris). Ficha completa | [[20]](https://www.fishbase.se/summary/Salmo-trutta.html) [[34]](https://www.scielo.org.ar/scielo.php?pid=S1667-782X2014000200005&script=sci_arttext&tlng=en) |
| Nativos / introducidos de aguas frías | Trucha de arroyo | *Salvelinus fontinalis* | Introducida. Nativa del este de Canadá y del noreste de EE. UU. Desde 1904–1910; hasta los años 40 estaba en todas las cuencas de los ríos Negro, Limay y Chubut. Hoy solo en las cabeceras | Cabeceras de ríos patagónicos (pesca deportiva) | Poco relevante: no hay cultivo comercial según las fuentes consultadas. **No se hizo ficha** | [[29]](https://www.fishbase.se/summary/Salvelinus-fontinalis.html) [[34]](https://www.scielo.org.ar/scielo.php?pid=S1667-782X2014000200005&script=sci_arttext&tlng=en) |
| Nativos / introducidos de aguas frías | Salmón chinook (rey) | *Oncorhynchus tshawytscha* | Introducido. Nativo del Pacífico Norte (Alaska a California; Japón). Hubo introducciones puntuales desde Argentina. Su distribución actual se explica sobre todo por escapes de pisciculturas chilenas y por ranching en los años 70–80 | Ríos patagónicos de las vertientes Pacífica y Atlántica | No (especie silvestre o invasora, sin cultivo en Argentina). Sin ficha | [[30]](https://www.fishbase.se/summary/Oncorhynchus-tshawytscha.html) [[34]](https://www.scielo.org.ar/scielo.php?pid=S1667-782X2014000200005&script=sci_arttext&tlng=en) |
| Nativos de aguas frías | Perca criolla (trucha criolla) | *Percichthys trucha* | **Nativa** | Lago Colhué Huapi, sistemas de los ríos Chubut, Negro, Limay y Colorado-Desaguadero. Pesca deportiva. En 1942 se creó una estación de piscicultura en el río Limay dedicada en gran parte a distribuirla | No: no hay alimento balanceado ni protocolo de cultivo comercial en las fuentes consultadas. Sin ficha | [[27]](https://www.fishbase.se/summary/Percichthys-trucha.html) [[34]](https://www.scielo.org.ar/scielo.php?pid=S1667-782X2014000200005&script=sci_arttext&tlng=en) |
| Nativos de aguas frías | Pejerrey patagónico | *Odontesthes hatcheri* | **Nativo** | Lagos y ríos patagónicos de Argentina y Chile. También se distribuyó desde la estación del río Limay (1942) | No (sin protocolo de cultivo con balanceado en las fuentes consultadas). Sin ficha | [[26]](https://www.fishbase.se/summary/Odontesthes-hatcheri.html) [[34]](https://www.scielo.org.ar/scielo.php?pid=S1667-782X2014000200005&script=sci_arttext&tlng=en) |
| Nativos de aguas frías | Puyen (puyén chico) | *Galaxias maculatus* | **Nativo** | Lagos andino-patagónicos (Meliquina, Traful, Nahuel Huapi, entre otros). Es la presa principal de los salmónidos | No (pez forrajero, sin cultivo). Sin ficha | [[28]](https://www.fishbase.se/summary/Galaxias-maculatus.html) [[35]](https://exa.ai/library/publication/j1lr106chjj) |

## 2. Tabla resumen comparativa

Valores para el ajuste por defecto del alimentador. El detalle, las discrepancias y las fuentes de cada valor están en cada ficha. **Por decisión de diseño, el dato principal es la cantidad de pellets** (el alimentador dosifica por pellet); los gramos quedan como dato secundario en la última columna. Las cantidades corresponden a **un pez de talla media** a temperatura óptima y son **[ESTIMACIÓN]** (peso de FishBase × % PV de la fuente ÷ peso del pellet de BioMar o del modelo de Convenciones).

| Especie | Origen | **Temp. recomendada (°C)** | **Pellets/día por pez [ESTIM.]** | **Pellets por toma [ESTIM.]** | Tamaño de pellet | Tomas/día | Talla de referencia | Temp. óptima (°C) | pH óptimo (tolerable) | TDS / conductividad | Ración (% PV/día) | g/día por pez (secundario) [ESTIM.] |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Trucha arcoíris | Introducida (Pacífico de N. América) | **14** [ESTIM.] | **≈ 28** | **14–28** (en 1-2 tomas) | 4,0 mm | 1-2 | 20 cm (≈ 81,7 g), 15 °C | 12–14 (Irlanda) a 12,8–18,3; FAO: <21 | 6,5–8,5 (6,0–9,0) | PENDIENTE (TDS); alcalinidad 10–400 mg/L CaCO₃ | 0,5–1,8 (mantenimiento en frío) a 1,5–6+ (óptimo), según talla | 1,63 |
| Trucha marrón | Introducida (Europa y Asia occ.) | **14** [ESTIM.] | **≈ 25** | **12–25** (en 1-2 tomas) | 4,0 mm | 1-2 (tabla de la arcoíris) | 20 cm (≈ 76,2 g), 13 °C | 8–17; máximo crecimiento 13–14 (invertebrados) y 11,6–19,1 (pellet) | ≈ igual que la arcoíris (6,0–9,0) | PENDIENTE | Sin tabla propia; se usa la de la arcoíris [supuesto] | 1,45 |
| Salmón del Atlántico (agua dulce) | Introducido (Atlántico Norte) | **14** [ESTIM.] | **≈ 24** | **≈ 8** (en 3 tomas [ESTIM.]; la fuente usa alimentación continua) | 2,5 mm | 3 [ESTIM., tabla de trucha para 20 g] | ≈ 12 cm (20 g) | 12–15 (Irlanda); crecimiento máximo 15,9–20 (juveniles) | 6,0–8,5 (>5,4) | PENDIENTE | 4,3 (0,2 g) → 1,1 (≈ 90 g) | 0,340 |
| Goldfish | Introducido (Asia oriental) | **21** [ESTIM.] | **≈ 120** | **≈ 31** (en 4 tomas) | 1,5 mm | 4 (dato experimental, juveniles) | 10 cm (≈ 12,6 g), 20–24 °C | 18–24 | ≈ 7 (5–9) | PENDIENTE (TDS); dureza 5–19 °dH (≈ 90–340 mg/L CaCO₃) | 3 (juveniles, dato experimental) | 0,378 |
| Koi | Introducida (Eurasia) | **21** [ESTIM.] | **≈ 43** | **≈ 11** (en 4 tomas [ESTIM.]) | 5 mm | 3–4 [ESTIM.] (la fuente dice "varias por día") | 20 cm (≈ 122,5 g), 20–23 °C | 18–24 | ≈ 7 (5–9; FishBase 6,5–9,0) | PENDIENTE (TDS); dureza 10–15 °dH | 1,5–19 según talla y temperatura (tabla FAO para carpa) | 4,90 |
| Pez de las nubes blancas | Introducido (sur de China y Vietnam) | **20** [ESTIM.] | **≈ 80** [muy estimado] | **≈ 40** (en 2 tomas [ESTIM.]) | 0,5 mm | PENDIENTE (se asumen 2) | 3,5 cm (≈ 0,485 g) | 14–22 (18–22 según FishBase) | 6,0–8,0/8,5 | PENDIENTE (TDS); dureza 90–357 mg/L | PENDIENTE (se estima 2–3 %) | 0,0145 [muy estimado] |
| Pejerrey | **Nativo** | **21** [ESTIM.] | **≈ 130** [ESTIM.] | **≈ 22** (en 6 tomas) | 1,5 mm [ESTIM.] | 6 (juveniles) | 10 cm (≈ 5,89 g), cálido | 17–24 | PENDIENTE | Tolera agua salobre: mejor crecimiento con 5–20 g/L de salinidad (≈ 5 000–20 000 mg/L) | 5 (frío) a 7 (cálido), en jaulas con zooplancton | 0,412 |

Nota: el ambiente recomendado (acuario, estanque o no apta para acuario doméstico, litros mínimos y compañía) de estas 7 especies está en el archivo aparte `ambiente-especies-agua-fria.md`.

## 3. Fichas por especie

### 3.1 Trucha arcoíris — *Oncorhynchus mykiss*

**Origen:** introducida en Argentina. Nativa de las cuencas del Pacífico de Norteamérica, de Alaska a México [[1]](https://www.fao.org/fishery/en/culturedspecies/oncorhynchus_mykiss/en). En la Patagonia desde 1904 (las introducciones se concentraron entre 1904 y 1910) para crear pesquerías deportivas y comerciales. Es la especie más sembrada (96,4 % de las cuencas y subcuencas). Desde los años 70 se importaron variedades comerciales para acuicultura [[34]](https://www.scielo.org.ar/scielo.php?pid=S1667-782X2014000200005&script=sci_arttext&tlng=en). Hoy es la especie principal de la acuicultura argentina [[36]](https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Producci%C3%B3n%20Acu%C3%ADcola%20Argentina%202024.pdf).

**Temperatura recomendada (valor por defecto en la app): 14 °C** [ESTIMACIÓN: punto medio entre el centro del óptimo irlandés 12–14 °C (13 °C) y el de SRAC 12,8–18,3 °C (15,5 °C); queda dentro de ambos rangos y del criterio FAO de < 21 °C] [[10]](https://www.fishhealth.ie/fhu/sites/default/files/FHU_Files/Documents/Chapter%20III%20Environment%20Vr%202.0.pdf) [[4]](https://srac.msstate.edu/pdfs/Fact%20Sheets/223%20Trout%20Production-%20Feeds%20and%20Feeding%20Methods.pdf) [[1]](https://www.fao.org/fishery/en/culturedspecies/oncorhynchus_mykiss/en).


**Temperatura (°C)**

| Parámetro | Valor | Fuente |
|---|---|---|
| Óptima para crecer | 12–14 (Irlanda) | [[10]](https://www.fishhealth.ie/fhu/sites/default/files/FHU_Files/Documents/Chapter%20III%20Environment%20Vr%202.0.pdf) |
| Óptima para crecer | 55–65 °F = 12,8–18,3 °C (con ración máxima) | [[4]](https://srac.msstate.edu/pdfs/Fact%20Sheets/223%20Trout%20Production-%20Feeds%20and%20Feeding%20Methods.pdf) |
| Óptima (FAO) | "debajo de 21 °C"; crecimiento y desove en 9–14 °C; criterio de sitio 12–21 °C | [[1]](https://www.fao.org/fishery/en/culturedspecies/oncorhynchus_mykiss/en) |
| Crecimiento (otras referencias) | 10–15 (Sedgwick), 10–16 (Stevenson), 10–22 (Barton), 9–16 (Brannon), recopiladas | [[6]](http://www.sjrdotmdl.org/concept_model/bio-effects_model/documents/Molony2001.pdf) |
| Tolerable | 0–27 (FAO); 0–22 con agua bien oxigenada (Irlanda); supervivencia ≈ 0–29,8 según cepa y aclimatación | [[1]](https://www.fao.org/fishery/en/culturedspecies/oncorhynchus_mykiss/en) [[10]](https://www.fishhealth.ie/fhu/sites/default/files/FHU_Files/Documents/Chapter%20III%20Environment%20Vr%202.0.pdf) [[6]](http://www.sjrdotmdl.org/concept_model/bio-effects_model/documents/Molony2001.pdf) |
| Mínima para crecer | ≈ 38 °F = 3,3 °C | [[4]](https://srac.msstate.edu/pdfs/Fact%20Sheets/223%20Trout%20Production-%20Feeds%20and%20Feeding%20Methods.pdf) |
| Letal / crítica alta | CTM ≈ 24–26 °C; letal >25–27 (Sedgwick), >25 (Stevenson), >26,5 (Barton), <26 para sobrevivir (Brannon); letal "por encima de 24 °C" (Irlanda) | [[6]](http://www.sjrdotmdl.org/concept_model/bio-effects_model/documents/Molony2001.pdf) [[10]](https://www.fishhealth.ie/fhu/sites/default/files/FHU_Files/Documents/Chapter%20III%20Environment%20Vr%202.0.pdf) |
| Letal / crítica baja | CTmín ≈ 1–2 °C; letal inferior ≈ −1 °C | [[6]](http://www.sjrdotmdl.org/concept_model/bio-effects_model/documents/Molony2001.pdf) [[10]](https://www.fishhealth.ie/fhu/sites/default/files/FHU_Files/Documents/Chapter%20III%20Environment%20Vr%202.0.pdf) |
| Cambios bruscos | máximo recomendado 0,5 °C/min para cambios de más de 5 °C | [[6]](http://www.sjrdotmdl.org/concept_model/bio-effects_model/documents/Molony2001.pdf) |

*Discrepancia:* el óptimo varía entre 12–14 °C (Irlanda) y hasta 18 °C (SRAC, EE. UU.). FAO da un criterio de sitio más amplio (12–21 °C). El límite letal alto cambia con la cepa y la aclimatación (24–27 °C).

**pH:** óptimo 6,5–8,5 como criterio de sitio (FAO) [[1]](https://www.fao.org/fishery/en/culturedspecies/oncorhynchus_mykiss/en). Para crecer: 7,0–8,0 (Wedemeyer), 6,5–8,0 (Barton), 6,7–8,5 (Brannon). Tolerable para sobrevivir: 6,0–9,0 (Wedemeyer) [[6]](http://www.sjrdotmdl.org/concept_model/bio-effects_model/documents/Molony2001.pdf). Un pH mayor que 9 puede matar salmónidos, sobre todo en huevos y alevines [[6]](http://www.sjrdotmdl.org/concept_model/bio-effects_model/documents/Molony2001.pdf). Irlanda recomienda evitar pH <5,0 y >9,0 en truchas [[10]](https://www.fishhealth.ie/fhu/sites/default/files/FHU_Files/Documents/Chapter%20III%20Environment%20Vr%202.0.pdf).

**TDS / conductividad:** PENDIENTE (TDS). Lo que dan las fuentes: alcalinidad 10–400 mg/L como CaCO₃ (FAO) [[1]](https://www.fao.org/fishery/en/culturedspecies/oncorhynchus_mykiss/en); calcio o dureza >150 (Sedgwick), 10–400 (Barton), 50–200 para sobrevivir (Wedemeyer), >50 como óptimo y 4–160 para sobrevivir (Brannon), en mg/L [[6]](http://www.sjrdotmdl.org/concept_model/bio-effects_model/documents/Molony2001.pdf). La alcalinidad y la dureza no se pueden convertir directamente a TDS (ver Convenciones).

**Oxígeno disuelto (contexto):** cerca de la saturación (FAO) [[1]](https://www.fao.org/fishery/en/culturedspecies/oncorhynchus_mykiss/en); >7 mg/L (Wedemeyer y Brannon); por debajo de ≈ 5–6 mg/L puede haber mortalidad; >5 mg/L para buen crecimiento de truchas chicas [[6]](http://www.sjrdotmdl.org/concept_model/bio-effects_model/documents/Molony2001.pdf). Por debajo del 80 % de saturación bajan el crecimiento y el apetito, y la mortalidad empieza cerca del 40 % [[10]](https://www.fishhealth.ie/fhu/sites/default/files/FHU_Files/Documents/Chapter%20III%20Environment%20Vr%202.0.pdf).

**Alimentación**

- Alimento: balanceado extrusado. Alevines y juveniles: ≈ 50 % de proteína y 15–20 % de grasa; peces grandes: 38–45 % de proteína y 10–18 % de grasa [[4]](https://srac.msstate.edu/pdfs/Fact%20Sheets/223%20Trout%20Production-%20Feeds%20and%20Feeding%20Methods.pdf). FAO describe pellets extrusados de alta energía con conversión cercana a 1:1 [[1]](https://www.fao.org/fishery/en/culturedspecies/oncorhynchus_mykiss/en).
- Ración: 1,5 a 6+ % PV/día en el rango óptimo y 0,5–1,8 % PV/día (mantenimiento) cerca de la temperatura mínima, según la talla [[4]](https://srac.msstate.edu/pdfs/Fact%20Sheets/223%20Trout%20Production-%20Feeds%20and%20Feeding%20Methods.pdf). Una tabla de NRC (1981) adaptada por FAO, en °C, da valores parecidos (por ejemplo, 0,77 g: 3,3 % a 7 °C y 6,1 % a 15 °C; 100 g: 1,2 % a 7 °C y 2,0 % a 15 °C) [[12]](https://www.fao.org/3/S4314E/s4314e0s.htm).
- Tomas por día (SRAC, tabla 2): 8–10 (starter) → 8 → 6 → 4 → 3 → 2–3 → 1–2 → 1 a medida que el pez crece. Cerca de la saciedad, cada toma equivale a ≈ 1–2 % del peso [[4]](https://srac.msstate.edu/pdfs/Fact%20Sheets/223%20Trout%20Production-%20Feeds%20and%20Feeding%20Methods.pdf).
- **Cuándo suspender o restringir:** restringir la alimentación por debajo de 40 °F (4,4 °C) y por encima de 68 °F (20 °C). Arriba de 20 °C el pez digiere mal y el agua pierde calidad. Reducir o suspender si hay enfermedad; 24 h de ayuno antes de manipular y 3–4 días antes de transportar [[4]](https://srac.msstate.edu/pdfs/Fact%20Sheets/223%20Trout%20Production-%20Feeds%20and%20Feeding%20Methods.pdf).

**Tabla por temperatura y talla** — % PV/día de SRAC 223 (tabla 1, convertida de °F y peces/libra) [[4]](https://srac.msstate.edu/pdfs/Fact%20Sheets/223%20Trout%20Production-%20Feeds%20and%20Feeding%20Methods.pdf). Pellet: BioMar (≤2 mm) [[13]](https://www.naturewater.ru/upload/iblock/10a/10ac1373d93147007daf983dd9276c25.pdf) y SRAC/FAO para tallas mayores (3/32" = 2,4 mm; 1/8" = 3,2 mm; 5/32" = 4 mm; 3/16" = 4,8 mm) [[4]](https://srac.msstate.edu/pdfs/Fact%20Sheets/223%20Trout%20Production-%20Feeds%20and%20Feeding%20Methods.pdf) [[12]](https://www.fao.org/3/S4314E/s4314e0s.htm). Peso por talla con FishBase, a = 0,00933 y b = 3,03 [[19]](https://www.fishbase.se/summary/Oncorhynchus-mykiss.html). Los g/día son por pez y son **[ESTIMACIÓN]**.

**Cantidad de pellets (dato principal para el alimentador) [ESTIMACIÓN]** — a 15 °C y a 13 °C; los gramos van al final como dato secundario:

| Talla | Pellet (mm) | **Pellets por toma a 15 °C** | **Pellets/día a 15 °C** | **Pellets/día a 13 °C** | Peso/pellet (mg) | g/día a 15 °C (secundario) | g/día a 13 °C (secundario) |
|---|---|---|---|---|---|---|---|
| Alevín 5 cm | 1,1 | **11** (en 6 tomas) | **64** | **62** | 1,10 | 0,0710 | 0,0685 |
| Juvenil 10 cm | 1,5 | **44** (en 3 tomas) | **130** | **130** | 3,08 | 0,410 | 0,390 |
| Juvenil grande 20 cm | 4,0 | **14–28** (en 1-2 tomas) | **28** | **27** | 57,98 | 1,63 | 1,55 |
| Adulto (porción) 30 cm | 4,8 | **39** (en 1 toma) | **39** | **33** | 100,20 | 3,91 | 3,35 |

**Tabla de referencia en % PV y gramos (dato secundario, tal como lo da la fuente):**

| Talla (LT) | Peso estimado (g) | Pellet (mm) | Tomas/día | 4 °C: % PV → g/día | 7 °C: % PV → g/día | 10 °C: % PV → g/día | 13 °C: % PV → g/día | 15 °C: % PV → g/día | 18 °C: % PV → g/día |
|---|---|---|---|---|---|---|---|---|---|
| Alevín 5 cm | 1,22 | 1,1 | 6 | 3,4 % → 0,0416 g | 3,9 % → 0,0477 g | 4,6 % → 0,0563 g | 5,6 % → 0,0685 g | 5,8 % → 0,0710 g | 6,3 % → 0,0771 g |
| Juvenil 10 cm | 10,00 | 1,5 | 3 | 2,5 % → 0,250 g | 2,7 % → 0,270 g | 3,5 % → 0,350 g | 3,9 % → 0,390 g | 4,1 % → 0,410 g | 4,4 % → 0,440 g |
| Juvenil grande 20 cm | 81,7 | 4,0 | 1-2 | 1,0 % → 0,817 g | 1,1 % → 0,898 g | 1,5 % → 1,22 g | 1,9 % → 1,55 g | 2,0 % → 1,63 g | 2,0 % → 1,63 g |
| Adulto (porción) 30 cm | 279,0 | 4,8 | 1 | 0,5 % → 1,39 g | 0,7 % → 1,95 g | 1,0 % → 2,79 g | 1,2 % → 3,35 g | 1,4 % → 3,91 g | 1,4 % → 3,91 g |

Columnas de temperatura de la fuente (°F → °C): 38–41 °F ≈ 3,3–5 °C; 42–45 ≈ 5,6–7,2; 49–51 ≈ 9,4–10,6; 55–57 ≈ 12,8–13,9; 58–60 ≈ 14,4–15,6; 64–67 ≈ 17,8–19,4. Arriba de 20 °C: restringir. En 24 °C o más: suspender (zona crítica).

Tabla alternativa en °C (BioMar INICIO Plus, alevines hasta 50 g, kg de alimento por 100 kg de peces por día) [[13]](https://www.naturewater.ru/upload/iblock/10a/10ac1373d93147007daf983dd9276c25.pdf): 1–3 g → 0,93 (4 °C), 1,85 (8 °C), 2,63 (12 °C), 2,91 (16 °C), 2,22 (20 °C). 30–50 g → 0,53 (4 °C), 1,06 (8 °C), 1,50 (12 °C), 1,67 (16 °C), 1,27 (20 °C). *Discrepancia:* BioMar recomienda raciones más bajas que SRAC para peces chicos (por ejemplo, 1–3 g a 16 °C: 2,9 % frente a ≈ 5,4–5,8 % en SRAC) y marca el máximo en 16 °C con una baja a 20 °C. Es esperable, porque los alimentos modernos tienen más energía y cada fabricante calcula su propia tabla. **Para AquaFeed conviene usar la tabla del fabricante del alimento que se use, y la de SRAC como techo.**

**Cómo dividir la ración:** repartir los pellets/día en partes iguales entre las tomas de la tabla. SRAC sugiere tirar en 5–10 minutos más o menos el doble de pellets que peces, repetir cada 10 minutos hasta completar la toma y parar si baja la actividad [[4]](https://srac.msstate.edu/pdfs/Fact%20Sheets/223%20Trout%20Production-%20Feeds%20and%20Feeding%20Methods.pdf). Para el alimentador: varias "microdosis" por toma, separadas algunos minutos, en lugar de una sola descarga.

**Alertas sugeridas para AquaFeed** (umbrales tomados de las fuentes citadas arriba):

| Variable | Advertencia | Crítica |
|---|---|---|
| Temperatura | < 4,4 °C o > 20 °C (restringir la alimentación, SRAC) | ≤ 1 °C (CTmín) o ≥ 24 °C (letal según Irlanda; CTM 24–26) → suspender la alimentación |
| pH | fuera de 6,5–8,5 (criterio FAO) | < 6,0 o > 9,0 (límites de supervivencia, Wedemeyer; pH >9 letal para salmónidos) |
| TDS | sin umbral confiable para la especie. Sugerencia de diseño (no es dato de fuente): avisar ante cambios bruscos respecto de la línea de base del tanque | — |
| Oxígeno (si se agrega sensor) | < 7 mg/L o < 80 % de saturación | < 5 mg/L o ≤ 40 % de saturación |

### 3.2 Trucha marrón — *Salmo trutta*

**Origen:** introducida en Argentina. Nativa de Europa y Asia occidental (cuencas del Atlántico, mar del Norte, mar Blanco y Báltico, de España a Rusia) [[20]](https://www.fishbase.se/summary/Salmo-trutta.html). En la Patagonia desde 1904–1910 para pesca deportiva y comercial. Hoy está presente en el 97 % de las cuencas lacustres donde se sembró [[34]](https://www.scielo.org.ar/scielo.php?pid=S1667-782X2014000200005&script=sci_arttext&tlng=en).

**Temperatura recomendada (valor por defecto en la app): 14 °C** [ESTIMACIÓN: centro del óptimo de crecimiento con invertebrados 13,1–14,1 °C (13,6 °C), redondeado; está dentro del óptimo con pellets 11,6–19,1 °C y del rango 8–17 °C de Barton] [[8]](http://docs.gip-ecofor.org/libre/Elliott_temperature_2010.pdf) [[6]](http://www.sjrdotmdl.org/concept_model/bio-effects_model/documents/Molony2001.pdf).


| Parámetro | Valor | Fuente |
|---|---|---|
| Temperatura óptima | 8–17 °C (Barton) | [[6]](http://www.sjrdotmdl.org/concept_model/bio-effects_model/documents/Molony2001.pdf) |
| Óptima para crecer (ración máxima) | 13,1–14,1 °C con invertebrados; 16,6–17,4 °C si come peces; 11,6–19,1 °C con pellets | [[8]](http://docs.gip-ecofor.org/libre/Elliott_temperature_2010.pdf) |
| Límites de crecimiento | inferior 1,2–6,1 y superior 19,4–26,8 °C (con pellets) | [[8]](http://docs.gip-ecofor.org/libre/Elliott_temperature_2010.pdf) |
| Límites para alimentarse (parr y smolt) | inferior 0,4–4 °C y superior 19–26 °C | [[8]](http://docs.gip-ecofor.org/libre/Elliott_temperature_2010.pdf) |
| Letal (parr y smolt) | incipiente 22–25 °C; última 26–30 °C; inferior 0–0,7 °C | [[8]](http://docs.gip-ecofor.org/libre/Elliott_temperature_2010.pdf) |
| CTM | 23,5–26,7 °C | [[6]](http://www.sjrdotmdl.org/concept_model/bio-effects_model/documents/Molony2001.pdf) |
| Reproducción | mejor éxito si el agua no pasa de ≈ 18 °C | [[6]](http://www.sjrdotmdl.org/concept_model/bio-effects_model/documents/Molony2001.pdf) |
| FishBase (clima) | 18–24 °C | [[20]](https://www.fishbase.se/summary/Salmo-trutta.html) |

*Discrepancia importante:* FishBase da 18–24 °C como rango de temperatura, pero 22–25 °C ya es letal incipiente para juveniles según Elliott & Elliott (2010). **Para el alimentador no se usa el rango de FishBase.**

**pH:** las recopilaciones tratan a las dos truchas como de requerimientos similares: crecimiento 7,0–8,0 y supervivencia 6,0–9,0 [[6]](http://www.sjrdotmdl.org/concept_model/bio-effects_model/documents/Molony2001.pdf). La trucha marrón sobrevive mejor que la arcoíris en agua ácida (CL50 a 24 h: pH 3,63 frente a 3,83) [[6]](http://www.sjrdotmdl.org/concept_model/bio-effects_model/documents/Molony2001.pdf). Irlanda: evitar pH <5 y >9 en truchas [[10]](https://www.fishhealth.ie/fhu/sites/default/files/FHU_Files/Documents/Chapter%20III%20Environment%20Vr%202.0.pdf).

**TDS:** PENDIENTE (mismas referencias de dureza que la arcoíris) [[6]](http://www.sjrdotmdl.org/concept_model/bio-effects_model/documents/Molony2001.pdf).

**Oxígeno:** como en la arcoíris (>7 mg/L; riesgo por debajo de ≈ 5–6 mg/L; <80 % de saturación afecta el apetito) [[6]](http://www.sjrdotmdl.org/concept_model/bio-effects_model/documents/Molony2001.pdf) [[10]](https://www.fishhealth.ie/fhu/sites/default/files/FHU_Files/Documents/Chapter%20III%20Environment%20Vr%202.0.pdf).

**Alimentación:** no se encontró una tabla de ración específica y confiable para trucha marrón. **[SUPUESTO]** Se usa la tabla de trucha arcoíris de SRAC [[4]](https://srac.msstate.edu/pdfs/Fact%20Sheets/223%20Trout%20Production-%20Feeds%20and%20Feeding%20Methods.pdf), limitada a ≤18 °C porque el límite superior para alimentarse puede empezar en 19 °C [[8]](http://docs.gip-ecofor.org/libre/Elliott_temperature_2010.pdf). Peso por talla con FishBase, a = 0,00871 y b = 3,03 [[20]](https://www.fishbase.se/summary/Salmo-trutta.html).

**Cantidad de pellets (dato principal para el alimentador) [ESTIMACIÓN]** — a 15 °C y a 13 °C; los gramos van al final como dato secundario:

| Talla | Pellet (mm) | **Pellets por toma a 15 °C** | **Pellets/día a 15 °C** | **Pellets/día a 13 °C** | Peso/pellet (mg) | g/día a 15 °C (secundario) | g/día a 13 °C (secundario) |
|---|---|---|---|---|---|---|---|
| Alevín 5 cm | 1,1 | **10** (en 6 tomas) | **60** | **58** | 1,10 | 0,0663 | 0,0640 |
| Juvenil 10 cm | 1,5 | **41** (en 3 tomas) | **120** | **120** | 3,08 | 0,383 | 0,364 |
| Juvenil grande 20 cm | 4,0 | **13–26** (en 1-2 tomas) | **26** | **25** | 57,98 | 1,52 | 1,45 |
| Adulto 30 cm | 4,8 | **44** (en 1 toma) | **44** | **39** | 100,20 | 4,43 | 3,91 |

**Tabla de referencia en % PV y gramos (dato secundario, tal como lo da la fuente):**

| Talla (LT) | Peso estimado (g) | Pellet (mm) | Tomas/día | 4 °C: % PV → g/día | 7 °C: % PV → g/día | 10 °C: % PV → g/día | 13 °C: % PV → g/día | 15 °C: % PV → g/día | 18 °C: % PV → g/día |
|---|---|---|---|---|---|---|---|---|---|
| Alevín 5 cm | 1,14 | 1,1 | 6 | 3,4 % → 0,0388 g | 3,9 % → 0,0446 g | 4,6 % → 0,0526 g | 5,6 % → 0,0640 g | 5,8 % → 0,0663 g | 6,3 % → 0,0720 g |
| Juvenil 10 cm | 9,33 | 1,5 | 3 | 2,5 % → 0,233 g | 2,7 % → 0,252 g | 3,5 % → 0,327 g | 3,9 % → 0,364 g | 4,1 % → 0,383 g | 4,4 % → 0,411 g |
| Juvenil grande 20 cm | 76,2 | 4,0 | 1-2 | 1,0 % → 0,762 g | 1,1 % → 0,839 g | 1,5 % → 1,14 g | 1,9 % → 1,45 g | 2,0 % → 1,52 g | 2,0 % → 1,52 g |
| Adulto 30 cm | 260,4 | 4,8 | 1 | 0,7 % → 1,82 g | 0,8 % → 2,08 g | 1,2 % → 3,13 g | 1,5 % → 3,91 g | 1,7 % → 4,43 g | 1,7 % → 4,43 g |

**Suspender la alimentación:** por encima de 19 °C, reducir y vigilar (es el valor más bajo del rango de límite superior para alimentarse); en 22 °C o más, suspender (letal incipiente). Por debajo de ≈ 4 °C, dar solo ración de mantenimiento; cerca de 0,4 °C, suspender [[8]](http://docs.gip-ecofor.org/libre/Elliott_temperature_2010.pdf).

**Alertas sugeridas:**

| Variable | Advertencia | Crítica |
|---|---|---|
| Temperatura | < 4 °C o > 19 °C | ≤ 0,5 °C o ≥ 22 °C (suspender la alimentación) |
| pH | fuera de 7,0–8,0 | < 6,0 o > 9,0 |
| TDS | sin umbral confiable (sugerencia de diseño: cambio brusco respecto de la línea de base) | — |
| Oxígeno | < 7 mg/L | < 5 mg/L |

### 3.3 Salmón del Atlántico — *Salmo salar* (fase de agua dulce)

**Origen:** introducido en Argentina. Nativo del Atlántico Norte, en las costas de Europa (Portugal a Rusia) y de Norteamérica (Cape Cod a Labrador) [[2]](https://www.fao.org/fishery/en/culturedspecies/salmo_salar/en). En la Patagonia se sembró desde 1904–1910, pero se estableció en pocas cuencas (30,4 %) [[34]](https://www.scielo.org.ar/scielo.php?pid=S1667-782X2014000200005&script=sci_arttext&tlng=en). No figura en la producción acuícola argentina de 2024 [[36]](https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Producci%C3%B3n%20Acu%C3%ADcola%20Argentina%202024.pdf). Es anádromo: el engorde comercial es en el mar; la fase que aplica a un tanque de agua dulce es huevo → alevín → parr → smolt.

**Temperatura recomendada (valor por defecto en la app): 14 °C** [ESTIMACIÓN: centro del óptimo irlandés 12–15 °C (13,5 °C), redondeado; también dentro de la tolerancia de smolts 3–18 °C] [[10]](https://www.fishhealth.ie/fhu/sites/default/files/FHU_Files/Documents/Chapter%20III%20Environment%20Vr%202.0.pdf).


| Parámetro | Valor | Fuente |
|---|---|---|
| Óptima para crecer | 12–15 °C según etapa y tamaño (Irlanda) | [[10]](https://www.fishhealth.ie/fhu/sites/default/files/FHU_Files/Documents/Chapter%20III%20Environment%20Vr%202.0.pdf) |
| Óptima con ración máxima | 15,9 °C (Reino Unido); 16,3–20,0 °C (Noruega) | [[8]](http://docs.gip-ecofor.org/libre/Elliott_temperature_2010.pdf) |
| Límites de crecimiento | 6,0–22,5 °C (Reino Unido); 1,0–7,7 a 23,3–26,7 °C (Noruega) | [[8]](http://docs.gip-ecofor.org/libre/Elliott_temperature_2010.pdf) |
| Tolerable | 0–20 °C con buen oxígeno; smolts 3–18 °C; engorde 1–18 °C (Irlanda) | [[10]](https://www.fishhealth.ie/fhu/sites/default/files/FHU_Files/Documents/Chapter%20III%20Environment%20Vr%202.0.pdf) |
| Sitios de mar (engorde) | 6–16 °C | [[2]](https://www.fao.org/fishery/en/culturedspecies/salmo_salar/en) |
| Límites para alimentarse (parr y smolt) | inferior 0–7 °C; superior 22–28 °C | [[8]](http://docs.gip-ecofor.org/libre/Elliott_temperature_2010.pdf) |
| Letal (parr y smolt) | incipiente superior 22–28 °C; última 30–33 °C; inferior ≈ −0,8 °C (−1 °C según Irlanda) | [[8]](http://docs.gip-ecofor.org/libre/Elliott_temperature_2010.pdf) [[10]](https://www.fishhealth.ie/fhu/sites/default/files/FHU_Files/Documents/Chapter%20III%20Environment%20Vr%202.0.pdf) |
| Huevos | no pasar de 8 °C (hasta ojo), 10 °C (hasta eclosión) y 12 °C (hasta primera alimentación) | [[10]](https://www.fishhealth.ie/fhu/sites/default/files/FHU_Files/Documents/Chapter%20III%20Environment%20Vr%202.0.pdf) |
| FishBase (clima, marino) | 2–9 °C | [[21]](https://www.fishbase.se/summary/Salmo-salar.html) |

*Discrepancia:* el rango de FishBase (2–9 °C) describe la distribución en el mar, no el óptimo de cultivo. El óptimo de crecimiento va de 12–15 °C (Irlanda) a 16–20 °C (Noruega, con ración máxima).

**pH:** mayor que 5,4, preferentemente 6,0–8,5 en agua dulce y mayor que 7,0 en agua de mar; evitar cambios bruscos [[10]](https://www.fishhealth.ie/fhu/sites/default/files/FHU_Files/Documents/Chapter%20III%20Environment%20Vr%202.0.pdf).

**TDS:** PENDIENTE. En agua dulce se puede agregar agua salada (en general hasta 1 ppt ≈ 1 000 mg/L) para ajustar el pH y detoxificar el aluminio [[10]](https://www.fishhealth.ie/fhu/sites/default/files/FHU_Files/Documents/Chapter%20III%20Environment%20Vr%202.0.pdf).

**Oxígeno:** ≈ 8 ppm en el agua de entrada del hatchery (FAO) [[2]](https://www.fao.org/fishery/en/culturedspecies/salmo_salar/en). Por debajo del 80 % de saturación bajan el apetito y el crecimiento; se tolera hasta el 70 %; la mortalidad empieza cerca del 40 % [[10]](https://www.fishhealth.ie/fhu/sites/default/files/FHU_Files/Documents/Chapter%20III%20Environment%20Vr%202.0.pdf).

**Alimentación:** en el hatchery del USGS la ración diaria se recalcula cada 2 semanas como % de la biomasa, con comederos automáticos de 24 h y alimentación manual [[11]](https://pubs.usgs.gov/publication/tm2A21/full). FAO: los centros de cultivo usan alimentadores automáticos con detección de saciedad [[2]](https://www.fao.org/fishery/en/culturedspecies/salmo_salar/en). La tabla del USGS no indica la temperatura del agua, y **no se encontró una tabla por temperatura específica de *S. salar* en agua dulce**. Como aproximación entre salmónidos **[SUPUESTO]** se puede escalar con la tabla en °C de BioMar para trucha (ver 3.1) [[13]](https://www.naturewater.ru/upload/iblock/10a/10ac1373d93147007daf983dd9276c25.pdf).

Tabla USGS (mes, peso, % PV/día y alimento) [[11]](https://pubs.usgs.gov/publication/tm2A21/full). Talla calculada con FishBase, a = 0,01023 y b = 3,03 [[21]](https://www.fishbase.se/summary/Salmo-salar.html) **[ESTIMACIÓN]**. Pellets **[ESTIMACIÓN]**:

| Etapa | Mes | Peso (g) | Talla est. (cm) | Alimento (fuente) | **Pellets/día [ESTIM.]** | **Pellets por toma (3 tomas) [ESTIM.]** | Peso/pellet (mg) | % PV/día | g/día por pez (secundario) [ESTIM.] |
|---|---|---|---|---|---|---|---|---|---|
| Alevín | 1 | 0,176 | 2,6 | crumble n.º 0–1 | n/a (crumble irregular; no se puede dosificar por pellet) | n/a | n/a | 4,34 | 0,0076 |
| Alevín | 4 | 1,220 | 4,8 | crumble n.º 2 | n/a (crumble irregular; no se puede dosificar por pellet) | n/a | n/a | 3,55 | 0,0433 |
| Parr | 6 | 8,55 | 9,2 | 1,5 y 2,0 mm | **65** | **22** | 3,08 | 2,34 | 0,200 |
| Parr | 9 | 20,00 | 12,2 | 2,5 mm | **24** | **8** | 14,16 | 1,70 | 0,340 |
| Parr | 12 | 45,00 | 15,9 | 3,0 mm | **23** | **8** | 24,46 | 1,27 | 0,572 |
| Pre-smolt | 16 | 92,50 | 20,2 | 4,0 mm | **17** | **6** | 57,98 | 1,09 | 1,01 |

**Tomas:** la fuente usa alimentación continua (comedero de 24 h); no da un número de tomas. **[ESTIMACIÓN]** Para AquaFeed: muchas microdosis repartidas en las horas de luz, en la misma línea que la tabla de trucha (8 → 1 tomas según la talla).

**Suspender la alimentación:** por encima de 22 °C (el valor más bajo del límite superior para alimentarse, y comienzo de la zona letal incipiente) y cerca de 0 °C [[8]](http://docs.gip-ecofor.org/libre/Elliott_temperature_2010.pdf).

**Alertas sugeridas:**

| Variable | Advertencia | Crítica |
|---|---|---|
| Temperatura | < 3 °C o > 18 °C (fuera de la tolerancia de smolts y engorde, Irlanda) | ≤ 0 °C o ≥ 22 °C |
| pH | fuera de 6,0–8,5 | ≤ 5,4 |
| TDS | sin umbral confiable | — |
| Oxígeno | < 80 % de saturación | ≤ 40 % de saturación |

### 3.4 Goldfish — *Carassius auratus*

**Origen:** introducido en Argentina. Nativo de Asia oriental, China y Japón [[22]](https://www.fishbase.se/summary/Carassius-auratus.html). Según INIDEP (Baigún & Quirós, 1985), llegó en los últimos años del siglo XIX por iniciativa privada [[41]](http://aquaticcommons.org/1705/1/Inf.Tec.AC2.pdf). Según Aquatec (UNLP, 1997), llegó a principios del siglo XX con inmigrantes europeos [[39]](https://sedici.unlp.edu.ar/handle/10915/150955). *Las dos fuentes no coinciden en la fecha exacta.* La cría local abastece el mercado interno [[39]](https://sedici.unlp.edu.ar/handle/10915/150955).

**Temperatura recomendada (valor por defecto en la app): 21 °C** [ESTIMACIÓN: centro del óptimo de SRAC 18–24 °C] [[5]](https://extension.rwfm.tamu.edu/wp-content/uploads/sites/8/2013/09/SRAC-Publication-No.-7201-Species-Profile-Koi-and-Goldfish.pdf).


| Parámetro | Valor | Fuente |
|---|---|---|
| Temperatura óptima | 18–24 °C (65–75 °F) | [[5]](https://extension.rwfm.tamu.edu/wp-content/uploads/sites/8/2013/09/SRAC-Publication-No.-7201-Species-Profile-Koi-and-Goldfish.pdf) |
| Tolerable | 0–35 °C si el cambio es gradual (estacional). Fuera del óptimo puede bajar la inmunidad, la alimentación y el crecimiento | [[5]](https://extension.rwfm.tamu.edu/wp-content/uploads/sites/8/2013/09/SRAC-Publication-No.-7201-Species-Profile-Koi-and-Goldfish.pdf) |
| FishBase | 0–41 °C (rango de clima) | [[22]](https://www.fishbase.se/summary/Carassius-auratus.html) |
| pH | lo más cerca posible de 7; tolera 5–9 (SRAC). FishBase: 6,0–8,0 | [[5]](https://extension.rwfm.tamu.edu/wp-content/uploads/sites/8/2013/09/SRAC-Publication-No.-7201-Species-Profile-Koi-and-Goldfish.pdf) [[22]](https://www.fishbase.se/summary/Carassius-auratus.html) |
| Dureza | 5–19 °dH (≈ 90–340 mg/L CaCO₃) | [[22]](https://www.fishbase.se/summary/Carassius-auratus.html) |
| TDS | PENDIENTE | — |
| Oxígeno | al menos 5 mg/L (tolera menos por períodos cortos); amoníaco no ionizado y nitrito < 0,05 mg/L | [[5]](https://extension.rwfm.tamu.edu/wp-content/uploads/sites/8/2013/09/SRAC-Publication-No.-7201-Species-Profile-Koi-and-Goldfish.pdf) |

*Discrepancia:* el límite superior va de 35 °C (SRAC, supervivencia con cambio gradual) a 41 °C (FishBase). Se toma el valor más conservador.

**Alimentación**

- Tipo: omnívoro. Dieta estándar de 25–32 % de proteína; el tamaño de partícula va de harina fina hasta pellets de ≈ 1/4" (6,4 mm) a medida que crece. Como no tiene estómago verdadero, le conviene recibir varias tomas por día [[5]](https://extension.rwfm.tamu.edu/wp-content/uploads/sites/8/2013/09/SRAC-Publication-No.-7201-Species-Profile-Koi-and-Goldfish.pdf).
- Ración: en juveniles (1,66 g), la mejor combinación de crecimiento y conversión fue **3 % PV/día en 4 tomas**. Con más de 3 % empeoró la eficiencia [[17]](https://arccjournals.com/journal/indian-journal-of-animal-research/B-3270). **No se encontró una tabla de ración por temperatura específica para goldfish** en fuentes confiables.
- Ajuste por temperatura **[ESTIMACIÓN]**: se escala el 3 % con las proporciones entre bandas de la tabla FAO para carpa, clase de 5–20 g (<17 °C: 5 %; 17–20 °C: 6 %; 20–23 °C: 7 %) [[12]](https://www.fao.org/3/S4314E/s4314e0s.htm). Para temperaturas frías se usan como aproximación las reglas para koi, que es otro ciprínido [[15]](https://hikariusa.com/wp/feeding-coldwater-koi-basics) [[16]](https://koiorganisationinternational.org/sites/default/files/Cold%20Water%20Koi%20Feeding%20and%20Nutrition%20FINAL.pdf).

| Temperatura del agua | % PV/día | Tomas/día | Base |
|---|---|---|---|
| < 10 °C | **suspender** | 0 | K.O.I.: dejar de alimentar koi por debajo de 10 °C [[16]](https://koiorganisationinternational.org/sites/default/files/Cold%20Water%20Koi%20Feeding%20and%20Nutrition%20FINAL.pdf). Hikari: por debajo de 5 °C no alimentar; entre 5 y 10 °C, como máximo 2–3 veces por semana [[15]](https://hikariusa.com/wp/feeding-coldwater-koi-basics) (discrepancia) |
| 10–17 °C | 2,1 [ESTIM.] | ≤ 2 | Hikari (10–15 °C: como máximo 2 veces por día) [[15]](https://hikariusa.com/wp/feeding-coldwater-koi-basics) + escalado FAO |
| 17–20 °C | 2,6 [ESTIM.] | 3–4 | escalado FAO |
| 20–24 °C | 3,0 | 4 | Belsare & Dhaker 2018 [[17]](https://arccjournals.com/journal/indian-journal-of-animal-research/B-3270) |
| > 24 °C | 3,0 como techo (no aumentar) [ESTIM.] | 4 | fuera del óptimo SRAC; criterio conservador |

Tallas (peso con FishBase, a = 0,01148 y b = 3,04 [[22]](https://www.fishbase.se/summary/Carassius-auratus.html)), pellet **[ESTIMACIÓN a partir de la tabla FAO para carpa por peso: 1,5 mm hasta 20 g; 2,7 mm de 20 a 50 g; 4 mm de 50 a 100 g; 5 mm de 100 a 300 g]** [[12]](https://www.fao.org/3/S4314E/s4314e0s.htm):

| Talla | Peso est. (g) | Pellet (mm) | **Pellets/día 20–24 °C [ESTIM.]** | **Pellets por toma (4 tomas)** | **Pellets/día 17–20 °C** | **Pellets/día 10–17 °C (≤ 2 tomas)** | g/día 10–17 °C | g/día 17–20 °C | g/día 20–24 °C |
|---|---|---|---|---|---|---|---|---|---|
| 5 cm | 1,53 | 1,5 | **15** | **4** | **13** | **10** | 0,0321 | 0,0398 | 0,0459 |
| 10 cm | 12,6 | 1,5 | **120** | **31** | **110** | **86** | 0,264 | 0,327 | 0,378 |
| 20 cm | 103,5 | 5,0 | **27** | **7** | **24** | **19** | 2,17 | 2,69 | 3,11 |

Nota: un goldfish de 20 cm (≈ 100 g) con 3 % PV es una extrapolación desde juveniles de 1,7 g, así que probablemente sea una sobreestimación. Los peces grandes comen proporcionalmente menos (así se ve en todas las tablas de trucha y carpa). Para acuario conviene empezar con 1,5–2 % y ajustar según lo que quede sin comer.

**Alertas sugeridas:**

| Variable | Advertencia | Crítica |
|---|---|---|
| Temperatura | < 10 °C (suspender la alimentación) o fuera de 18–24 °C (informativa) | ≤ 1 °C o ≥ 32 °C (el límite de supervivencia según SRAC es 0–35 °C; el margen de 3 °C es una decisión de diseño) |
| pH | fuera de 6,5–7,5 (lejos de 7) | < 5 o > 9 |
| TDS | sin umbral confiable (sugerencia de diseño: cambio brusco respecto de la línea de base) | — |
| Oxígeno | < 5 mg/L | PENDIENTE (umbral letal) |

### 3.5 Koi — *Cyprinus carpio* (variedad ornamental)

**Origen:** introducida en Argentina. La carpa común es nativa de Eurasia (cuencas de los mares Negro, Caspio y Aral) [[23]](https://www.fishbase.se/summary/Cyprinus-carpio.html). El koi se desarrolló en China, con gran influencia de Japón [[5]](https://extension.rwfm.tamu.edu/wp-content/uploads/sites/8/2013/09/SRAC-Publication-No.-7201-Species-Profile-Koi-and-Goldfish.pdf). En Argentina la carpa se aclimató en Entre Ríos a mediados del siglo XIX, con ejemplares traídos de Brasil para uso ornamental y de acuicultura; es la primera introducción registrada de un pez exótico en el país. La introducción oficial fue en 1925, en estanques públicos de Buenos Aires [[40]](http://sedici.unlp.edu.ar/bitstream/handle/10915/151187/Documento_completo.pdf?sequence=1) [[41]](http://aquaticcommons.org/1705/1/Inf.Tec.AC2.pdf). Las variedades ornamentales llegaron junto con la carpa [[39]](https://sedici.unlp.edu.ar/handle/10915/150955).

**Temperatura recomendada (valor por defecto en la app): 21 °C** [ESTIMACIÓN: centro del óptimo de SRAC 18–24 °C; con ≥ 10 °C la alimentación está habilitada] [[5]](https://extension.rwfm.tamu.edu/wp-content/uploads/sites/8/2013/09/SRAC-Publication-No.-7201-Species-Profile-Koi-and-Goldfish.pdf) [[16]](https://koiorganisationinternational.org/sites/default/files/Cold%20Water%20Koi%20Feeding%20and%20Nutrition%20FINAL.pdf).


| Parámetro | Valor | Fuente |
|---|---|---|
| Temperatura óptima | 18–24 °C | [[5]](https://extension.rwfm.tamu.edu/wp-content/uploads/sites/8/2013/09/SRAC-Publication-No.-7201-Species-Profile-Koi-and-Goldfish.pdf) |
| Tolerable | 0–35 °C con cambio gradual | [[5]](https://extension.rwfm.tamu.edu/wp-content/uploads/sites/8/2013/09/SRAC-Publication-No.-7201-Species-Profile-Koi-and-Goldfish.pdf) |
| FishBase (carpa) | 3–35 °C | [[23]](https://www.fishbase.se/summary/Cyprinus-carpio.html) |
| Riesgo sanitario por temperatura | KHV (herpesvirus del koi) sobre todo entre 18 y 27 °C; SVC (viremia primaveral de la carpa) entre 5 y 18 °C; úlcera por *Aeromonas* entre 13 y 24 °C | [[5]](https://extension.rwfm.tamu.edu/wp-content/uploads/sites/8/2013/09/SRAC-Publication-No.-7201-Species-Profile-Koi-and-Goldfish.pdf) |
| pH | cerca de 7; tolera 5–9 (SRAC). FishBase (carpa): 6,5–9,0 | [[5]](https://extension.rwfm.tamu.edu/wp-content/uploads/sites/8/2013/09/SRAC-Publication-No.-7201-Species-Profile-Koi-and-Goldfish.pdf) [[23]](https://www.fishbase.se/summary/Cyprinus-carpio.html) |
| Dureza | 10–15 °dH (≈ 180–270 mg/L CaCO₃) (FishBase, carpa) | [[23]](https://www.fishbase.se/summary/Cyprinus-carpio.html) |
| TDS | PENDIENTE | — |
| Oxígeno | al menos 5 mg/L | [[5]](https://extension.rwfm.tamu.edu/wp-content/uploads/sites/8/2013/09/SRAC-Publication-No.-7201-Species-Profile-Koi-and-Goldfish.pdf) |

**Alimentación**

- Tipo: omnívora; pellets flotantes o que se hunden. K.O.I. recomienda un alimento de alta proteína (>35 %) todo el año y ajustar solo la cantidad según la temperatura. Hay que retirar lo que no se coma en 15 minutos [[16]](https://koiorganisationinternational.org/sites/default/files/Cold%20Water%20Koi%20Feeding%20and%20Nutrition%20FINAL.pdf). En producción de carpa se usan raciones de ≈ 3–5 % PV/día para peces de segundo verano (FAO) [[3]](https://www.fao.org/fishery/en/culturedspecies/cyprinus_carpio/en).
- Tabla FAO "guía experimental para carpa" (% PV/día por temperatura y peso, con tamaño de pellet) [[12]](https://www.fao.org/3/S4314E/s4314e0s.htm):

| Peso (g) → | <5 | 5–20 | 20–50 | 50–100 | 100–300 | 300–1 000 |
|---|---|---|---|---|---|---|
| Pellet (mm) | 1,5 | 1,5 | 2,7 | 4 | 5 | 5 |
| < 17 °C | 6 | 5 | 4 | 3 | 2 | 1,5 |
| 17–20 °C | 7 | 6 | 5 | 4 | 3 | 2 |
| 20–23 °C | 9 | 7 | 6 | 5 | 4 | 3 |
| 23–26 °C | 12 | 10 | 8 | 6 | 5 | 4 |
| > 26 °C | 19 | 12 | 11 | 8 | 6 | 5 |

(En la fuente el primer encabezado aparece como ">5"; por la secuencia se interpreta como "<5 g".)

- **Frío:** Hikari: 10–15 °C, como máximo 2 tomas por día y solo si los peces comen con ganas; 5–10 °C, como máximo 2–3 veces por semana (opcional); por debajo de 5 °C, no alimentar [[15]](https://hikariusa.com/wp/feeding-coldwater-koi-basics). K.O.I.: dejar de alimentar por debajo de 10 °C [[16]](https://koiorganisationinternational.org/sites/default/files/Cold%20Water%20Koi%20Feeding%20and%20Nutrition%20FINAL.pdf). *Discrepancia:* Hikari permite alimentar poco entre 5 y 10 °C; K.O.I. suspende por debajo de 10 °C. La tabla FAO (<17 °C) no distingue entre 10 y 16 °C y da valores altos (pensados para producción). **Para AquaFeed: por debajo de 10 °C, suspender; entre 10 y 15 °C, tomar el valor FAO <17 °C como techo, ≤2 tomas y con confirmación del usuario.**
- **Tomas con agua cálida:** SRAC solo indica "varias tomas por día" (sin número). **[ESTIMACIÓN]** 3–4 tomas, en línea con el dato experimental de goldfish (4 tomas).

Tallas (peso con FishBase, a = 0,01778 y b = 2,95 [[23]](https://www.fishbase.se/summary/Cyprinus-carpio.html)):

| Talla | Peso est. (g) | Pellet (mm) | **Pellets/día a 20–23 °C [ESTIM.]** | **Pellets por toma (4 tomas)** | **Pellets/día 10–15 °C (techo, ≤ 2 tomas)** | 10–15 °C (techo): % → g | 17–20 °C: % → g | 20–23 °C: % → g | 23–26 °C: % → g |
|---|---|---|---|---|---|---|---|---|---|
| 10 cm | 15,8 | 1,5 | **360** | **90** | **260** | 5,0 % → 0,792 g | 6,0 % → 0,951 g | 7,0 % → 1,11 g | 10,0 % → 1,58 g |
| 20 cm | 122,5 | 5,0 | **43** | **11** | **22** | 2,0 % → 2,45 g | 3,0 % → 3,67 g | 4,0 % → 4,90 g | 5,0 % → 6,12 g |
| 40 cm | 946,3 | 5,0 | **250** | **63** | **130** | 1,5 % → 14,2 g | 2,0 % → 18,9 g | 3,0 % → 28,4 g | 4,0 % → 37,9 g |

Nota: los porcentajes de la FAO son para carpa de producción en estanques con alimento natural. En koi de estanque de jardín pueden generar sobras, así que conviene empezar por la mitad y ajustar. Los koi comen alimento flotante: el peso real por pellet puede ser menor que el del modelo (ver Convenciones).

**Alertas sugeridas:**

| Variable | Advertencia | Crítica |
|---|---|---|
| Temperatura | < 10 °C (suspender la alimentación); 18–27 °C → aviso informativo de riesgo de KHV si hay peces nuevos | ≤ 1 °C o ≥ 32 °C (el límite de supervivencia es 35 °C; el margen es una decisión de diseño) |
| pH | fuera de 6,5–8,5 | < 5 o > 9 |
| TDS | sin umbral confiable | — |
| Oxígeno | < 5 mg/L | PENDIENTE |

### 3.6 Pez de las nubes blancas — *Tanichthys albonubes*

**Origen:** introducido. Nativo del sur de China (Guangdong) y de Vietnam; se lo llegó a considerar extinto en la naturaleza [[24]](https://www.fishbase.se/summary/Tanichthys-albonubes.html) [[18]](https://seriouslyfish.com/species/tanichthys-albonubes). Sobre cuándo llegó a Argentina y cuán común es en el comercio local: **PENDIENTE**.

**Temperatura recomendada (valor por defecto en la app): 20 °C** [ESTIMACIÓN: centro del rango en que coinciden FishBase (18–22 °C) y Seriously Fish (14–22 °C); el centro del rango de Seriously Fish solo sería 18 °C] [[24]](https://www.fishbase.se/summary/Tanichthys-albonubes.html) [[18]](https://seriouslyfish.com/species/tanichthys-albonubes).


| Parámetro | Valor | Fuente |
|---|---|---|
| Temperatura | cómodo entre 14 y 22 °C; la exposición permanente a más calor acorta la vida | [[18]](https://seriouslyfish.com/species/tanichthys-albonubes) |
| Temperatura (FishBase) | 18–22 °C; sobrevive hasta 5 °C | [[24]](https://www.fishbase.se/summary/Tanichthys-albonubes.html) |
| Letal alta | PENDIENTE | — |
| pH | 6,0–8,5 (Seriously Fish); 6,0–8,0 (FishBase) | [[18]](https://seriouslyfish.com/species/tanichthys-albonubes) [[24]](https://www.fishbase.se/summary/Tanichthys-albonubes.html) |
| Dureza | 90–357 mg/L (Seriously Fish); 5–19 °dH (FishBase) — son equivalentes | [[18]](https://seriouslyfish.com/species/tanichthys-albonubes) [[24]](https://www.fishbase.se/summary/Tanichthys-albonubes.html) |
| TDS | PENDIENTE | — |
| Oxígeno | PENDIENTE | — |

**Alimentación:** en la naturaleza come zooplancton y detritos [[24]](https://www.fishbase.se/summary/Tanichthys-albonubes.html). En acuario acepta escamas y pellets comunes. **Ración en % PV y tomas: PENDIENTE.** **[ESTIMACIÓN, muy incierta]** Para programar el alimentador se toma 2–3 % PV/día (orden de magnitud del dato de goldfish juvenil [[17]](https://arccjournals.com/journal/indian-journal-of-animal-research/B-3270)) y micro-pellets de 0,5 mm (peso por pellet de BioMar [[13]](https://www.naturewater.ru/upload/iblock/10a/10ac1373d93147007daf983dd9276c25.pdf)). Peso con FishBase, a = 0,01023 y b = 3,08, estimado a partir de la forma del cuerpo de la familia [[24]](https://www.fishbase.se/summary/Tanichthys-albonubes.html).

| Talla | Peso est. (g) | **Pellets 0,5 mm/día por pez** | **Grupo de 10: pellets/día** | **Grupo de 10: pellets por toma (2 tomas [ESTIM.])** | g/día por pez a 3 % (secundario) | Grupo de 10: g/día (secundario) |
|---|---|---|---|---|---|---|
| 2 cm | 0,0865 | **14** | **140** | **71** | 0,0026 | 0,0260 |
| 3 cm | 0,302 | **49** | **490** | **250** | 0,0090 | 0,0905 |
| 4 cm | 0,732 | **120** | **1200** | **600** | 0,0219 | 0,219 |

Para una especie tan chica, la dosis por pez es de pocos pellets: conviene programar el alimentador por grupo o por acuario (pellets totales por toma). **[ESTIMACIÓN]** Con 18–22 °C, 3 %; con 14–18 °C, 2 %; por debajo de 14 °C, reducir, y por debajo de 10 °C, suspender (no hay dato; es un criterio conservador de diseño).

**Alertas sugeridas:**

| Variable | Advertencia | Crítica |
|---|---|---|
| Temperatura | < 14 °C o > 22 °C | ≤ 5 °C (límite de FishBase); límite alto PENDIENTE (sugerencia de diseño: ≥ 26 °C) |
| pH | fuera de 6,0–8,0 | fuera de 6,0–8,5 |
| TDS | sin umbral confiable | — |

### 3.7 Pejerrey — *Odontesthes bonariensis* (nativo, templado-frío)

**Origen:** **nativo** de Argentina (región pampeana y Río de la Plata); se introdujo en Europa y Asia [[25]](https://www.fishbase.se/summary/Odontesthes-bonariensis.html). En Argentina se cultiva hace décadas con fines de investigación y siembra (Estación Hidrobiológica Chascomús, INTECH) [[31]](https://revistas.unlp.edu.ar/bacuatica/article/download/16102/16121/71729).

**Temperatura recomendada (valor por defecto en la app): 21 °C** [ESTIMACIÓN: centro del óptimo de cultivo 17–24 °C (20,5 °C), redondeado] [[31]](https://revistas.unlp.edu.ar/bacuatica/article/download/16102/16121/71729).


| Parámetro | Valor | Fuente |
|---|---|---|
| Temperatura óptima de cultivo | 17–24 °C | [[31]](https://revistas.unlp.edu.ar/bacuatica/article/download/16102/16121/71729) |
| FishBase (clima) | 11–24 °C | [[25]](https://www.fishbase.se/summary/Odontesthes-bonariensis.html) |
| Estrés | a 30 °C los juveniles nadan en superficie y dejan de comer | [[33]](https://exa.ai/library/publication/574yt41ydk6) (resumen indexado) |
| Temperaturas en ambiente natural | laguna Chascomús: medias de 8,9 a 25,6 °C | [[31]](https://revistas.unlp.edu.ar/bacuatica/article/download/16102/16121/71729) |
| Letal baja | PENDIENTE | — |
| pH | PENDIENTE | — |
| Salinidad / TDS | larvas y juveniles crecen mejor con 5–20 g/L (≈ 5 000–20 000 mg/L de TDS); en cultivo intensivo la salinidad intermedia no es imprescindible | [[31]](https://revistas.unlp.edu.ar/bacuatica/article/download/16102/16121/71729) |
| Oxígeno | PENDIENTE | — |

**Alimentación:** en juveniles se usó alimento para trucha (Starter 00, 0 y Crumble 1–2) en **6 tomas por día** [[33]](https://exa.ai/library/publication/574yt41ydk6). En jaulas en lagunas (con zooplancton natural): con frío y poca producción natural, no pasar del **5 % de la biomasa**; con mejores condiciones, **7 % o más** [[32]](https://exa.ai/library/publication/mwvh5v9pjrv). Estas dos fuentes son resúmenes indexados de trabajos argentinos; conviene confirmarlos con el texto completo.

Tallas (peso con FishBase, a = 0,00525 y b = 3,05 [[25]](https://www.fishbase.se/summary/Odontesthes-bonariensis.html)). Pellet **[ESTIMACIÓN: tamaños de alimento de trucha por peso, según BioMar]** [[13]](https://www.naturewater.ru/upload/iblock/10a/10ac1373d93147007daf983dd9276c25.pdf):

| Talla | Peso est. (g) | Pellet (mm) | **Pellets/día a 7 % [ESTIM.]** | **Pellets por toma (6 tomas)** | **Pellets/día a 5 % (frío)** | g/día a 5 % (secundario) | g/día a 7 % (secundario) |
|---|---|---|---|---|---|---|---|
| 5 cm | 0,711 | 0,8 | **110** | **18** | **78** | 0,0356 | 0,0498 |
| 10 cm | 5,89 | 1,5 | **130** | **22** | **96** | 0,295 | 0,412 |
| 20 cm | 48,8 | 2,0 | **470** | **79** | **340** | 2,44 | 3,42 |

Nota: el 5–7 % viene de jaulas donde los peces también comen zooplancton. En tanque sin alimento natural puede hacer falta otra ración; no hay dato confiable.

**Suspender la alimentación:** a 30 °C o más (dejan de comer). Límite bajo: PENDIENTE.

**Alertas sugeridas:**

| Variable | Advertencia | Crítica |
|---|---|---|
| Temperatura | fuera de 17–24 °C | ≥ 30 °C (suspender la alimentación); límite bajo PENDIENTE |
| pH | PENDIENTE | PENDIENTE |
| TDS | ojo: la especie tolera agua salobre, así que un TDS alto no es en sí un problema. Los medidores comunes suelen saturar cerca de 9 990 ppm | — |

## 4. Principales discrepancias entre fuentes

1. **Trucha arcoíris, temperatura óptima:** 12–14 °C (Irlanda, FHU) frente a 12,8–18,3 °C (SRAC) y "debajo de 21 °C" (FAO). El letal alto va de 24 °C (FHU) a 25–27 °C (varias referencias en Molony 2001).
2. **Trucha arcoíris, ración:** BioMar (alimento moderno de alta energía) da alrededor de la mitad de la ración que SRAC para alevines (por ejemplo, 1–3 g a 16 °C: 2,9 % frente a ≈ 5,4–5,8 %). La tabla NRC/FAO se parece a la de SRAC.
3. **Trucha marrón:** FishBase dice 18–24 °C, pero Elliott & Elliott (2010) ubican la letal incipiente de juveniles en 22–25 °C y el óptimo en 13–14 °C (invertebrados) o 11,6–19,1 °C (pellets). No se encontró tabla de ración propia; se usa la de la arcoíris.
4. **Salmón del Atlántico:** FishBase 2–9 °C (distribución en el mar) frente a un óptimo de cultivo de 12–15 °C (Irlanda) o 16–20 °C (Noruega, ración máxima).
5. **Goldfish, fecha de introducción en Argentina:** fines del siglo XIX (INIDEP, Baigún & Quirós 1985) frente a principios del siglo XX (Aquatec/UNLP 1997). Límite térmico superior: 35 °C (SRAC) frente a 41 °C (FishBase).
6. **Koi con frío:** Hikari permite alimentar poco entre 5 y 10 °C; K.O.I. suspende por debajo de 10 °C. La tabla FAO para carpa (<17 °C) da valores altos y no distingue entre 10 y 16 °C.
7. **TDS:** no hay rangos de TDS publicados para ninguna de las especies en las fuentes consultadas; solo dureza, alcalinidad o salinidad. El factor EC→TDS varía entre ≈ 0,55 y 0,75 según el agua.
8. **Pez de las nubes blancas y pejerrey:** faltan datos confiables de ración, pH (pejerrey) y límites letales. Los valores de alimentación son estimaciones.

## 5. Fuentes

1. FAO — Cultured Aquatic Species Information Programme: *Oncorhynchus mykiss*. https://www.fao.org/fishery/en/culturedspecies/oncorhynchus_mykiss/en
2. FAO — Cultured Aquatic Species Information Programme: *Salmo salar*. https://www.fao.org/fishery/en/culturedspecies/salmo_salar/en
3. FAO — Cultured Aquatic Species Information Programme: *Cyprinus carpio* (Peteri, A.). https://www.fao.org/fishery/en/culturedspecies/cyprinus_carpio/en
4. Hinshaw, J. M. (1999). Trout Production: Feeds and Feeding Methods. SRAC Publication No. 223 (Southern Regional Aquaculture Center / NC State University). https://srac.msstate.edu/pdfs/Fact%20Sheets/223%20Trout%20Production-%20Feeds%20and%20Feeding%20Methods.pdf
5. Watson, C. A., Hill, J. E. & Pouder, D. B. (2004). Species Profile: Koi and Goldfish. SRAC Publication No. 7201 (University of Florida IFAS). https://extension.rwfm.tamu.edu/wp-content/uploads/sites/8/2013/09/SRAC-Publication-No.-7201-Species-Profile-Koi-and-Goldfish.pdf
6. Molony, B. (2001). Environmental requirements and tolerances of Rainbow trout and Brown trout, with special reference to Western Australia: a review. Fisheries Research Report No. 130, Dept. of Fisheries, Western Australia. http://www.sjrdotmdl.org/concept_model/bio-effects_model/documents/Molony2001.pdf
7. Ficha del mismo informe (Molony 2001) en la biblioteca del DPIRD, Western Australia. https://library.dpird.wa.gov.au/fr_rr/196/
8. Elliott, J. M. & Elliott, J. A. (2010). Temperature requirements of Atlantic salmon *Salmo salar*, brown trout *Salmo trutta* and Arctic charr *Salvelinus alpinus*: predicting the effects of climate change. Journal of Fish Biology 77:1793–1817. http://docs.gip-ecofor.org/libre/Elliott_temperature_2010.pdf
9. Registro del mismo trabajo (Elliott & Elliott 2010) en NERC Open Research Archive. https://nora.nerc.ac.uk/10887/
10. Fish Health Unit (Marine Institute, Irlanda). Chapter III — Environment (bienestar de salmón y trucha). https://www.fishhealth.ie/fhu/sites/default/files/FHU_Files/Documents/Chapter%20III%20Environment%20Vr%202.0.pdf
11. USGS Techniques and Methods 2-A21 — Atlantic salmon (*Salmo salar*) culture manual (Tunison Laboratory of Aquatic Science). https://pubs.usgs.gov/publication/tm2A21/full
12. FAO — Appendix XIII: Feeding tables (manual de alimentación en acuicultura, documento S4314E). Incluye la tabla NRC 1981 para trucha y la guía experimental para carpa (A. Coche). https://www.fao.org/3/S4314E/s4314e0s.htm
13. BioMar — Ficha técnica INICIO Plus (trucha): pellets por kg y guía de alimentación indicativa por temperatura. https://www.naturewater.ru/upload/iblock/10a/10ac1373d93147007daf983dd9276c25.pdf
14. BioMar — Ficha técnica INICIO 702, 2 mm (trucha): 138 000 pellets/kg. https://aquafeed-biomar.ro/wp-content/uploads/2024/01/en-dk-inicio-702-2-mm-trout.pdf
15. Hikari Sales USA — Feeding Your Coldwater Koi: The Basics (fabricante; guía de temperatura y frecuencia). https://hikariusa.com/wp/feeding-coldwater-koi-basics
16. Koi Organisation International (Pattist, K., 2020) — Cold Water Koi Feeding and Nutrition. https://koiorganisationinternational.org/sites/default/files/Cold%20Water%20Koi%20Feeding%20and%20Nutrition%20FINAL.pdf
17. Belsare, S. S. & Dhaker, H. S. (2018). Feeding ration and frequency influences growth, feed utilization and body composition of goldfish (*Carassius auratus*). Indian Journal of Animal Research. https://arccjournals.com/journal/indian-journal-of-animal-research/B-3270
18. Seriously Fish — *Tanichthys albonubes* (guía de acuarismo). https://seriouslyfish.com/species/tanichthys-albonubes
19. FishBase — *Oncorhynchus mykiss* (relación largo-peso bayesiana, clima). https://www.fishbase.se/summary/Oncorhynchus-mykiss.html
20. FishBase — *Salmo trutta*. https://www.fishbase.se/summary/Salmo-trutta.html
21. FishBase — *Salmo salar*. https://www.fishbase.se/summary/Salmo-salar.html
22. FishBase — *Carassius auratus*. https://www.fishbase.se/summary/Carassius-auratus.html
23. FishBase — *Cyprinus carpio*. https://www.fishbase.se/summary/Cyprinus-carpio.html
24. FishBase — *Tanichthys albonubes*. https://www.fishbase.se/summary/Tanichthys-albonubes.html
25. FishBase — *Odontesthes bonariensis*. https://www.fishbase.se/summary/Odontesthes-bonariensis.html
26. FishBase — *Odontesthes hatcheri*. https://www.fishbase.se/summary/Odontesthes-hatcheri.html
27. FishBase — *Percichthys trucha*. https://www.fishbase.se/summary/Percichthys-trucha.html
28. FishBase — *Galaxias maculatus*. https://www.fishbase.se/summary/Galaxias-maculatus.html
29. FishBase — *Salvelinus fontinalis*. https://www.fishbase.se/summary/Salvelinus-fontinalis.html
30. FishBase — *Oncorhynchus tshawytscha*. https://www.fishbase.se/summary/Oncorhynchus-tshawytscha.html
31. Berasain, G. E. et al. (2024). Crecimiento del pejerrey, *Odontesthes bonariensis*, en cultivo y en poblaciones silvestres: un meta-análisis. Biología Acuática 42 (Estación Hidrobiológica Chascomús; ILPLA CONICET-UNLP; INTECH CONICET-UNSAM). https://revistas.unlp.edu.ar/bacuatica/article/download/16102/16121/71729
32. Desarrollo de un sistema de cría semi-intensiva para producción de pejerrey en jaulas flotantes (resumen indexado; trabajo argentino en lagunas bonaerenses). https://exa.ai/library/publication/mwvh5v9pjrv
33. Crecimiento de juveniles de pejerrey (*Odontesthes bonariensis*) bajo diferentes condiciones de cultivo (resumen indexado; cita a Somoza et al. 2008 para el óptimo de 17–24 °C). https://exa.ai/library/publication/574yt41ydk6
34. Macchi, P. J. & Vigliano, P. H. (2014). Salmonid introduction in Patagonia: the ghost of past, present and future management. Ecología Austral 24(2) (Universidad Nacional del Comahue / CONICET). https://www.scielo.org.ar/scielo.php?pid=S1667-782X2014000200005&script=sci_arttext&tlng=en
35. Macchi, P. J. et al. (1999). Predation relationships between introduced salmonids and the native fish fauna in lakes and reservoirs in northern Patagonia. Ecology of Freshwater Fish (resumen indexado). https://exa.ai/library/publication/j1lr106chjj
36. MAGyP, Dirección Nacional de Acuicultura — Producción acuícola en Argentina 2024. https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Producci%C3%B3n%20Acu%C3%ADcola%20Argentina%202024.pdf
37. MAGyP, Dirección Nacional de Acuicultura — Análisis de la producción de trucha arcoíris en Patagonia Norte. https://www.magyp.gob.ar/sitio/areas/acuicultura/especies/_archivos/000000_An%C3%A1lisis%20de%20la%20producci%C3%B3n%20de%20trucha%20en%20Patagonia%20norte.pdf
38. MAGyP, Dirección Nacional de Acuicultura — Importación y exportación de organismos ornamentales 2024. https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Importaciones%20y%20exportaciones%20de%20organismos%20ornamentales%202024.pdf
39. Aquatec, Boletín Técnico N.º 4 (1997). Cultivo de peces ornamentales (*Carassius auratus* y *Cyprinus carpio*) en sistemas semiintensivos en la Argentina (repositorio SEDICI, UNLP). https://sedici.unlp.edu.ar/handle/10915/150955
40. Invasion status of the common carp *Cyprinus carpio* in inland waters of Argentina (repositorio SEDICI, UNLP). http://sedici.unlp.edu.ar/bitstream/handle/10915/151187/Documento_completo.pdf?sequence=1
41. Baigún, C. R. M. & Quirós, R. (1985). Introducción de peces exóticos en la República Argentina. Informe Técnico INIDEP. http://aquaticcommons.org/1705/1/Inf.Tec.AC2.pdf
42. Rusydi, A. F. (2018). Correlation between conductivity and total dissolved solid in various type of water: A review. IOP Conf. Ser.: Earth Environ. Sci. 118:012019. https://iopscience.iop.org/article/10.1088/1755-1315/118/1/012019/pdf
43. Establishing a conversion factor between electrical conductivity and total dissolved solids in South African mine waters. Water SA (2015). https://scielo.org.za/scielo.php?pid=S1816-79502015000400008&script=sci_arttext

---
*Nota metodológica:* los números entre corchetes remiten a esta lista. Todo lo marcado [ESTIMACIÓN] o [SUPUESTO] es cálculo o extrapolación propia con la fórmula indicada, no un dato de la fuente. Las alertas marcadas como "sugerencia de diseño" son criterios de ingeniería para AquaFeed, no datos biológicos publicados.
