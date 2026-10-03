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
| `aquafeed/v1/{id}/status` | ESP32 → backend, retenido | `{"online":true,"fw":"1.0.0","rssi":-61}`; si se cae, el broker publica `{"online":false}` |
| `aquafeed/v1/{id}/cmd` | backend → ESP32 | `{"cmdId":"<uuid>","type":"feed","portions":2}` |
| `aquafeed/v1/{id}/ack` | ESP32 → backend | `{"cmdId":"<uuid>","ok":true}` |
| `aquafeed/v1/{id}/event` | ESP32 → backend | `{"type":"feed","source":"button","portions":1,"ts":1791000000}`; con `source: "cmd"` incluye `cmdId` |

`ts` es epoch UTC en segundos. Un sensor caído va en `null` y suma su código a `sensorErrors` (hoy solo `waterTemp`).

`aquafeed/v1/{id}/config` (horarios) está reservado en la ACL y todavía no se implementa.
