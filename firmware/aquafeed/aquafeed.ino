#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <WiFiManager.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <Stepper.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <time.h>

// Broker y certificados de este dispositivo. No se versiona: copiar config.example.h
#include "config.h"

#define FW_VERSION "1.0.0"


// =====================================================
//                  DISTRIBUCIÓN DE PINES
// =====================================================

// Sensores
#define PH_PIN    34
#define TDS_PIN   35
#define TEMP_PIN  27

// Pulsador
#define BOTON     12

// Relé bomba de agua
#define RELE      13

// Motor paso a paso 28BYJ-48
#define IN1       26
#define IN2       25
#define IN3       14
#define IN4       32


// =====================================================
//                  MOTOR PASO A PASO
// =====================================================

#define PASOS_VUELTA 2048
#define PASOS_POR_POSICION 108

// Tope de porciones por comando, por si llega un valor disparatado
#define PORCIONES_MAX 10

Stepper motor(PASOS_VUELTA, IN1, IN3, IN2, IN4);


// =====================================================
//                       DS18B20
// =====================================================

OneWire oneWire(TEMP_PIN);
DallasTemperature sensors(&oneWire);


// =====================================================
//                         PH
// =====================================================

#define VREF 3.3
#define ADC_MAX 4095.0

// ---------------- CALIBRACIÓN ----------------

// Vinagre
#define VOLTAJE_ACIDO 4.515
#define PH_ACIDO 2.5

// Agua destilada
#define VOLTAJE_NEUTRO 4.050
#define PH_NEUTRO 7.0

// Bicarbonato
#define VOLTAJE_BASICO 3.700
#define PH_BASICO 8.5

float phFiltrado = 7.0;


// =====================================================
//                     TEMPORIZADORES
// =====================================================

unsigned long ultimoPH = 0;
unsigned long ultimaTelemetria = 0;
unsigned long ultimoStatus = 0;
unsigned long ultimoIntentoMqtt = 0;

const unsigned long INTERVALO_PH = 500;
const unsigned long INTERVALO_TELEMETRIA = 5000;
const unsigned long INTERVALO_STATUS = 60000;
const unsigned long INTERVALO_REINTENTO_MQTT = 5000;


// =====================================================
//                       PULSADOR
// =====================================================

int estadoAnterior = HIGH;

unsigned long ultimoRebote = 0;
const unsigned long DEBOUNCE = 50;


// =====================================================
//                         MQTT
// =====================================================

WiFiClientSecure secureClient;
PubSubClient mqtt(secureClient);

// "af-" + MAC. Es el CN del certificado y el {id} de los topics aquafeed/v1/{id}/...
char deviceId[16];

char topicTelemetry[48];
char topicStatus[48];
char topicEvent[48];
char topicAck[48];
char topicCmd[48];

// El comando se anota en el callback y se ejecuta en el loop, para no mover
// el motor ni publicar desde adentro del callback de PubSubClient
struct {
  bool pendiente;
  char cmdId[40];
  int porciones;
} comando = { false, "", 0 };

// Con QoS 1 el broker puede repetir un comando: no se alimenta dos veces
char ultimoCmdId[40] = "";


void armarIdentidad() {

  uint64_t mac = ESP.getEfuseMac();
  uint8_t* b = (uint8_t*)&mac;

  snprintf(deviceId, sizeof(deviceId), "af-%02x%02x%02x%02x%02x%02x",
           b[0], b[1], b[2], b[3], b[4], b[5]);

  snprintf(topicTelemetry, sizeof(topicTelemetry), "aquafeed/v1/%s/telemetry", deviceId);
  snprintf(topicStatus,    sizeof(topicStatus),    "aquafeed/v1/%s/status",    deviceId);
  snprintf(topicEvent,     sizeof(topicEvent),     "aquafeed/v1/%s/event",     deviceId);
  snprintf(topicAck,       sizeof(topicAck),       "aquafeed/v1/%s/ack",       deviceId);
  snprintf(topicCmd,       sizeof(topicCmd),       "aquafeed/v1/%s/cmd",       deviceId);
}


void publicar(const char* topic, JsonDocument& doc, bool retenido) {

  char buffer[256];

  size_t largo = serializeJson(doc, buffer, sizeof(buffer));

  if (!mqtt.publish(topic, (const uint8_t*)buffer, largo, retenido)) {

    Serial.print("[MQTT] No se pudo publicar en ");
    Serial.println(topic);
  }
}


void publicarStatus() {

  JsonDocument doc;

  doc["online"] = true;
  doc["fw"] = FW_VERSION;
  doc["rssi"] = WiFi.RSSI();

  publicar(topicStatus, doc, true);
}


// origen: "button" o "cmd"
void publicarAlimentacion(const char* origen, int porciones, const char* cmdId) {

  JsonDocument doc;

  doc["type"] = "feed";
  doc["source"] = origen;
  doc["portions"] = porciones;
  doc["ts"] = (long)time(nullptr);

  if (cmdId[0])
    doc["cmdId"] = cmdId;

  publicar(topicEvent, doc, false);
}


void alRecibirMensaje(char* topic, byte* payload, unsigned int length) {

  JsonDocument doc;

  if (deserializeJson(doc, payload, length)) {

    Serial.println("[MQTT] Comando con JSON invalido");

    return;
  }

  const char* tipo = doc["type"] | "";

  if (strcmp(tipo, "feed") != 0)
    return;

  strlcpy(comando.cmdId, doc["cmdId"] | "", sizeof(comando.cmdId));

  comando.porciones = constrain(doc["portions"] | 1, 1, PORCIONES_MAX);
  comando.pendiente = true;
}


void conectarMqtt() {

  if (mqtt.connected() || WiFi.status() != WL_CONNECTED)
    return;

  if (millis() - ultimoIntentoMqtt < INTERVALO_REINTENTO_MQTT && ultimoIntentoMqtt != 0)
    return;

  ultimoIntentoMqtt = millis();

  Serial.print("[MQTT] Conectando a ");
  Serial.print(MQTT_HOST);
  Serial.print("... ");

  // Si el dispositivo se cae, el broker publica online:false por él
  if (mqtt.connect(deviceId, nullptr, nullptr, topicStatus, 1, true, "{\"online\":false}")) {

    Serial.println("OK");

    mqtt.subscribe(topicCmd, 1);

    publicarStatus();

    ultimoStatus = millis();
  }

  else {

    Serial.print("fallo, estado ");
    Serial.println(mqtt.state());
  }
}


// La hora hace falta para validar el certificado del broker y para el ts de los mensajes
void sincronizarHora() {

  configTime(0, 0, "pool.ntp.org", "time.nist.gov");

  Serial.print("[HORA] Sincronizando");

  unsigned long inicio = millis();

  while (time(nullptr) < 1700000000 && millis() - inicio < 15000) {

    Serial.print(".");

    delay(500);
  }

  Serial.println(time(nullptr) < 1700000000 ? " sin hora, se reintenta sola" : " OK");
}


// =====================================================
//                    FUNCIONES BOMBA
// =====================================================

void encenderBomba() {

  digitalWrite(RELE, LOW);

  Serial.println("[BOMBA] Encendida");
}


void apagarBomba() {

  digitalWrite(RELE, HIGH);

  Serial.println("[BOMBA] Apagada");
}


// =====================================================
//                     LEER PH
// =====================================================

void leerPH() {

  const int NUM_LECTURAS = 50;

  long suma = 0;

  for (int i = 0; i < NUM_LECTURAS; i++) {

    suma += analogRead(PH_PIN);

    delay(2);
  }

  float rawPromedio = suma / (float)NUM_LECTURAS;

  float adcVoltage =
    (rawPromedio * VREF) / ADC_MAX;


  // Divisor resistivo:
  // Po --- 4.7K --- GPIO34 --- 4.7K --- GND
  float poVoltage = adcVoltage * 2.0;


  float phNuevo;


  // Zona ácida
  if (poVoltage >= VOLTAJE_NEUTRO) {

    phNuevo =
      PH_NEUTRO +
      (poVoltage - VOLTAJE_NEUTRO) *
      (PH_ACIDO - PH_NEUTRO) /
      (VOLTAJE_ACIDO - VOLTAJE_NEUTRO);
  }

  // Zona básica
  else {

    phNuevo =
      PH_NEUTRO +
      (poVoltage - VOLTAJE_NEUTRO) *
      (PH_BASICO - PH_NEUTRO) /
      (VOLTAJE_BASICO - VOLTAJE_NEUTRO);
  }


  if (phNuevo < 0)
    phNuevo = 0;

  if (phNuevo > 14)
    phNuevo = 14;


  phFiltrado =
    (phFiltrado * 0.90) +
    (phNuevo * 0.10);
}


// =====================================================
//                     LEER TDS
// =====================================================

float leerTDS() {

  int raw = analogRead(TDS_PIN);

  float voltage =
    raw * VREF / ADC_MAX;

  return
    (133.42 * voltage * voltage * voltage
     - 255.86 * voltage * voltage
     + 857.39 * voltage) * 0.5;
}


// =====================================================
//                     TELEMETRÍA
// =====================================================

void publicarTelemetria() {

  // La conversión del DS18B20 se pidió en la vuelta anterior, así no se
  // bloquea el loop los ~750 ms que tarda
  float temperatura = sensors.getTempCByIndex(0);

  sensors.requestTemperatures();

  float tds = leerTDS();


  JsonDocument doc;

  doc["ts"] = (long)time(nullptr);

  JsonArray errores = doc["sensorErrors"].to<JsonArray>();

  if (temperatura == DEVICE_DISCONNECTED_C) {

    doc["waterTempC"] = nullptr;

    errores.add("waterTemp");
  }

  else {

    doc["waterTempC"] = serialized(String(temperatura, 2));
  }

  doc["ph"] = serialized(String(phFiltrado, 2));
  doc["tdsPpm"] = (int)round(tds);


  Serial.print("[TELEMETRIA] ");
  serializeJson(doc, Serial);
  Serial.println();


  if (mqtt.connected())
    publicar(topicTelemetry, doc, false);
}


// =====================================================
//                     DOSIFICADOR
// =====================================================

void dosificar(int porciones) {

  Serial.print("[DOSIFICADOR] Porciones: ");
  Serial.println(porciones);

  for (int i = 0; i < porciones; i++) {

    motor.step(-PASOS_POR_POSICION);
  }

  // Apagar bobinas después del movimiento
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, LOW);
}


void revisarPulsador() {

  int estadoBoton = digitalRead(BOTON);


  if (estadoBoton == LOW &&
      estadoAnterior == HIGH &&
      millis() - ultimoRebote > DEBOUNCE) {

    ultimoRebote = millis();

    Serial.println("[DOSIFICADOR] Pulsador detectado");

    dosificar(1);

    // Sin conexión la alimentación se hace igual, pero no queda registrada
    if (mqtt.connected())
      publicarAlimentacion("button", 1, "");
  }


  estadoAnterior = estadoBoton;
}


void atenderComando() {

  if (!comando.pendiente)
    return;

  comando.pendiente = false;


  bool repetido =
    comando.cmdId[0] &&
    strcmp(comando.cmdId, ultimoCmdId) == 0;

  if (!repetido) {

    dosificar(comando.porciones);

    strlcpy(ultimoCmdId, comando.cmdId, sizeof(ultimoCmdId));

    publicarAlimentacion("cmd", comando.porciones, comando.cmdId);
  }


  JsonDocument doc;

  doc["cmdId"] = comando.cmdId;
  doc["ok"] = true;

  publicar(topicAck, doc, false);
}


// =====================================================
//                         SETUP
// =====================================================

void setup() {

  Serial.begin(115200);

  delay(1000);

  armarIdentidad();


  Serial.println();
  Serial.println("======================================");
  Serial.println("          AQUAFEED - ESP32");
  Serial.println("======================================");

  // Con este ID se genera el certificado: sudo ./gen-certs.sh client <ID>
  Serial.print("ID del dispositivo: ");
  Serial.println(deviceId);


  // ---------------------------------------------------
  // ADC
  // ---------------------------------------------------

  analogReadResolution(12);

  pinMode(PH_PIN, INPUT);
  pinMode(TDS_PIN, INPUT);


  // ---------------------------------------------------
  // Pulsador
  // ---------------------------------------------------

  pinMode(BOTON, INPUT_PULLUP);


  // ---------------------------------------------------
  // Relé
  // ---------------------------------------------------

  pinMode(RELE, OUTPUT);

  digitalWrite(RELE, HIGH);


  // ---------------------------------------------------
  // Motor
  // ---------------------------------------------------

  motor.setSpeed(10);


  // ---------------------------------------------------
  // Temperatura DS18B20
  // ---------------------------------------------------

  sensors.begin();
  sensors.setWaitForConversion(false);
  sensors.requestTemperatures();

  Serial.print("Sensores DS18B20 encontrados: ");
  Serial.println(sensors.getDeviceCount());


  // ---------------------------------------------------
  // Bomba
  // ---------------------------------------------------

  encenderBomba();


  // ---------------------------------------------------
  // WiFi
  // ---------------------------------------------------

  // Sin red guardada levanta el AP "AquaFeed-Setup" para cargar el WiFi desde el celular
  WiFiManager wm;

  wm.setConfigPortalTimeout(180);

  if (!wm.autoConnect("AquaFeed-Setup")) {

    Serial.println("[WIFI] Sin conexion. Reiniciando...");

    delay(3000);

    ESP.restart();
  }

  Serial.print("[WIFI] Conectado, IP ");
  Serial.println(WiFi.localIP());

  sincronizarHora();


  // ---------------------------------------------------
  // MQTT (TLS mutuo)
  // ---------------------------------------------------

  secureClient.setCACert(CA_CERT);
  secureClient.setCertificate(CLIENT_CERT);
  secureClient.setPrivateKey(CLIENT_KEY);

  mqtt.setServer(MQTT_HOST, MQTT_PORT);
  mqtt.setCallback(alRecibirMensaje);
  mqtt.setBufferSize(512);


  Serial.println();
  Serial.println("Sistema iniciado.");
  Serial.println();
}


// =====================================================
//                          LOOP
// =====================================================

void loop() {

  unsigned long ahora = millis();


  conectarMqtt();

  mqtt.loop();


  revisarPulsador();

  atenderComando();


  // PH cada 500 ms (alimenta el filtro)
  if (ahora - ultimoPH >= INTERVALO_PH) {

    ultimoPH = ahora;

    leerPH();
  }


  // Telemetría cada 5 segundos
  if (ahora - ultimaTelemetria >= INTERVALO_TELEMETRIA) {

    ultimaTelemetria = ahora;

    publicarTelemetria();
  }


  // Status cada 1 minuto, para refrescar la señal WiFi
  if (mqtt.connected() && ahora - ultimoStatus >= INTERVALO_STATUS) {

    ultimoStatus = ahora;

    publicarStatus();
  }
}
