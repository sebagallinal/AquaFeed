# Formato de Datos MQTT para AquaFeed

## Topics MQTT

Tu sistema Arduino/ESP32 debe publicar datos en los siguientes topics:

### 1. Datos de Agua
**Topic:** `aquafeed/{deviceId}/agua`

**Formato JSON:**
```json
{
  "id": "1",
  "tempAgua": 25.5,
  "ph": 7.2,
  "minerales": 1
}
```

**Campos:**
- `id` (string): ID del dispositivo
- `tempAgua` (float): Temperatura del agua en °C
- `ph` (float): Nivel de pH del agua (0-14)
- `minerales` (int): Nivel de minerales (0-n)

### 2. Datos de Ambiente
**Topic:** `aquafeed/{deviceId}/ambiente`

**Formato JSON:**
```json
{
  "id": "1",
  "tempAmb": 24.8,
  "humAmb": 41
}
```

**Campos:**
- `id` (string): ID del dispositivo
- `tempAmb` (float): Temperatura ambiente en °C
- `humAmb` (int): Humedad ambiente en %

## Ejemplo de Código Arduino/ESP32

```cpp
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// Configuración WiFi
const char* ssid = "TU_WIFI";
const char* password = "TU_PASSWORD";

// Configuración MQTT
const char* mqtt_server = "IP_DEL_SERVIDOR";
const int mqtt_port = 8883; // o 1883 si no usas SSL
const char* device_id = "1"; // ID de tu dispositivo

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);
  
  // Conectar WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi conectado");
  
  // Configurar MQTT
  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  
  // Publicar datos cada 5 segundos
  static unsigned long lastPublish = 0;
  if (millis() - lastPublish > 5000) {
    publishWaterData();
    publishAmbientData();
    lastPublish = millis();
  }
}

void publishWaterData() {
  // Crear documento JSON
  StaticJsonDocument<200> doc;
  
  // Leer sensores (reemplazar con tus valores reales)
  doc["id"] = device_id;
  doc["tempAgua"] = readWaterTemperature();
  doc["ph"] = readPH();
  doc["minerales"] = readMinerals();
  
  // Serializar a string
  char jsonBuffer[200];
  serializeJson(doc, jsonBuffer);
  
  // Publicar
  String topic = "aquafeed/" + String(device_id) + "/agua";
  client.publish(topic.c_str(), jsonBuffer);
  
  Serial.println("Datos de agua publicados: " + String(jsonBuffer));
}

void publishAmbientData() {
  StaticJsonDocument<200> doc;
  
  doc["id"] = device_id;
  doc["tempAmb"] = readAmbientTemperature();
  doc["humAmb"] = readHumidity();
  
  char jsonBuffer[200];
  serializeJson(doc, jsonBuffer);
  
  String topic = "aquafeed/" + String(device_id) + "/ambiente";
  client.publish(topic.c_str(), jsonBuffer);
  
  Serial.println("Datos de ambiente publicados: " + String(jsonBuffer));
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Conectando a MQTT...");
    if (client.connect("device1")) { // ID del cliente MQTT
      Serial.println("conectado");
      
      // Suscribirse al topic de alimentar
      String feedTopic = "aquafeed/" + String(device_id) + "/alimentar";
      client.subscribe(feedTopic.c_str());
    } else {
      Serial.print("falló, rc=");
      Serial.print(client.state());
      Serial.println(" reintentando en 5 segundos");
      delay(5000);
    }
  }
}

// Funciones de ejemplo para leer sensores
float readWaterTemperature() {
  // Implementar lectura de sensor de temperatura
  return 25.5;
}

float readPH() {
  // Implementar lectura de sensor de pH
  return 7.2;
}

int readMinerals() {
  // Implementar lectura de sensor de minerales
  return 1;
}

float readAmbientTemperature() {
  // Implementar lectura de sensor DHT o similar
  return 22.3;
}

float readHumidity() {
  // Implementar lectura de sensor DHT o similar
  return 65.0;
}
```

## Características del Sistema

### ✅ Datos en Tiempo Real
- El dashboard se actualiza automáticamente cuando recibe nuevos datos
- No es necesario refrescar la página manualmente
- Indicador visual de conexión WebSocket

### ✅ Interfaz Visual
- Cada dispositivo tiene su propia tarjeta
- Los valores se muestran con formato legible
- Indicador de tiempo transcurrido desde la última actualización
- Animación visual cuando se reciben datos nuevos

### ✅ Múltiples Dispositivos
- Puedes tener varios dispositivos publicando datos simultáneamente
- Cada dispositivo se identifica por su ID único
- Los datos se organizan por dispositivo en el dashboard

## Notas Importantes

1. **Frecuencia de Publicación**: Se recomienda publicar datos cada 5 segundos para balance entre actualización y uso de red

2. **Formato JSON**: Es crucial que los datos se publiquen en formato JSON válido

3. **Device ID**: El ID del dispositivo debe ser único para cada dispositivo en tu red

4. **Campos Opcionales**: No es obligatorio enviar todos los campos. Si un sensor no está disponible, simplemente omite ese campo del JSON

5. **Timestamp**: El servidor añade automáticamente un timestamp (`ts`) a cada mensaje recibido

## Testing

Para probar el sistema sin hardware, puedes usar `mosquitto_pub`:

```bash
# Publicar datos de agua
mosquitto_pub -h localhost -p 1883 -t "aquafeed/1/agua" -m '{"id":"1","tempAgua":25.5,"ph":7.2,"minerales":1}'

# Publicar datos de ambiente
mosquitto_pub -h localhost -p 1883 -t "aquafeed/1/ambiente" -m '{"id":"1","tempAmb":24.8,"humAmb":41}'
```
