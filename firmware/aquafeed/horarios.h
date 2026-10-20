// Calendario de alimentación del ESP32.
//
// El backend publica el calendario completo, retenido, en aquafeed/v1/{id}/config:
//   {"version":3,"tz":"<-03>3","schedules":[{"days":[1,2,3,4,5],"time":"08:30","portions":2}]}
// days: ISO (1 = lunes … 7 = domingo). tz: zona horaria POSIX.
//
// El calendario se guarda en la memoria flash (NVS), así sigue alimentando aunque se corte
// el WiFi o se reinicie. Lo único que necesita es haber sincronizado la hora una vez desde
// el último arranque.
//
// Este archivo está repetido igual en firmware/aquafeed y firmware/simulador: si se cambia
// uno, copiarlo al otro.

#pragma once

#include <Arduino.h>
#include <ArduinoJson.h>
#include <Preferences.h>
#include <time.h>

#define HORARIOS_MAX 8
#define HORARIOS_PORCIONES_MAX 10
#define HORARIOS_PENDIENTES_MAX 8

struct TomaProgramada {
  uint8_t dias;       // bit n encendido = día ISO n (1..7)
  uint8_t hora;
  uint8_t minuto;
  uint8_t porciones;
};

struct Calendario {
  int version;
  char tz[32];
  uint8_t cantidad;
  TomaProgramada tomas[HORARIOS_MAX];
};

Calendario calendario = { 0, "<-03>3", 0, {} };

// Último mensaje de config aplicado, tal cual llegó. Se compara el contenido y no solo la
// versión, por si la base del backend se reinicia y las versiones vuelven a empezar.
String calendarioCrudo;

// Tomas hechas sin conexión al broker: se informan al reconectar
struct TomaHecha {
  long ts;
  uint8_t porciones;
};

TomaHecha tomasSinInformar[HORARIOS_PENDIENTES_MAX];
uint8_t cantidadSinInformar = 0;


bool calendarioDesdeJson(const char* json, size_t largo, Calendario& c) {

  JsonDocument doc;

  if (deserializeJson(doc, json, largo))
    return false;

  c.version = doc["version"] | 0;
  strlcpy(c.tz, doc["tz"] | "<-03>3", sizeof(c.tz));
  c.cantidad = 0;

  for (JsonObject s : doc["schedules"].as<JsonArray>()) {

    if (c.cantidad >= HORARIOS_MAX)
      break;

    int hora, minuto;
    const char* texto = s["time"] | "";

    if (sscanf(texto, "%d:%d", &hora, &minuto) != 2 || hora < 0 || hora > 23 || minuto < 0 || minuto > 59)
      continue;

    uint8_t dias = 0;

    for (int d : s["days"].as<JsonArray>()) {
      if (d >= 1 && d <= 7)
        dias |= 1 << d;
    }

    if (!dias)
      continue;

    TomaProgramada& t = c.tomas[c.cantidad++];

    t.dias = dias;
    t.hora = hora;
    t.minuto = minuto;
    t.porciones = constrain(s["portions"] | 1, 1, HORARIOS_PORCIONES_MAX);
  }

  return true;
}


void calendarioAplicarZona() {

  setenv("TZ", calendario.tz, 1);
  tzset();
}


void calendarioMostrar() {

  Serial.printf("[CALENDARIO] Version %d, %d horario(s), zona %s\n",
                calendario.version, calendario.cantidad, calendario.tz);

  const char* nombres = "?LMXJVSD";

  for (int i = 0; i < calendario.cantidad; i++) {

    TomaProgramada& t = calendario.tomas[i];
    char dias[8] = "";
    int n = 0;

    for (int d = 1; d <= 7; d++) {
      if (t.dias & (1 << d))
        dias[n++] = nombres[d];
    }

    dias[n] = 0;

    Serial.printf("  %02d:%02d  %-7s  %d porcion(es)\n", t.hora, t.minuto, dias, t.porciones);
  }
}


// Al arrancar: el último calendario recibido, aunque no haya red
void calendarioCargar() {

  Preferences prefs;

  prefs.begin("aquafeed", true);
  String guardado = prefs.getString("calendario", "");
  prefs.end();

  if (guardado.length() && calendarioDesdeJson(guardado.c_str(), guardado.length(), calendario)) {
    calendarioCrudo = guardado;
    calendarioMostrar();
  }
  else
    Serial.println("[CALENDARIO] Sin horarios guardados");

  calendarioAplicarZona();
}


// Mensaje de aquafeed/v1/{id}/config. Devuelve true si el calendario cambió.
bool calendarioRecibir(const uint8_t* payload, unsigned int largo) {

  String crudo((const char*)payload, largo);

  // El mensaje retenido llega de nuevo en cada reconexión: no se reescribe la flash si no cambió
  if (crudo == calendarioCrudo)
    return false;

  Calendario nuevo;

  if (!calendarioDesdeJson(crudo.c_str(), crudo.length(), nuevo)) {
    Serial.println("[CALENDARIO] Config con JSON invalido");
    return false;
  }

  calendario = nuevo;
  calendarioCrudo = crudo;
  calendarioAplicarZona();

  Preferences prefs;

  prefs.begin("aquafeed", false);
  prefs.putString("calendario", crudo);
  prefs.end();

  calendarioMostrar();

  return true;
}


// Llamar en cada vuelta del loop. Devuelve las porciones a dar en este minuto (0 si no toca).
int calendarioTomaPendiente() {

  time_t ahora = time(nullptr);

  // Sin hora sincronizada no se sabe qué día ni qué hora es
  if (ahora < 1700000000)
    return 0;

  static long ultimoMinuto = -1;
  long minuto = ahora / 60;

  if (minuto == ultimoMinuto)
    return 0;

  ultimoMinuto = minuto;

  struct tm local;
  localtime_r(&ahora, &local);

  int diaIso = local.tm_wday == 0 ? 7 : local.tm_wday;
  int porciones = 0;

  for (int i = 0; i < calendario.cantidad; i++) {

    TomaProgramada& t = calendario.tomas[i];

    if ((t.dias & (1 << diaIso)) && t.hora == local.tm_hour && t.minuto == local.tm_min)
      porciones += t.porciones;
  }

  return min(porciones, HORARIOS_PORCIONES_MAX);
}


void calendarioGuardarSinInformar(long ts, int porciones) {

  if (cantidadSinInformar < HORARIOS_PENDIENTES_MAX)
    tomasSinInformar[cantidadSinInformar++] = { ts, (uint8_t)porciones };
}
