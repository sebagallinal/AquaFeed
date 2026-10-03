#!/usr/bin/env bash
# Simula un ESP32 con firmware v1: publica telemetría aleatoria cada 5 s, para probar
# la web sin la placa. Ejecutar en el servidor:
#   sudo ./deploy/simular-dispositivo.sh [id] [minutos]
# El certificado del dispositivo simulado se genera la primera vez.
set -euo pipefail

ID="${1:-af-000000000001}"
MINUTOS="${2:-10}"
PKI=/etc/aquafeed/pki
DIR="$(cd "$(dirname "$0")" && pwd)"

[ -f "$PKI/$ID.crt" ] || "$DIR/gen-certs.sh" client "$ID"

pub() {  # pub <tipo> <payload> [opciones de mosquitto_pub]
  local tipo="$1" payload="$2"; shift 2
  mosquitto_pub -h localhost -p 8883 --cafile "$PKI/ca.crt" --cert "$PKI/$ID.crt" --key "$PKI/$ID.key" \
    -i "$ID" -t "aquafeed/v1/$ID/$tipo" -m "$payload" "$@"
}

trap 'pub status "{\"online\":false}" -r -q 1' EXIT
pub status '{"online":true,"fw":"sim","rssi":-55}' -r -q 1

FIN=$(( $(date +%s) + MINUTOS * 60 ))
while [ "$(date +%s)" -lt "$FIN" ]; do
  TEMP=$(awk -v r=$RANDOM 'BEGIN { printf "%.2f", 22 + r / 32767 * 6 }')    # 22 a 28 °C
  PH=$(awk -v r=$RANDOM 'BEGIN { printf "%.2f", 6.2 + r / 32767 * 2 }')     # 6.2 a 8.2
  TDS=$(( 150 + RANDOM % 400 ))                                             # 150 a 550 ppm
  pub telemetry "{\"ts\":$(date +%s),\"waterTempC\":$TEMP,\"ph\":$PH,\"tdsPpm\":$TDS,\"sensorErrors\":[]}"
  sleep 5
done
