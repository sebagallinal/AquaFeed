# AquaFeed — Fichas técnicas de especies tropicales para el alimentador automático

Tesis de Horacio Vespoli: alimentador con ESP32, motor paso a paso 28BYJ-48 y sensores de pH, temperatura y TDS, controlado desde una app Angular por MQTT.  
Documento armado el 28/09/2026 (hora de Buenos Aires), con el mismo formato y criterio de fuentes que `fichas-especies-agua-fria.md`. Todos los valores tienen su fuente con URL (entre corchetes, numeradas; la lista completa está al final).

## Convenciones

- **Decisión de diseño de Horacio: el alimentador dosifica POR PELLET.** El dato principal de cada ficha es la **cantidad de pellets por toma y por día**, con el **tamaño de pellet** para cada talla. Los gramos quedan como dato secundario.
- **[ESTIMACIÓN]** marca todo lo que se calculó o extrapoló (no es un dato directo de la fuente). Se explica cómo se calculó.
- **PENDIENTE** = no se encontró el dato en una fuente reconocida.
- **Temperatura recomendada** = un solo valor objetivo en °C para usar como valor por defecto en la app. Salvo que se indique otra cosa, es el **centro del rango ideal** (redondeado al grado) y por eso lleva **[ESTIMACIÓN]**.
- **[Sugerencia de diseño]** = umbral de ingeniería para AquaFeed, no un dato biológico publicado.
- **Niveles de alerta:** *ideal* = rango en el que coinciden las fuentes de acuarismo; *advertencia* = fuera del ideal pero dentro de algún rango tolerable publicado; *crítico* = fuera de todos los rangos de mantenimiento publicados. Los límites de laboratorio (CTmín/CTmáx: temperatura a la que el pez pierde el equilibrio) se informan como referencia fisiológica; **no son umbrales de alarma**, porque cerca de ellos el pez ya está en peligro.
- Peso a partir de la talla: relación largo-peso bayesiana de FishBase, W(g) = a·L(cm)^b, con L = largo total **[ESTIMACIÓN]**. Las hembras preñadas de los vivíparos pesan más que lo calculado.

### Cómo se calcularon los pellets **[ESTIMACIÓN]**

- **Ración:** para peces adultos en mantenimiento, UF/IFAS indica **0,5–1,0 % del peso vivo por día**; y advierte que el error más común es sobrealimentar [[21]](https://ask.ifas.ufl.edu/publication/FA096). Una guía de divulgación da 0,5–2 % para adultos y 2–5 % para juveniles [[22]](https://aquariumscience.org/3-3-1-amount-in-depth/). Acá se usa **0,5–1 % PV/día para adultos** y **3 % PV/día para juveniles**.
- **Tomas:** en *P. reticulata* y *P. sphenops*, 1, 2 o 3 tomas diarias no cambiaron significativamente el crecimiento ni la supervivencia, y los autores recomiendan **2 tomas por día** [[19]](http://ij-aquaticbiology.com/index.php/ijab/article/download/570/505/1904). Para juveniles de vivíparos, una revisión cita el mayor crecimiento con **3 tomas por día** (guppy y cola de espada) [[23]](https://vingnanam.sljol.info/articles/4257/files/693c219a931a9.pdf). Seriously Fish indica 2–3 tomas por día para alevines de platy [[10]](https://www.seriouslyfish.com/species/xiphophorus-maculatus/). Se usan **2 tomas (adultos)** y **3 tomas (juveniles)**.
- **Tamaño de pellet:** la regla general de acuicultura es un pellet del **25–50 % del ancho de la boca** [[27]](https://thefishsite.com/articles/how-big-are-your-fish-pellets). **El ancho de boca de estas especies está PENDIENTE.** Los micro-pellets de 0,5 mm se venden para tetras, vivíparos y alevines [[25]](https://www.aquariumcoop.com/products/xtreme-nano-0-5mm-pellet). Se usa **0,5 mm para peces de menos de 6 cm**, **0,8 mm de 6 a 10 cm** y **1,1 mm para más de 10 cm** **[ESTIMACIÓN]**.
- **Peso de un pellet:** dato de fábrica de BioMar (alimento extrusado para trucha): 5 470 000 pellets/kg en 0,5 mm (≈ 0,18 mg por pellet), 2 190 000/kg en 0,8 mm (≈ 0,46 mg) y 905 000/kg en 1,1 mm (≈ 1,1 mg) [[28]](https://www.naturewater.ru/upload/iblock/10a/10ac1373d93147007daf983dd9276c25.pdf). **[ESTIMACIÓN]** Se supone que un micro-pellet tropical del mismo diámetro pesa lo mismo. Los micro-pellets de acuario pueden ser menos densos (semiflotantes), así que conviene pesar 100 pellets de la marca real y recalcular.
- **Redondeo:** como el alimentador dosifica por pellet, las cantidades de pellets se redondean a pellets enteros (mínimo 1).
- **Cálculo:** pellets/día = peso del pez (g) × % PV/día ÷ 100 × 1 000 ÷ mg por pellet. Pellets por toma = pellets/día ÷ tomas.
- **Contraste con un fabricante:** Hikari, para sus Micro Pellets, indica para un betta de 1,5" (3,8 cm) **6 pellets por toma, 2 tomas por día**, y nunca más de 6 por toma; en general, dar 2–3 veces por día lo que se coma en un minuto [[26]](https://hikariusa.com/tropical_folder/micro_pellets.html). Esa cifra (12 pellets/día para un pez de ≈ 1 g) es **menor** que la del cálculo por % PV (≈ 28–55 pellets de 0,5 mm). *Discrepancia:* conviene arrancar por el extremo bajo del rango y ajustar según lo que quede sin comer.
- **Referencia de laboratorio (techo):** en ensayos de crecimiento se usaron raciones mucho más altas: 10 % del peso por toma, 2 tomas por día [[19]](http://ij-aquaticbiology.com/index.php/ijab/article/download/570/505/1904), o consumo *ad libitum* de 10,8–12,6 % PV/día en juveniles de guppy [[20]](https://jur.sljol.info/articles/10.4038/jur.v7i1.7930). Son valores para crecimiento máximo en producción, no para un acuario doméstico.

### TDS y dureza

- **No se encontraron rangos de TDS publicados** para ninguna de las 4 especies: las fuentes dan dureza (°dH/dGH). **La dureza no es TDS:** mide solo calcio y magnesio. Para un mismo agua, el TDS suele ser mayor que la dureza en mg/L. Conversión de unidades de dureza: 1 °dH ≈ 17,8 mg/L CaCO₃. El factor EC→TDS varía entre ≈ 0,55 y 0,75 según el agua [[31]](https://iopscience.iop.org/article/10.1088/1755-1315/118/1/012019/pdf).
- **[ESTIMACIÓN]** En la tabla, el "piso orientativo de TDS" es la dureza en mg/L CaCO₃ (el TDS real del agua será igual o mayor). **No hay un techo de TDS con fuente: PENDIENTE.**

### ¿Cuál molly es cuál?

- ***Poecilia sphenops*** = **molly común o de aleta corta** ("short-fin molly"). La variedad negra (**black molly**) es de esta especie según FishBase [[3]](https://www.fishbase.se/summary/Poecilia-sphenops.html). Llega a 7,5–8 cm (LE) [[3]](https://www.fishbase.se/summary/Poecilia-sphenops.html) [[8]](https://www.seriouslyfish.com/species/poecilia-sphenops/). FishBase advierte que suele confundirse con *P. mexicana* [[3]](https://www.fishbase.se/summary/Poecilia-sphenops.html).
- ***Poecilia latipinna*** = **molly vela** ("sailfin molly"). El macho tiene una aleta dorsal grande en forma de vela [[9]](https://www.seriouslyfish.com/species/poecilia-latipinna/). Es más grande: hasta 15 cm LT el macho y 10 cm la hembra [[4]](https://www.fishbase.se/summary/Poecilia-latipinna.html); Seriously Fish da 125 mm LE [[9]](https://www.seriouslyfish.com/species/poecilia-latipinna/).
- Las dos especies se hibridan. Seriously Fish recomienda mantener una sola especie por acuario [[8]](https://www.seriouslyfish.com/species/poecilia-sphenops/), y muchos mollies del comercio son variedades de criadero [[8]](https://www.seriouslyfish.com/species/poecilia-sphenops/) [[9]](https://www.seriouslyfish.com/species/poecilia-latipinna/). **Para AquaFeed:** si no se sabe la especie, usar la ficha de *P. sphenops* para peces de aleta corta y la de *P. latipinna* para los de aleta vela.

## 1. Tabla resumen

Pellets/día para un **pez adulto de talla de referencia**, a temperatura ideal, con 0,5–1 % PV/día y 2 tomas **[ESTIMACIÓN]**. Las temperaturas de corte son **[sugerencia de diseño]**: ninguna fuente da una temperatura de suspensión de la alimentación para estas especies (**PENDIENTE**).

| Especie | Origen | **Temp. recomendada (°C)** | Temp. ideal (°C) | pH ideal | Dureza / TDS | **Pellets/día por pez [ESTIM.]** | **Pellets por toma (2 tomas)** | Tamaño de pellet | Talla de referencia | Suspender alimentación [sugerencia de diseño] | Ambiente | Litros mínimos |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Guppy (*P. reticulata*) | Introducido (NE de Sudamérica y sur del Caribe) | **25** [ESTIM.] | 22–28 | 7,0–8,0 | 9–19 °dH ideal (8–30 tolerable; ≈ 160–338 mg/L CaCO₃); TDS PENDIENTE | **55–110** | **28–55** | 0,5 mm | hembra adulta 5,0 cm (≈ 2,02 g) | < 17 °C o ≥ 32 °C | Acuario de interior con calefactor | ≈ 41 L (base 45 × 30 cm) |
| Neón tetra (*P. innesi*) | Introducido (alto Amazonas: Brasil, Colombia, Perú) | **23** [ESTIM.] | 21–25 | 5,0–7,0 | 1–2 °dH silvestre; hasta 12 dGH en criadero (≈ 18–214 mg/L CaCO₃); TDS PENDIENTE | **9–18** | **5–9** | 0,5 mm | adulto 3,0 cm (≈ 0,331 g) | < 18 °C o ≥ 30 °C | Acuario de interior con calefactor, en cardumen | ≈ 54 L (base 60 × 30 cm) |
| Molly de aleta corta / black molly (*P. sphenops*) | Introducido (México a Colombia y Venezuela) | **25** [ESTIM.] | 22–28 | 7,5–8,2 | 15–30 dGH ideal (11–30 tolerable; ≈ 267–534 mg/L CaCO₃); TDS PENDIENTE | **44–89** | **22–44** | 0,8 mm | adulto 6,0 cm (≈ 4,05 g) | < 18 °C o ≥ 32 °C | Acuario de interior con calefactor, agua dura | ≈ 81 L (base 90 × 30 cm) |
| Molly vela (*P. latipinna*) | Introducido (costa de EE. UU., de Carolina del Norte a Veracruz, México) | **24** [ESTIM.] | 21–26 | 7,0–8,5 | 15–35 dGH (≈ 267–623 mg/L CaCO₃); tolera agua salobre; TDS PENDIENTE | **82–160** | **41–82** | 0,8 mm | hembra adulta 8,0 cm (≈ 7,47 g) | < 18 °C o ≥ 32 °C | Acuario de interior con calefactor, agua dura | ≈ 87 L (base 76 × 38 cm) |
| Platy (*X. maculatus*) | Introducido (vertiente atlántica de México, Guatemala y Belice) | **23** [ESTIM.] | 20–25 | 7,0–8,0 | 10–19 dGH ideal (9–30 tolerable; ≈ 178–338 mg/L CaCO₃); TDS PENDIENTE | **45–90** | **22–45** | 0,5 mm | hembra adulta 5,0 cm (≈ 1,64 g) | < 18 °C o ≥ 30 °C | Acuario de interior con calefactor | ≈ 54 L (base 60 × 30 cm) |

Contexto argentino: *X. maculatus*, *P. sphenops*, *P. reticulata* y *P. latipinna* están entre los peces ornamentales de agua dulce que más exporta Argentina (a Chile) [[30]](https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Importaciones%20y%20exportaciones%20de%20organismos%20ornamentales%202024.pdf). Las 4 especies son **introducidas** (no nativas de Argentina). **Fecha de llegada al país: PENDIENTE** para las cuatro.

## 2. Fichas por especie

### 2.1 Guppy — *Poecilia reticulata*

**Origen:** introducido en Argentina. Nativo del noreste de Sudamérica y del sur del Caribe: Venezuela, Guyana, Surinam, Guayana Francesa, Trinidad y Tobago, Barbados, Antigua y Barbuda y Antillas Neerlandesas [[6]](https://www.seriouslyfish.com/species/poecilia-reticulata/); FishBase agrega el norte de Brasil [[1]](https://www.fishbase.se/summary/Poecilia-reticulata.html). Se introdujo en muchos países para controlar mosquitos, con poco efecto sobre ellos [[1]](https://www.fishbase.se/summary/Poecilia-reticulata.html). Casi todos los peces del comercio son de criadero [[6]](https://www.seriouslyfish.com/species/poecilia-reticulata/). En Argentina se cría y se exporta como ornamental, y también está entre los peces de agua dulce más importados en 2024 [[30]](https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Importaciones%20y%20exportaciones%20de%20organismos%20ornamentales%202024.pdf). Fecha de introducción en el país: **PENDIENTE**.

**Temperatura recomendada (valor por defecto en la app): 25 °C** [ESTIMACIÓN: centro del rango ideal 22–28 °C, que es el rango de RSPCA y cae dentro de los de FishBase y Seriously Fish] [[29]](https://www.rspca.org.uk/adviceandwelfare/pets/fish/environment) [[1]](https://www.fishbase.se/summary/Poecilia-reticulata.html) [[6]](https://www.seriouslyfish.com/species/poecilia-reticulata/).

**Temperatura (°C)**

| Parámetro | Valor | Fuente |
|---|---|---|
| Rango de mantenimiento | 22–28 (RSPCA); 17–28 (Seriously Fish); 18–28 (FishBase) | [[29]](https://www.rspca.org.uk/adviceandwelfare/pets/fish/environment) [[6]](https://www.seriouslyfish.com/species/poecilia-reticulata/) [[1]](https://www.fishbase.se/summary/Poecilia-reticulata.html) |
| Ecología | necesita agua bastante cálida (23–24 °C) para sobrevivir en la naturaleza | [[1]](https://www.fishbase.se/summary/Poecilia-reticulata.html) |
| CTmín (laboratorio) | 9,63 °C (promedio, aclimatados a 24 °C; hembras 9,14, machos 10,11) | [[12]](https://www.trjfas.org/pdf.php?id=14952) |
| CTmáx (laboratorio) | 40,53 °C (aclimatados a 24 °C); 39,71–41,80 °C según aclimatación a 20–28 °C; 39,28–41,18 °C con aclimatación a 16,5–30 °C | [[12]](https://www.trjfas.org/pdf.php?id=14952) [[11]](https://www.sciencedirect.com/science/article/abs/pii/S0044848618314388) [[15]](https://periodicos.puc-campinas.edu.br/bioikos/article/view/948) |

**pH:** 7,0–8,0 (FishBase) [[1]](https://www.fishbase.se/summary/Poecilia-reticulata.html); 7,0–8,5 (Seriously Fish) [[6]](https://www.seriouslyfish.com/species/poecilia-reticulata/).

**Dureza y TDS:** 9–19 °dH (≈ 160–338 mg/L CaCO₃) según FishBase [[1]](https://www.fishbase.se/summary/Poecilia-reticulata.html); 8–30 dGH (≈ 142–534 mg/L) según Seriously Fish, que lo describe como pez de agua dura [[6]](https://www.seriouslyfish.com/species/poecilia-reticulata/). **TDS: PENDIENTE** (piso orientativo ≈ 142 mg/L [ESTIMACIÓN], ver Convenciones). Tolera salinidad hasta 25 ppt [[19]](http://ij-aquaticbiology.com/index.php/ijab/article/download/570/505/1904): el agua salobre sube mucho el TDS sin ser un problema en sí.

**Alimentación**

- Dieta: los silvestres son sobre todo insectívoros; los de criadero aceptan casi cualquier alimento [[6]](https://www.seriouslyfish.com/species/poecilia-reticulata/). En la naturaleza come zooplancton, insectos chicos y detritos [[1]](https://www.fishbase.se/summary/Poecilia-reticulata.html).
- Tomas: 2 por día (recomendación de Sirimanna & Dissanayake para guppy y molly) [[19]](http://ij-aquaticbiology.com/index.php/ijab/article/download/570/505/1904); 3 por día en juveniles [[23]](https://vingnanam.sljol.info/articles/4257/files/693c219a931a9.pdf).

Pellets por talla **[ESTIMACIÓN]** (peso con FishBase, a = 0,01288 y b = 3,14 [[1]](https://www.fishbase.se/summary/Poecilia-reticulata.html)):

| Talla (LT) | Peso est. (g) | Tamaño de pellet (mm) | **Pellets por día** | **Pellets por toma** | Tomas/día | % PV/día usado | g/día (secundario) |
|---|---|---|---|---|---|---|---|
| Juvenil 1,5 cm | 0,0460 | 0,5 | **8** | **3** | 3 | 3,0 % | 0,0014 |
| Macho adulto 3,0 cm | 0,406 | 0,5 | **11–22** | **6–11** | 2 | 0,5–1,0 % | 0,0020–0,0041 |
| Hembra adulta 5,0 cm | 2,02 | 0,5 | **55–110** | **28–55** | 2 | 0,5–1,0 % | 0,0101–0,0202 |

**Temperatura para suspender la alimentación:** **PENDIENTE** (ninguna fuente la da). **[Sugerencia de diseño]** Suspender por debajo de 17 °C (debajo de todos los rangos de mantenimiento publicados) y a 32 °C o más (4 °C por encima del máximo de mantenimiento, lejos del CTmáx ≈ 40 °C). Entre 17 y 22 °C, o entre 28 y 32 °C, dar el extremo bajo del rango de pellets.

**Alertas sugeridas para AquaFeed:**

| Variable | Ideal | Advertencia | Crítico |
|---|---|---|---|
| Temperatura | 22–28 °C | 17–22 °C o 28–32 °C | < 17 °C o ≥ 32 °C → suspender la alimentación [sugerencia de diseño] |
| pH | 7,0–8,0 | 6,5–7,0 o 8,0–8,5 (8,5 es el techo de Seriously Fish) | < 6,5 o > 8,5 [sugerencia de diseño: fuera de todos los rangos publicados] |
| Dureza / TDS | 9–19 °dH | 8–9 o 19–30 dGH | < 8 dGH (agua blanda) o TDS PENDIENTE; avisar ante cambios bruscos respecto de la línea de base [sugerencia de diseño] |

**Ambiente recomendado**

| Aspecto | Recomendación | Fuente |
|---|---|---|
| Tipo | **Acuario de interior con calefactor** (en Argentina el agua de un estanque exterior baja de 17 °C en invierno) | [[29]](https://www.rspca.org.uk/adviceandwelfare/pets/fish/environment) [[6]](https://www.seriouslyfish.com/species/poecilia-reticulata/) |
| Volumen mínimo | **≈ 41 L** (base 45 × 30 cm) según Seriously Fish; FishBase pide un acuario de 60 cm como mínimo; RSPCA recomienda tanques de más de 45 × 30 × 30 cm (≈ 40 L) | [[6]](https://www.seriouslyfish.com/species/poecilia-reticulata/) [[1]](https://www.fishbase.se/summary/Poecilia-reticulata.html) [[29]](https://www.rspca.org.uk/adviceandwelfare/pets/fish/environment) |
| Compañía | Grupos de 5 o más (FishBase). Pacífico; no mezclar con peces que muerden aletas (barbo tigre, tetra serpae). Va bien con otros vivíparos, rasboras, corydoras, loricáridos chicos y tetras. Tener **varias hembras por macho** porque los machos acosan a las hembras | [[1]](https://www.fishbase.se/summary/Poecilia-reticulata.html) [[6]](https://www.seriouslyfish.com/species/poecilia-reticulata/) |
| Espacio | RSPCA: 1,5–2 L de agua por cm de pez tropical (sin contar la cola). **[ESTIMACIÓN]** Grupo de 6 (2 machos de 2,5 cm y 4 hembras de 4 cm de LE): 21 cm → 32–42 L | [[29]](https://www.rspca.org.uk/adviceandwelfare/pets/fish/environment) |

### 2.2 Neón tetra — *Paracheirodon innesi*

**Origen:** introducido en Argentina. Nativo de afluentes de aguas negras y claras del río Solimões (alto Amazonas) [[2]](https://www.fishbase.se/summary/Paracheirodon-innesi.html), con registros en Brasil, Colombia y Perú (cuencas del Içá/Putumayo) [[7]](https://www.seriouslyfish.com/species/paracheirodon-innesi/). Los peces comerciales son de criadero y más adaptables que los silvestres [[7]](https://www.seriouslyfish.com/species/paracheirodon-innesi/). En 2024 fue una de las principales especies de agua dulce **importadas** por Argentina como ornamental (junto con el tetra cardenal, el guppy y el neón verde) [[30]](https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Importaciones%20y%20exportaciones%20de%20organismos%20ornamentales%202024.pdf). Fecha de llegada a Argentina: **PENDIENTE**.

**Temperatura recomendada (valor por defecto en la app): 23 °C** [ESTIMACIÓN: centro del rango de Seriously Fish, 21–25 °C, y de FishBase, 20–26 °C] [[7]](https://www.seriouslyfish.com/species/paracheirodon-innesi/) [[2]](https://www.fishbase.se/summary/Paracheirodon-innesi.html). Para reproducción, 24–26 °C [[18]](https://epubs.icar.org.in/index.php/JIFA/article/view/138660).

**Temperatura (°C)**

| Parámetro | Valor | Fuente |
|---|---|---|
| Rango de mantenimiento | 21–25 (Seriously Fish); 20–26 (FishBase) | [[7]](https://www.seriouslyfish.com/species/paracheirodon-innesi/) [[2]](https://www.fishbase.se/summary/Paracheirodon-innesi.html) |
| Reproducción | óptimo para incubar huevos y criar larvas: 24–26 °C | [[18]](https://epubs.icar.org.in/index.php/JIFA/article/view/138660) |
| Letal crónico (CLT) | 33,5 °C (aclimatados 2 semanas a 30,4 °C) | [[16]](https://pubmed.ncbi.nlm.nih.gov/31789229/) |
| CTmáx (laboratorio) | 38,5–39,6 °C (aclimatados a 26–31 °C) | [[16]](https://pubmed.ncbi.nlm.nih.gov/31789229/) |
| Letal / mortalidad | por encima de 35 °C y por debajo de 15 °C causó mortalidad total (LT50, citado en un estudio de mortalidades en Java) | [[17]](https://horizon.documentation.ird.fr/exl-doc/pleins_textes/2022-12/010084433.pdf) |
| Fluctuación | oscilaciones de más de 7 °C entre día y noche se asociaron a brotes de enfermedad y mortalidad masiva en granjas | [[17]](https://horizon.documentation.ird.fr/exl-doc/pleins_textes/2022-12/010084433.pdf) |
| CTmín (laboratorio) | **PENDIENTE** | — |

**pH:** 5,0–7,0 (FishBase) [[2]](https://www.fishbase.se/summary/Paracheirodon-innesi.html); 4,0–7,5 (Seriously Fish) [[7]](https://www.seriouslyfish.com/species/paracheirodon-innesi/).

**Dureza y TDS:** 1–2 °dH (≈ 18–36 mg/L CaCO₃) según FishBase [[2]](https://www.fishbase.se/summary/Paracheirodon-innesi.html); 1–12 dGH (≈ 18–214 mg/L) según Seriously Fish [[7]](https://www.seriouslyfish.com/species/paracheirodon-innesi/). Es un pez de agua blanda. **TDS: PENDIENTE.**

**Alimentación**

- Dieta: omnívoro; en acuario sobrevive con alimento seco, pero conviene variar con larvas de mosquito, bloodworm, *Daphnia*, *Moina* (vivos o congelados) [[7]](https://www.seriouslyfish.com/species/paracheirodon-innesi/). FishBase: gusanos, insectos chicos, crustáceos y material vegetal [[2]](https://www.fishbase.se/summary/Paracheirodon-innesi.html).
- Tomas: **PENDIENTE** para la especie. En un ensayo de cría, los reproductores recibieron 3 tomas por día al 4 % PV de alimento vivo [[18]](https://epubs.icar.org.in/index.php/JIFA/article/view/138660). **[ESTIMACIÓN]** 2 tomas en adultos y 3 en juveniles, como en los vivíparos.

Pellets por talla **[ESTIMACIÓN]** (peso con FishBase, a = 0,01122 y b = 3,08 [[2]](https://www.fishbase.se/summary/Paracheirodon-innesi.html); adulto de ≈ 3 cm LT a partir de 2,5 cm LE):

| Talla (LT) | Peso est. (g) | Tamaño de pellet (mm) | **Pellets por día** | **Pellets por toma** | Tomas/día | % PV/día usado | g/día (secundario) |
|---|---|---|---|---|---|---|---|
| Juvenil 1,5 cm | 0,0391 | 0,5 | **6** | **2** | 3 | 3,0 % | 0,0012 |
| Adulto 3,0 cm | 0,331 | 0,5 | **9–18** | **5–9** | 2 | 0,5–1,0 % | 0,0017–0,0033 |

Por ser tan chico, conviene programar **por cardumen**: un grupo de 10 adultos → **90–180 pellets de 0,5 mm por día** (45–90 por toma) **[ESTIMACIÓN]**.

**Temperatura para suspender la alimentación:** **PENDIENTE** (sin fuente). **[Sugerencia de diseño]** Suspender por debajo de 18 °C (2 °C debajo del mínimo de FishBase y 3 °C por encima de la zona letal < 15 °C) y a 30 °C o más (3,5 °C debajo del letal crónico de 33,5 °C).

**Alertas sugeridas para AquaFeed:**

| Variable | Ideal | Advertencia | Crítico |
|---|---|---|---|
| Temperatura | 21–25 °C | 18–21 °C o 25–30 °C; oscilación diaria > 3 °C [sugerencia de diseño; la fuente asocia > 7 °C a mortalidad] | < 18 °C o ≥ 30 °C → suspender la alimentación [sugerencia de diseño] |
| pH | 5,0–7,0 | 4,0–5,0 o 7,0–7,5 | < 4,0 o > 7,5 [sugerencia de diseño: fuera de todos los rangos publicados] |
| Dureza / TDS | 1–2 °dH (silvestre); hasta 12 dGH (criadero) | 2–12 dGH | > 12 dGH; TDS PENDIENTE; avisar ante cambios bruscos [sugerencia de diseño] |

**Ambiente recomendado**

| Aspecto | Recomendación | Fuente |
|---|---|---|
| Tipo | **Acuario de interior con calefactor** | [[7]](https://www.seriouslyfish.com/species/paracheirodon-innesi/) [[29]](https://www.rspca.org.uk/adviceandwelfare/pets/fish/environment) |
| Volumen mínimo | **≈ 54 L** (base 60 × 30 cm) según Seriously Fish; FishBase: acuario de 60 cm como mínimo | [[7]](https://www.seriouslyfish.com/species/paracheirodon-innesi/) [[2]](https://www.fishbase.se/summary/Paracheirodon-innesi.html) |
| Compañía | **Cardumen**: FishBase dice 5 o más; Seriously Fish recomienda un grupo mixto de **al menos 8–10** y sumar otras especies de cardumen para darles seguridad. Pacífico, ideal para acuario comunitario con carácidos de tamaño parecido, peces hacha, lebiasínidos, corydoras o loricáridos chicos y cíclidos chicos no predadores | [[2]](https://www.fishbase.se/summary/Paracheirodon-innesi.html) [[7]](https://www.seriouslyfish.com/species/paracheirodon-innesi/) |
| Espacio y salud | RSPCA: 1,5–2 L por cm de pez (sin la cola). **[ESTIMACIÓN]** 10 neones de 2,5 cm LE → 38–50 L, compatible con los 54 L de la fuente. Seriously Fish advierte sobre la "enfermedad del neón" | [[29]](https://www.rspca.org.uk/adviceandwelfare/pets/fish/environment) [[7]](https://www.seriouslyfish.com/species/paracheirodon-innesi/) |

### 2.3 Molly de aleta corta / black molly — *Poecilia sphenops*

**Origen:** introducido en Argentina. Nativo de México a Colombia según FishBase [[3]](https://www.fishbase.se/summary/Poecilia-sphenops.html); Seriously Fish da de Venezuela y Colombia hasta México, con poblaciones aisladas en algunas islas del Caribe. Casi todos los peces a la venta se producen en masa en el Lejano Oriente y Europa del Este [[8]](https://www.seriouslyfish.com/species/poecilia-sphenops/). Argentina lo cría y lo exporta como ornamental [[30]](https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Importaciones%20y%20exportaciones%20de%20organismos%20ornamentales%202024.pdf). Fecha de llegada: **PENDIENTE**.

**Temperatura recomendada (valor por defecto en la app): 25 °C** [ESTIMACIÓN: centro del rango ideal 22–28 °C, dentro de Seriously Fish 21–28 °C y FishBase 18–28 °C] [[8]](https://www.seriouslyfish.com/species/poecilia-sphenops/) [[3]](https://www.fishbase.se/summary/Poecilia-sphenops.html).

**Temperatura (°C)**

| Parámetro | Valor | Fuente |
|---|---|---|
| Rango de mantenimiento | 21–28 (Seriously Fish); 18–28 (FishBase) | [[8]](https://www.seriouslyfish.com/species/poecilia-sphenops/) [[3]](https://www.fishbase.se/summary/Poecilia-sphenops.html) |
| Temperatura preferida (laboratorio) | hembras 30–31 °C; machos 23,8–24,2 °C (ciclo térmico simétrico) | [[14]](https://www.redalyc.org/pdf/1750/175015282007.pdf) |
| CTmín (laboratorio) | 7,7 / 8,0 / 9,9 °C aclimatados a 20 / 23 / 26 °C; ≈ 10 °C con ciclo 20–29 °C | [[14]](https://www.redalyc.org/pdf/1750/175015282007.pdf) |
| CTmáx (laboratorio) | 37,5 / 39,0 / 40,0 °C aclimatados a 20 / 23 / 26 °C; 40 °C con ciclo 20–29 °C | [[14]](https://www.redalyc.org/pdf/1750/175015282007.pdf) |
| Letales incipientes | superior 38,8–39,5 °C; inferior 10,8–11,8 °C (ciclos térmicos) | [[14]](https://www.redalyc.org/pdf/1750/175015282007.pdf) |

**pH:** 7,5–8,2 (FishBase) [[3]](https://www.fishbase.se/summary/Poecilia-sphenops.html); 7,0–8,5 (Seriously Fish) [[8]](https://www.seriouslyfish.com/species/poecilia-sphenops/).

**Dureza y TDS:** 11–30 °dH (≈ 196–534 mg/L CaCO₃) según FishBase [[3]](https://www.fishbase.se/summary/Poecilia-sphenops.html); 15–30 dGH (≈ 267–534 mg/L) según Seriously Fish, que pide agua dura y básica (la sal no es necesaria) [[8]](https://www.seriouslyfish.com/species/poecilia-sphenops/). Tolera salinidad hasta 10 ppt [[19]](http://ij-aquaticbiology.com/index.php/ijab/article/download/570/505/1904). **TDS: PENDIENTE.**

**Alimentación**

- Dieta: omnívoro; buena parte de la dieta debe ser vegetal (escamas vegetales, espinaca escaldada) [[8]](https://www.seriouslyfish.com/species/poecilia-sphenops/). En acuario come algas verdes y acepta alimento seco [[3]](https://www.fishbase.se/summary/Poecilia-sphenops.html).
- Tomas: 2 por día [[19]](http://ij-aquaticbiology.com/index.php/ijab/article/download/570/505/1904); juveniles 3 **[ESTIMACIÓN, por analogía con guppy]** [[23]](https://vingnanam.sljol.info/articles/4257/files/693c219a931a9.pdf).

Pellets por talla **[ESTIMACIÓN]** (peso con FishBase, a = 0,01514 y b = 3,12 [[3]](https://www.fishbase.se/summary/Poecilia-sphenops.html)):

| Talla (LT) | Peso est. (g) | Tamaño de pellet (mm) | **Pellets por día** | **Pellets por toma** | Tomas/día | % PV/día usado | g/día (secundario) |
|---|---|---|---|---|---|---|---|
| Juvenil 2,0 cm | 0,132 | 0,5 | **22** | **7** | 3 | 3,0 % | 0,0039 |
| Adulto 6,0 cm | 4,05 | 0,8 | **44–89** | **22–44** | 2 | 0,5–1,0 % | 0,0203–0,0405 |
| Adulto grande 8,0 cm | 9,95 | 0,8 | **110–220** | **54–110** | 2 | 0,5–1,0 % | 0,0497–0,0995 |

**Temperatura para suspender la alimentación:** **PENDIENTE** (sin fuente). **[Sugerencia de diseño]** Suspender por debajo de 18 °C (mínimo de FishBase) y a 32 °C o más.

**Alertas sugeridas para AquaFeed:**

| Variable | Ideal | Advertencia | Crítico |
|---|---|---|---|
| Temperatura | 22–28 °C | 18–22 °C o 28–32 °C | < 18 °C o ≥ 32 °C → suspender la alimentación [sugerencia de diseño] |
| pH | 7,5–8,2 | 7,0–7,5 o 8,2–8,5 | < 7,0 o > 8,5 [sugerencia de diseño] |
| Dureza / TDS | 15–30 dGH | 11–15 dGH | < 11 dGH (agua blanda, fuera de todos los rangos); TDS PENDIENTE |

**Ambiente recomendado**

| Aspecto | Recomendación | Fuente |
|---|---|---|
| Tipo | **Acuario de interior con calefactor, agua dura** | [[8]](https://www.seriouslyfish.com/species/poecilia-sphenops/) |
| Volumen mínimo | **≈ 81 L** (base 90 × 30 cm) según Seriously Fish; FishBase: 60 cm como mínimo | [[8]](https://www.seriouslyfish.com/species/poecilia-sphenops/) [[3]](https://www.fishbase.se/summary/Poecilia-sphenops.html) |
| Compañía | Pacífico, pero solo con peces que toleren el mismo agua dura (no es para cualquier acuario comunitario): otros *Poecilia*, algunos peces arcoíris, barbos y tetras de agua dura. **Varias hembras por macho.** Se hibrida con *P. latipinna*: una sola especie de molly por acuario | [[8]](https://www.seriouslyfish.com/species/poecilia-sphenops/) |
| Espacio | RSPCA: 1,5–2 L por cm de pez. **[ESTIMACIÓN]** 1 macho + 3 hembras de 6 cm LE → 36–48 L de carga; el mínimo sigue siendo el de la fuente (≈ 81 L) | [[29]](https://www.rspca.org.uk/adviceandwelfare/pets/fish/environment) |

### 2.4 Molly vela — *Poecilia latipinna*

**Origen:** introducido en Argentina. Nativo de la costa del sur de Norteamérica y México, desde el drenaje del Cape Fear (Carolina del Norte, EE. UU.) hasta Veracruz; vive también en aguas costeras y salobres [[4]](https://www.fishbase.se/summary/Poecilia-latipinna.html) [[9]](https://www.seriouslyfish.com/species/poecilia-latipinna/). Introducido en muchos países, con impactos negativos [[4]](https://www.fishbase.se/summary/Poecilia-latipinna.html). Argentina lo cría y lo exporta como ornamental; el informe del MAGyP lo llama "molly dálmata" [[30]](https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Importaciones%20y%20exportaciones%20de%20organismos%20ornamentales%202024.pdf). Fecha de llegada: **PENDIENTE**.

**Temperatura recomendada (valor por defecto en la app): 24 °C** [ESTIMACIÓN: centro del rango de Seriously Fish 21–26 °C = 23,5 °C, redondeado hacia el centro del rango de FishBase 20–28 °C] [[9]](https://www.seriouslyfish.com/species/poecilia-latipinna/) [[4]](https://www.fishbase.se/summary/Poecilia-latipinna.html).

**Temperatura (°C)**

| Parámetro | Valor | Fuente |
|---|---|---|
| Rango de mantenimiento | 21–26 (Seriously Fish); 20–28, subtropical (FishBase) | [[9]](https://www.seriouslyfish.com/species/poecilia-latipinna/) [[4]](https://www.fishbase.se/summary/Poecilia-latipinna.html) |
| CTmín (laboratorio) | 6,80–8,63 °C (aclimatación 20–28 °C, Yanar et al. 2019); 7,6 °C (Bierbach et al. 2010) — ambos citados por Özdeş et al. 2021 | [[11]](https://www.sciencedirect.com/science/article/abs/pii/S0044848618314388) [[13]](http://www.egejfas.org/tr/pub/article/809511) |
| CTmáx (laboratorio) | 38,73–41,83 °C (Yanar et al. 2019); 41,0 °C (Bierbach et al. 2010) — citados por Özdeş et al. 2021 | [[11]](https://www.sciencedirect.com/science/article/abs/pii/S0044848618314388) [[13]](http://www.egejfas.org/tr/pub/article/809511) |
| Nota | Yanar et al. la ubican entre las especies con rango térmico más amplio y mejor respuesta de aclimatación | [[11]](https://www.sciencedirect.com/science/article/abs/pii/S0044848618314388) |

**pH:** 7,0–8,5 (Seriously Fish) [[9]](https://www.seriouslyfish.com/species/poecilia-latipinna/). FishBase: **PENDIENTE** (no da pH). Puede vivir en agua dulce si no es blanda ni ácida [[9]](https://www.seriouslyfish.com/species/poecilia-latipinna/).

**Dureza y TDS:** 15–35 dGH (≈ 267–623 mg/L CaCO₃) según Seriously Fish [[9]](https://www.seriouslyfish.com/species/poecilia-latipinna/). Abundante en zanjas de marea y canales salobres [[4]](https://www.fishbase.se/summary/Poecilia-latipinna.html). **TDS: PENDIENTE**; un TDS alto por sal no es en sí un problema para esta especie.

**Alimentación**

- Dieta: los silvestres son casi exclusivamente herbívoros (algas y plantas); los de criadero aceptan de todo, pero hay que incluir material vegetal: si falta, puede atrofiarse el desarrollo de la aleta dorsal del macho [[9]](https://www.seriouslyfish.com/species/poecilia-latipinna/). FishBase: se alimenta sobre todo de algas, también de rotíferos, crustáceos chicos e insectos acuáticos [[4]](https://www.fishbase.se/summary/Poecilia-latipinna.html).
- Tomas: **PENDIENTE** para la especie. **[ESTIMACIÓN]** 2 por día en adultos y 3 en juveniles, por analogía con *P. sphenops* [[19]](http://ij-aquaticbiology.com/index.php/ijab/article/download/570/505/1904) [[23]](https://vingnanam.sljol.info/articles/4257/files/693c219a931a9.pdf).

Pellets por talla **[ESTIMACIÓN]** (peso con FishBase, a = 0,01288 y b = 3,06 [[4]](https://www.fishbase.se/summary/Poecilia-latipinna.html)):

| Talla (LT) | Peso est. (g) | Tamaño de pellet (mm) | **Pellets por día** | **Pellets por toma** | Tomas/día | % PV/día usado | g/día (secundario) |
|---|---|---|---|---|---|---|---|
| Juvenil 2,0 cm | 0,107 | 0,5 | **18** | **6** | 3 | 3,0 % | 0,0032 |
| Hembra adulta 8,0 cm | 7,47 | 0,8 | **82–160** | **41–82** | 2 | 0,5–1,0 % | 0,0374–0,0747 |
| Macho adulto 12,0 cm | 25,8 | 1,1 | **120–230** | **58–120** | 2 | 0,5–1,0 % | 0,129–0,258 |

Para una especie herbívora, conviene que parte de los pellets sea de base vegetal (espirulina).

**Temperatura para suspender la alimentación:** **PENDIENTE** (sin fuente). **[Sugerencia de diseño]** Suspender por debajo de 18 °C y a 32 °C o más.

**Alertas sugeridas para AquaFeed:**

| Variable | Ideal | Advertencia | Crítico |
|---|---|---|---|
| Temperatura | 21–26 °C | 18–21 °C o 26–32 °C (FishBase llega a 28 °C) | < 18 °C o ≥ 32 °C → suspender la alimentación [sugerencia de diseño] |
| pH | 7,0–8,5 | 6,5–7,0 o 8,5–9,0 [sugerencia de diseño] | < 6,5 o > 9,0 [sugerencia de diseño] |
| Dureza / TDS | 15–35 dGH | 10–15 dGH [sugerencia de diseño] | < 10 dGH (agua blanda) [sugerencia de diseño]; TDS PENDIENTE |

**Ambiente recomendado**

| Aspecto | Recomendación | Fuente |
|---|---|---|
| Tipo | **Acuario de interior con calefactor, agua dura** (es el más grande de los cuatro) | [[9]](https://www.seriouslyfish.com/species/poecilia-latipinna/) |
| Volumen mínimo | **≈ 87 L** (base 76 × 38 cm) según Seriously Fish | [[9]](https://www.seriouslyfish.com/species/poecilia-latipinna/) |
| Compañía | Apto para acuario comunitario de agua dura, pero al crecer puede molestar a peces más chicos. Los machos pueden pelear entre sí, sobre todo al reproducirse. Mantener en **tríos (2 hembras por macho)**. Compañeros sugeridos: otros vivíparos, algunos bagres. Una sola especie de molly por acuario (hibridación) | [[9]](https://www.seriouslyfish.com/species/poecilia-latipinna/) [[8]](https://www.seriouslyfish.com/species/poecilia-sphenops/) |
| Espacio | RSPCA: 1,5–2 L por cm de pez. **[ESTIMACIÓN]** Trío (macho de 12 cm y 2 hembras de 8 cm LE): 28 cm → 42–56 L de carga | [[29]](https://www.rspca.org.uk/adviceandwelfare/pets/fish/environment) |

### 2.5 Platy — *Xiphophorus maculatus*

**Origen:** introducido en Argentina. Nativo de la vertiente atlántica de México y América Central: de Veracruz (México) al norte de Belice según FishBase [[5]](https://www.fishbase.se/summary/Xiphophorus-maculatus.html); Seriously Fish menciona México, Guatemala, Belice y Nicaragua [[10]](https://www.seriouslyfish.com/species/xiphophorus-maculatus/). Muchas variedades del comercio son híbridos entre platys, variatus y colas de espada [[24]](https://ask.ifas.ufl.edu/publication/FA054). Argentina lo cría y lo exporta como ornamental [[30]](https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Importaciones%20y%20exportaciones%20de%20organismos%20ornamentales%202024.pdf). Fecha de llegada: **PENDIENTE**.

**Temperatura recomendada (valor por defecto en la app): 23 °C** [ESTIMACIÓN: centro del rango ideal 20–25 °C (coincidencia entre Seriously Fish 20–26 °C y FishBase 18–25 °C) = 22,5 °C, redondeado] [[10]](https://www.seriouslyfish.com/species/xiphophorus-maculatus/) [[5]](https://www.fishbase.se/summary/Xiphophorus-maculatus.html).

**Temperatura (°C)**

| Parámetro | Valor | Fuente |
|---|---|---|
| Rango de mantenimiento | 20–26 (Seriously Fish); 18–25 (FishBase) | [[10]](https://www.seriouslyfish.com/species/xiphophorus-maculatus/) [[5]](https://www.fishbase.se/summary/Xiphophorus-maculatus.html) |
| CTmín (laboratorio) | 9,41 / 10,42 / 11,95 °C aclimatados a 20 / 24 / 28 °C; 10,20 °C (24 °C, promedio de sexos) | [[13]](http://www.egejfas.org/tr/pub/article/809511) [[12]](https://www.trjfas.org/pdf.php?id=14952) |
| CTmáx (laboratorio) | 37,41 / 39,19 / 40,52 °C aclimatados a 20 / 24 / 28 °C; 39,51 °C (24 °C) | [[13]](http://www.egejfas.org/tr/pub/article/809511) [[12]](https://www.trjfas.org/pdf.php?id=14952) |
| Nota de la fuente | su baja tolerancia al frío limita su cultivo al aire libre en climas subtropicales donde el agua baja a 10 °C en invierno | [[13]](http://www.egejfas.org/tr/pub/article/809511) |

**pH:** 7,0–8,0 (FishBase) [[5]](https://www.fishbase.se/summary/Xiphophorus-maculatus.html); 7,0–8,2 (Seriously Fish) [[10]](https://www.seriouslyfish.com/species/xiphophorus-maculatus/).

**Dureza y TDS:** 9–19 °dH (≈ 160–338 mg/L CaCO₃) según FishBase [[5]](https://www.fishbase.se/summary/Xiphophorus-maculatus.html); 10–30 dGH (≈ 178–534 mg/L) según Seriously Fish [[10]](https://www.seriouslyfish.com/species/xiphophorus-maculatus/). **TDS: PENDIENTE.**

**Alimentación**

- Dieta: nada exigente; acepta alimento congelado, vivo o seco [[10]](https://www.seriouslyfish.com/species/xiphophorus-maculatus/). FishBase: gusanos, crustáceos, insectos y materia vegetal [[5]](https://www.fishbase.se/summary/Xiphophorus-maculatus.html).
- Tomas: los alevines crecen rápido con 2–3 tomas por día [[10]](https://www.seriouslyfish.com/species/xiphophorus-maculatus/). Adultos: **PENDIENTE** para la especie; **[ESTIMACIÓN]** 2 por día, como en los *Poecilia* [[19]](http://ij-aquaticbiology.com/index.php/ijab/article/download/570/505/1904).

Pellets por talla **[ESTIMACIÓN]** (peso con FishBase, a = 0,01047 y b = 3,14 [[5]](https://www.fishbase.se/summary/Xiphophorus-maculatus.html)):

| Talla (LT) | Peso est. (g) | Tamaño de pellet (mm) | **Pellets por día** | **Pellets por toma** | Tomas/día | % PV/día usado | g/día (secundario) |
|---|---|---|---|---|---|---|---|
| Juvenil 1,5 cm | 0,0374 | 0,5 | **6** | **2** | 3 | 3,0 % | 0,0011 |
| Macho adulto 3,5 cm | 0,535 | 0,5 | **15–29** | **7–15** | 2 | 0,5–1,0 % | 0,0027–0,0053 |
| Hembra adulta 5,0 cm | 1,64 | 0,5 | **45–90** | **22–45** | 2 | 0,5–1,0 % | 0,0082–0,0164 |

**Temperatura para suspender la alimentación:** **PENDIENTE** (sin fuente). **[Sugerencia de diseño]** Suspender por debajo de 18 °C (mínimo de FishBase) y a 30 °C o más (4 °C sobre el máximo de mantenimiento).

**Alertas sugeridas para AquaFeed:**

| Variable | Ideal | Advertencia | Crítico |
|---|---|---|---|
| Temperatura | 20–25 °C | 18–20 °C o 25–30 °C (Seriously Fish llega a 26 °C) | < 18 °C o ≥ 30 °C → suspender la alimentación [sugerencia de diseño] |
| pH | 7,0–8,0 | 8,0–8,2 o 6,8–7,0 [sugerencia de diseño] | < 6,8 o > 8,2 [sugerencia de diseño] |
| Dureza / TDS | 10–19 dGH | 9–10 o 19–30 dGH | < 9 dGH; TDS PENDIENTE |

**Ambiente recomendado**

| Aspecto | Recomendación | Fuente |
|---|---|---|
| Tipo | **Acuario de interior con calefactor**, preferentemente plantado | [[10]](https://www.seriouslyfish.com/species/xiphophorus-maculatus/) |
| Volumen mínimo | **≈ 54 L** (base 60 × 30 cm) según Seriously Fish; FishBase: 60 cm como mínimo | [[10]](https://www.seriouslyfish.com/species/xiphophorus-maculatus/) [[5]](https://www.fishbase.se/summary/Xiphophorus-maculatus.html) |
| Compañía | Muy pacífico; va con la mayoría de las especies de acuario comunitario. Sin la agresividad de algunos colas de espada y mollies; los machos se toleran entre sí. Con machos y hembras juntos, **más hembras que machos**. Se reproduce solo en el acuario comunitario: si no se quieren crías, tener solo machos | [[10]](https://www.seriouslyfish.com/species/xiphophorus-maculatus/) |
| Espacio | RSPCA: 1,5–2 L por cm de pez. **[ESTIMACIÓN]** 1 macho de 3 cm + 3 hembras de 4 cm LE → 15 cm → 23–30 L de carga; el mínimo sigue siendo el de la fuente | [[29]](https://www.rspca.org.uk/adviceandwelfare/pets/fish/environment) |

## 3. Principales discrepancias y límites

1. **Cantidad de pellets:** el cálculo por % PV (UF/IFAS 0,5–1 %) da bastantes más pellets que la guía de Hikari para un pez de tamaño parecido (≈ 28–55 frente a 12 pellets/día). Los ensayos de crecimiento usan raciones 10 veces mayores. Sin un dato por especie, se recomienda arrancar por el extremo bajo y calibrar.
2. **Peso del pellet:** se usó el de un pellet de trucha que se hunde (BioMar). Los micro-pellets tropicales semiflotantes probablemente pesan menos, lo que aumentaría la cantidad de pellets para la misma ración en gramos.
3. **Tamaño de pellet:** falta el ancho de boca de cada especie (PENDIENTE); los cortes 0,5 / 0,8 / 1,1 mm son estimaciones.
4. **Temperatura de corte:** ninguna fuente da una temperatura de suspensión de la alimentación para estas especies; los valores son sugerencias de diseño derivadas de los rangos de mantenimiento y de los límites de laboratorio.
5. **Guppy:** FishBase (18–28 °C) y Seriously Fish (17–28 °C) permiten más frío que RSPCA (22–28 °C) y que el dato ecológico de FishBase (23–24 °C para sobrevivir en la naturaleza).
6. **Neón:** FishBase da agua muy blanda (1–2 °dH, pH 5–7); Seriously Fish acepta hasta 12 dGH y pH 7,5 para peces de criadero.
7. **CTmín de guppy:** Yanar et al. 2023 dan 9,63 °C (24 °C). Özdeş et al. 2021 citan para guppy (Yanar et al. 2019) 9,41–11,95 °C, las mismas cifras que para platy; puede ser un error de cita, por eso se usó el dato directo de 2023.
8. **TDS:** no hay rangos de TDS publicados para ninguna de las especies (PENDIENTE); solo dureza y, en los mollies y el guppy, tolerancia a la salinidad.

## 4. Lista de pendientes

- Rango de TDS con fuente para las 4 especies (hoy solo hay dureza).
- Temperatura de suspensión de la alimentación con fuente, para las 4 especies (hoy es sugerencia de diseño).
- Ancho de boca por talla (para validar el tamaño de pellet).
- Ración (% PV/día) específica para adultos de cada especie en acuario; tomas por día en neón, molly vela y platy adulto.
- Peso real por pellet del micro-pellet que se use (pesar 100 pellets).
- CTmín del neón tetra.
- pH del molly vela en FishBase (Seriously Fish sí lo da).
- Fecha de introducción en Argentina de las 4 especies.

## 5. Fuentes

1. FishBase — *Poecilia reticulata* (pH, dureza, temperatura, distribución, largo máximo, relación largo-peso, acuario). https://www.fishbase.se/summary/Poecilia-reticulata.html
2. FishBase — *Paracheirodon innesi*. https://www.fishbase.se/summary/Paracheirodon-innesi.html
3. FishBase — *Poecilia sphenops*. https://www.fishbase.se/summary/Poecilia-sphenops.html
4. FishBase — *Poecilia latipinna*. https://www.fishbase.se/summary/Poecilia-latipinna.html
5. FishBase — *Xiphophorus maculatus*. https://www.fishbase.se/summary/Xiphophorus-maculatus.html
6. Seriously Fish — *Poecilia reticulata* (guía de acuarismo). https://www.seriouslyfish.com/species/poecilia-reticulata/
7. Seriously Fish — *Paracheirodon innesi*. https://www.seriouslyfish.com/species/paracheirodon-innesi/
8. Seriously Fish — *Poecilia sphenops*. https://www.seriouslyfish.com/species/poecilia-sphenops/
9. Seriously Fish — *Poecilia latipinna*. https://www.seriouslyfish.com/species/poecilia-latipinna/
10. Seriously Fish — *Xiphophorus maculatus*. https://www.seriouslyfish.com/species/xiphophorus-maculatus/
11. Yanar, M., Erdoğan, E. & Kumlu, M. (2019). Thermal tolerance of thirteen popular ornamental fish species. Aquaculture 501:382–386 (resumen). https://www.sciencedirect.com/science/article/abs/pii/S0044848618314388
12. Yanar, M., Evliyaoğlu, E. & Tekelioğlu, B. K. (2023). Sex Differences in Thermal Tolerance of Nine Ornamental Fish Species from the Poecilidae, Cichlidae and Cyprinidae Family. Turkish Journal of Fisheries and Aquatic Sciences 23(6), TRJFAS22738. https://www.trjfas.org/pdf.php?id=14952
13. Özdeş, A., Erdoğan, E. & Evliyaoğlu, E. (2021). Farklı alıştırma sıcaklıklarında kılıçkuyruk (*Xiphophorus helleri*) ve plati (*X. maculatus*) balıklarının termal tolerans parametrelerinin belirlenmesi. Ege Journal of Fisheries and Aquatic Sciences (Su Ürünleri Dergisi). http://www.egejfas.org/tr/pub/article/809511
14. Hernández-Rodríguez, M. & Bückle-Ramírez, L. F. (2010). Preference, tolerance and resistance responses of *Poecilia sphenops* to thermal fluctuations. Latin American Journal of Aquatic Research 38(3):427–437. https://www.redalyc.org/pdf/1750/175015282007.pdf
15. Resistencia de la temperatura y salinidad en *Poecilia reticulata* Peters, 1859. Revista Bioikos (PUC-Campinas). https://periodicos.puc-campinas.edu.br/bioikos/article/view/948
16. Temperature tolerance and oxygen consumption of two South American tetras, *Paracheirodon innesi* and *Hyphessobrycon herbertaxelrodi*. Journal of Thermal Biology (2019) — resumen en PubMed. https://pubmed.ncbi.nlm.nih.gov/31789229/
17. A case study on mortality of neon tetra (*Paracheirodon innesi*) associated with the seasonal climate transitions in West Java, Indonesia. IOP Conf. Series: Earth and Environmental Science 521:012022 (2020). https://horizon.documentation.ird.fr/exl-doc/pleins_textes/2022-12/010084433.pdf
18. Kadtan, N. et al. (2016). Effect of temperature on incubation period and hatching success of neon tetra, *Paracheirodon innesi*, eggs. Journal of the Indian Fisheries Association. https://epubs.icar.org.in/index.php/JIFA/article/view/138660
19. Sirimanna, S. R. & Dissanayake, C. (2019). Effects of culture conditions on growth and survival of *Poecilia sphenops* and *Poecilia reticulata*. International Journal of Aquatic Biology. http://ij-aquaticbiology.com/index.php/ijab/article/download/570/505/1904
20. Effect of different commercial feeds on growth and reproductive performance of guppy, *Poecilia reticulata*. Journal of the University of Ruhuna 7(1). https://jur.sljol.info/articles/10.4038/jur.v7i1.7930
21. UF/IFAS Extension — VM114/FA096: Fish Nutrition. https://ask.ifas.ufl.edu/publication/FA096
22. Aquarium Science — 3.3.1 Amount in Depth (sitio de divulgación; se usa solo como referencia secundaria). https://aquariumscience.org/3-3-1-amount-in-depth/
23. Essential Nutritional Requirements and Effective Feeding Strategies for Commercially Important Ornamental Fish: A Review. Vingnanam Journal of Science (Sri Lanka). https://vingnanam.sljol.info/articles/4257/files/693c219a931a9.pdf
24. UF/IFAS Extension — Circular 5/FA054: Freshwater Ornamental Fish Commonly Cultured in Florida (vivíparos, hibridación de *Xiphophorus*). https://ask.ifas.ufl.edu/publication/FA054
25. Aquarium Co-Op — Xtreme Nano 0,5 mm (ficha de producto: micro-pellet de 0,5 mm para tetras, vivíparos y alevines). https://www.aquariumcoop.com/products/xtreme-nano-0-5mm-pellet
26. Hikari Sales USA — Micro Pellets (ficha de producto con guía de pellets por toma). https://hikariusa.com/tropical_folder/micro_pellets.html
27. The Fish Site — How big are your fish pellets? (regla del 25–50 % del ancho de boca). https://thefishsite.com/articles/how-big-are-your-fish-pellets
28. BioMar — Ficha técnica INICIO Plus (trucha): pellets por kg. https://www.naturewater.ru/upload/iblock/10a/10ac1373d93147007daf983dd9276c25.pdf
29. RSPCA — Choosing an aquarium for pet fish (tamaño de acuario, litros por cm de pez, temperatura de guppies). https://www.rspca.org.uk/adviceandwelfare/pets/fish/environment
30. MAGyP, Dirección Nacional de Acuicultura — Importación y exportación de organismos ornamentales 2024. https://www.magyp.gob.ar/sitio/areas/acuicultura/estadisticas/_archivos/000000_Importaciones%20y%20exportaciones%20de%20organismos%20ornamentales%202024.pdf
31. Rusydi, A. F. (2018). Correlation between conductivity and total dissolved solid in various type of water: A review. IOP Conf. Ser.: Earth Environ. Sci. 118:012019. https://iopscience.iop.org/article/10.1088/1755-1315/118/1/012019/pdf

---
*Nota metodológica:* los números entre corchetes remiten a esta lista. Todo lo marcado [ESTIMACIÓN] es cálculo propio con la fórmula indicada; las alertas marcadas como "sugerencia de diseño" son criterios de ingeniería para AquaFeed, no datos biológicos publicados.
