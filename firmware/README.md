# Firmware

Sketch de Arduino para el ESP32: motor 28BYJ-48, pH PH-4502C, temperatura DS18B20, TDS y relé de la bomba. Se conecta al broker por MQTT con TLS mutuo.

## Librerías (Arduino IDE)

WiFiManager (tzapu), PubSubClient, ArduinoJson 7, OneWire, DallasTemperature y Stepper.

## Alta de un dispositivo

1. Copiar `aquafeed/config.example.h` como `aquafeed/config.h` y pegar la CA (`/etc/aquafeed/pki/ca.crt`).
2. Grabar el sketch y leer en el monitor serie (115200) la línea `ID del dispositivo: af-xxxxxxxxxxxx`.
3. En el servidor, generar el certificado con ese ID como nombre:
   ```bash
   sudo ./deploy/gen-certs.sh client af-xxxxxxxxxxxx
   ```
4. Pegar `af-xxxxxxxxxxxx.crt` y `af-xxxxxxxxxxxx.key` en `config.h` y volver a grabar.
5. La primera vez, conectarse desde el celular a la red `AquaFeed-Setup` y cargar el WiFi.

`config.h` tiene la clave privada del dispositivo y no se sube al repo.

## Contrato MQTT

`{id}` es `af-` + MAC en minúsculas y coincide con el CN del certificado. La ACL del broker solo deja a cada dispositivo usar sus propios topics.

| Topic | Sentido | Payload |
| --- | --- | --- |
| `aquafeed/v1/{id}/telemetry` | ESP32 → backend, cada 5 s | `{"ts":1791000000,"waterTempC":24.5,"ph":7.12,"tdsPpm":310,"sensorErrors":[]}` |
| `aquafeed/v1/{id}/status` | ESP32 → backend, retenido | `{"online":true,"fw":"1.1.0","rssi":-61,"configVersion":3}`; si se cae, el broker publica `{"online":false}` |
| `aquafeed/v1/{id}/cmd` | backend → ESP32 | `{"cmdId":"<uuid>","type":"feed","portions":2}` |
| `aquafeed/v1/{id}/ack` | ESP32 → backend | `{"cmdId":"<uuid>","ok":true}` |
| `aquafeed/v1/{id}/event` | ESP32 → backend | `{"type":"feed","source":"button","portions":1,"ts":1791000000}`; `source` es `button`, `cmd` (incluye `cmdId`) o `schedule` |
| `aquafeed/v1/{id}/config` | backend → ESP32, retenido | `{"version":3,"tz":"<-03>3","schedules":[{"days":[1,2,3,4,5],"time":"08:30","portions":2}]}` |

`ts` es epoch UTC en segundos. Un sensor caído va en `null` y suma su código a `sensorErrors` (hoy solo `waterTemp`).

## Calendario de alimentación

El backend publica el calendario completo y retenido en `config` cada vez que se guarda desde la web, así el ESP32 lo recibe al conectarse aunque estuviera apagado. `days` usa ISO (1 = lunes … 7 = domingo), `time` es la hora local y `tz` la zona POSIX (Argentina: `<-03>3`). Solo viajan los horarios activos.

El ESP32 guarda el calendario en la flash (NVS) y lo cumple solo, aunque no haya WiFi. Solo necesita haber sincronizado la hora por NTP una vez desde que arrancó. Cada toma se informa como `event` con `source: "schedule"`; las que se hicieron sin conexión se informan al reconectar, con el `ts` de cuando ocurrieron (hasta 8). En el `status` informa `configVersion`, y la web lo usa para mostrar si la pecera ya tiene el último calendario.

`horarios.h` está igual en `aquafeed/` y en `simulador/`: si se cambia uno, copiarlo al otro.

## Simulador

`simulador/` es el mismo contrato sin sensores: genera temperatura, pH y TDS que varían de a poco, el botón BOOT hace de pulsador y el LED azul parpadea una vez por porción. Sirve para probar la web con una placa sola. Lleva su propio `config.h` (mismo formato) y en el monitor serie acepta `temp 30`, `ph 5.5`, `tds 900`, `falla temp`, `feed 2`, `horarios`, `estado` y `auto`.
