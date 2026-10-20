// AquaFeed - Simulador de sensores para ESP32 sin el prototipo armado.
//
// Usa el mismo contrato MQTT que firmware/aquafeed (ver firmware/README.md), pero en vez
// de leer sensores genera valores que varían de a poco. Sirve para probar la web con la
// placa sola, sin motor, sondas ni relé.
//
// - El botón BOOT de la placa hace de pulsador de alimentación.
// - El LED de la placa (GPIO 2) parpadea una vez por porción cuando llega un "feed".
// - Desde el monitor serie (115200) se pueden forzar valores: escribir "ayuda".
//
// Necesita config.h con el broker y los certificados, igual que el firmware real
// (copiar ../aquafeed/config.example.h). Sin certificados válidos igual muestra la
// telemetría por el monitor serie, pero no llega a la web.

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <WiFiManager.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <time.h>

#include "config.h"
#include "horarios.h"

#define FW_VERSION "sim-1.1.0"

#define BOTON 0  // botón BOOT
#define LED   2  // LED azul de la placa

#define PORCIONES_MAX 10

const unsigned long INTERVALO_TELEMETRIA = 5000;
const unsigned long INTERVALO_STATUS = 60000;
const unsigned long INTERVALO_REINTENTO_MQTT = 5000;

unsigned long ultimaTelemetria = 0;
unsigned long ultimoStatus = 0;
unsigned long ultimoIntentoMqtt = 0;


// =====================================================
//                 SENSORES SIMULADOS
// =====================================================

// Cada valor se mueve despacio hacia su objetivo, con un poco de ruido.
// En modo automático el objetivo oscila como un ciclo día/noche comprimido en 10 minutos.
struct Sensor {
  const char* nombre;
  float valor;
  float base;       // centro en modo automático
  float amplitud;   // oscilación en modo automático
  float ruido;      // ruido por lectura
  float minimo, maximo;
  bool fijo;        // objetivo fijado a mano desde el monitor serie
  float objetivo;
  bool falla;       // simula sensor desconectado (va null y a sensorErrors)
};

Sensor temp = { "temp", 25.0, 25.0, 1.5, 0.05,  0,   40,   false, 25.0, false };
Sensor ph   = { "ph",    7.2,  7.2, 0.3, 0.02,  0,   14,   false,  7.2, false };
Sensor tds  = { "tds",   300,  300,  40, 3.0,   0, 2000,   false,  300, false };

const float PERIODO_CICLO_MS = 10 * 60 * 1000.0;

float aleatorio(float max) {
  return ((float)random(-10000, 10001) / 10000.0) * max;
}

void actualizar(Sensor& s, float fase) {

  float objetivo = s.fijo ? s.objetivo : s.base + s.amplitud * sin(fase);

  // Se acerca un 15% al objetivo en cada lectura: un cambio forzado tarda ~30 s en notarse del todo
  s.valor += (objetivo - s.valor) * 0.15 + aleatorio(s.ruido);
  s.valor = constrain(s.valor, s.minimo, s.maximo);
}

void actualizarSensores() {

  float fase = 2 * PI * fmod((float)millis(), PERIODO_CICLO_MS) / PERIODO_CICLO_MS;

  actualizar(temp, fase);
  actualizar(ph, fase + 1.0);   // desfasados para que no suban y bajen juntos
  actualizar(tds, fase + 2.0);
}


// =====================================================
//                         MQTT
// =====================================================

WiFiClientSecure secureClient;
PubSubClient mqtt(secureClient);

char deviceId[16];

char topicTelemetry[48];
char topicStatus[48];
char topicEvent[48];
char topicAck[48];
char topicCmd[48];
char topicConfig[48];

bool statusPendiente = false;

struct {
  bool pendiente;
  char cmdId[40];
  int porciones;
} comando = { false, "", 0 };

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
  snprintf(topicConfig,    sizeof(topicConfig),    "aquafeed/v1/%s/config",    deviceId);
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
  doc["configVersion"] = calendario.version;

  publicar(topicStatus, doc, true);
}


void publicarAlimentacion(const char* origen, int porciones, const char* cmdId, long ts = 0) {

  JsonDocument doc;

  doc["type"] = "feed";
  doc["source"] = origen;
  doc["portions"] = porciones;
  doc["ts"] = ts ? ts : (long)time(nullptr);

  if (cmdId[0])
    doc["cmdId"] = cmdId;

  publicar(topicEvent, doc, false);
}


void alRecibirMensaje(char* topic, byte* payload, unsigned int length) {

  if (strcmp(topic, topicConfig) == 0) {
    if (calendarioRecibir(payload, length))
      statusPendiente = true;
    return;
  }

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

  if (mqtt.connect(deviceId, nullptr, nullptr, topicStatus, 1, true, "{\"online\":false}")) {

    Serial.println("OK");

    mqtt.subscribe(topicCmd, 1);
    mqtt.subscribe(topicConfig, 1);
    publicarStatus();
    ultimoStatus = millis();

    for (int i = 0; i < cantidadSinInformar; i++)
      publicarAlimentacion("schedule", tomasSinInformar[i].porciones, "", tomasSinInformar[i].ts);
    cantidadSinInformar = 0;
  }

  else {

    // -2: no hay conexión TLS (certificado inválido o broker inaccesible)
    // 5: el broker rechazó el certificado
    Serial.print("fallo, estado ");
    Serial.println(mqtt.state());
  }
}


void sincronizarHora() {

  configTzTime(calendario.tz, "pool.ntp.org", "time.nist.gov");

  Serial.print("[HORA] Sincronizando");

  unsigned long inicio = millis();

  while (time(nullptr) < 1700000000 && millis() - inicio < 15000) {
    Serial.print(".");
    delay(500);
  }

  Serial.println(time(nullptr) < 1700000000 ? " sin hora, se reintenta sola" : " OK");
}


// =====================================================
//                     TELEMETRÍA
// =====================================================

void publicarTelemetria() {

  actualizarSensores();

  JsonDocument doc;

  doc["ts"] = (long)time(nullptr);

  JsonArray errores = doc["sensorErrors"].to<JsonArray>();

  if (temp.falla) {
    doc["waterTempC"] = nullptr;
    errores.add("waterTemp");
  } else {
    doc["waterTempC"] = serialized(String(temp.valor, 2));
  }

  if (ph.falla) {
    doc["ph"] = nullptr;
    errores.add("ph");
  } else {
    doc["ph"] = serialized(String(ph.valor, 2));
  }

  if (tds.falla) {
    doc["tdsPpm"] = nullptr;
    errores.add("tds");
  } else {
    doc["tdsPpm"] = (int)round(tds.valor);
  }

  Serial.print(mqtt.connected() ? "[TELEMETRIA] " : "[TELEMETRIA sin MQTT] ");
  serializeJson(doc, Serial);
  Serial.println();

  if (mqtt.connected())
    publicar(topicTelemetry, doc, false);
}


// =====================================================
//                     DOSIFICADOR
// =====================================================

// Sin motor: un parpadeo del LED por porción
void dosificar(int porciones) {

  Serial.print("[DOSIFICADOR] Porciones: ");
  Serial.println(porciones);

  for (int i = 0; i < porciones; i++) {
    digitalWrite(LED, HIGH);
    delay(250);
    digitalWrite(LED, LOW);
    delay(250);
  }
}


int estadoAnterior = HIGH;
unsigned long ultimoRebote = 0;

void revisarPulsador() {

  int estadoBoton = digitalRead(BOTON);

  if (estadoBoton == LOW && estadoAnterior == HIGH && millis() - ultimoRebote > 50) {

    ultimoRebote = millis();

    Serial.println("[DOSIFICADOR] Boton BOOT presionado");

    dosificar(1);

    if (mqtt.connected())
      publicarAlimentacion("button", 1, "");
  }

  estadoAnterior = estadoBoton;
}


void revisarCalendario() {

  int porciones = calendarioTomaPendiente();

  if (!porciones)
    return;

  Serial.println("[CALENDARIO] Toma programada");
  dosificar(porciones);

  if (mqtt.connected())
    publicarAlimentacion("schedule", porciones, "");
  else
    calendarioGuardarSinInformar((long)time(nullptr), porciones);
}


void atenderComando() {

  if (!comando.pendiente)
    return;

  comando.pendiente = false;

  bool repetido = comando.cmdId[0] && strcmp(comando.cmdId, ultimoCmdId) == 0;

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
//                 COMANDOS POR MONITOR SERIE
// =====================================================

void mostrarAyuda() {

  Serial.println();
  Serial.println("Comandos (monitor serie, fin de linea: Nueva linea):");
  Serial.println("  temp 30      fija la temperatura objetivo (°C)");
  Serial.println("  ph 5.5       fija el pH objetivo");
  Serial.println("  tds 900      fija el TDS objetivo (ppm)");
  Serial.println("  auto         vuelve todos los sensores a modo automatico");
  Serial.println("  falla temp   simula sensor desconectado (temp, ph o tds); repetir para reconectar");
  Serial.println("  feed 2       simula el pulsador con N porciones");
  Serial.println("  estado       muestra valores y conexion");
  Serial.println("  horarios     muestra el calendario guardado y la hora local");
  Serial.println();
}

Sensor* buscarSensor(const String& nombre) {
  if (nombre == "temp") return &temp;
  if (nombre == "ph") return &ph;
  if (nombre == "tds") return &tds;
  return nullptr;
}

void procesarLinea(String linea) {

  linea.trim();
  linea.toLowerCase();

  if (linea.length() == 0)
    return;

  int espacio = linea.indexOf(' ');
  String orden = espacio < 0 ? linea : linea.substring(0, espacio);
  String arg = espacio < 0 ? "" : linea.substring(espacio + 1);
  arg.trim();

  Sensor* s = buscarSensor(orden);

  if (s && arg.length()) {
    s->fijo = true;
    s->objetivo = constrain(arg.toFloat(), s->minimo, s->maximo);
    Serial.printf("[SIM] %s -> %.2f (se acerca de a poco)\n", s->nombre, s->objetivo);
  }

  else if (orden == "auto") {
    temp.fijo = ph.fijo = tds.fijo = false;
    Serial.println("[SIM] Todos los sensores en modo automatico");
  }

  else if (orden == "falla" && buscarSensor(arg)) {
    Sensor* f = buscarSensor(arg);
    f->falla = !f->falla;
    Serial.printf("[SIM] %s %s\n", f->nombre, f->falla ? "DESCONECTADO" : "reconectado");
  }

  else if (orden == "feed") {
    int porciones = constrain(arg.length() ? arg.toInt() : 1, 1, PORCIONES_MAX);
    dosificar(porciones);
    if (mqtt.connected())
      publicarAlimentacion("button", porciones, "");
  }

  else if (orden == "estado") {
    Serial.printf("[SIM] ID %s | WiFi %s | MQTT %s\n", deviceId,
                  WiFi.status() == WL_CONNECTED ? "OK" : "no",
                  mqtt.connected() ? "OK" : "no");
    Serial.printf("[SIM] temp %.2f%s | ph %.2f%s | tds %.0f%s\n",
                  temp.valor, temp.fijo ? " (fijo)" : "",
                  ph.valor, ph.fijo ? " (fijo)" : "",
                  tds.valor, tds.fijo ? " (fijo)" : "");
  }

  else if (orden == "horarios") {
    calendarioMostrar();
    time_t ahora = time(nullptr);
    struct tm local;
    localtime_r(&ahora, &local);
    Serial.printf("[SIM] Hora local: %02d:%02d:%02d, dia ISO %d\n", local.tm_hour, local.tm_min,
                  local.tm_sec, local.tm_wday == 0 ? 7 : local.tm_wday);
  }

  else {
    mostrarAyuda();
  }
}

void leerSerie() {

  static String linea;

  while (Serial.available()) {

    char c = Serial.read();

    if (c == '\n' || c == '\r') {
      procesarLinea(linea);
      linea = "";
    } else if (linea.length() < 40) {
      linea += c;
    }
  }
}


// =====================================================
//                    SETUP Y LOOP
// =====================================================

void setup() {

  Serial.begin(115200);
  delay(1000);

  randomSeed(esp_random());

  armarIdentidad();

  Serial.println();
  Serial.println("======================================");
  Serial.println("     AQUAFEED - ESP32 (SIMULADOR)");
  Serial.println("======================================");
  Serial.print("ID del dispositivo: ");
  Serial.println(deviceId);

  pinMode(BOTON, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
  digitalWrite(LED, LOW);

  mostrarAyuda();

  WiFiManager wm;

  // BOOT apretado durante el arranque: borra el WiFi guardado
  if (digitalRead(BOTON) == LOW) {
    Serial.println("[WIFI] BOOT apretado: se borra el WiFi guardado");
    wm.resetSettings();
  }

  // Si la red guardada no responde en 20 s, vuelve a abrir AquaFeed-Setup
  wm.setConnectTimeout(20);
  wm.setConfigPortalTimeout(180);

  if (!wm.autoConnect("AquaFeed-Setup")) {
    Serial.println("[WIFI] Sin conexion. Reiniciando...");
    delay(3000);
    ESP.restart();
  }

  Serial.print("[WIFI] Conectado, IP ");
  Serial.println(WiFi.localIP());

  calendarioCargar();
  sincronizarHora();

  secureClient.setCACert(CA_CERT);
  secureClient.setCertificate(CLIENT_CERT);
  secureClient.setPrivateKey(CLIENT_KEY);

  mqtt.setServer(MQTT_HOST, MQTT_PORT);
  mqtt.setCallback(alRecibirMensaje);
  mqtt.setBufferSize(1024);

  Serial.println("Simulador iniciado.");
}

void loop() {

  conectarMqtt();
  mqtt.loop();

  leerSerie();
  revisarPulsador();
  atenderComando();
  revisarCalendario();

  if (statusPendiente && mqtt.connected()) {
    statusPendiente = false;
    publicarStatus();
  }

  unsigned long ahora = millis();

  if (ahora - ultimaTelemetria >= INTERVALO_TELEMETRIA) {
    ultimaTelemetria = ahora;
    publicarTelemetria();
  }

  if (mqtt.connected() && ahora - ultimoStatus >= INTERVALO_STATUS) {
    ultimoStatus = ahora;
    publicarStatus();
  }
}
