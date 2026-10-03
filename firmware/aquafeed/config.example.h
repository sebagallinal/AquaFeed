// Copiar como config.h (no se versiona) y completar con los datos de este dispositivo.

#define MQTT_HOST "aquafeed.com.ar"  // o "35.173.129.81": el certificado del broker acepta ambos
#define MQTT_PORT 8883

// CA de AquaFeed: /etc/aquafeed/pki/ca.crt (la misma para todos los dispositivos)
static const char CA_CERT[] = R"EOF(
-----BEGIN CERTIFICATE-----
...
-----END CERTIFICATE-----
)EOF";

// Certificado de este dispositivo: /etc/aquafeed/pki/af-<mac>.crt
static const char CLIENT_CERT[] = R"EOF(
-----BEGIN CERTIFICATE-----
...
-----END CERTIFICATE-----
)EOF";

// Clave privada de este dispositivo: /etc/aquafeed/pki/af-<mac>.key
static const char CLIENT_KEY[] = R"EOF(
-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----
)EOF";
