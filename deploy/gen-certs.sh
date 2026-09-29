#!/usr/bin/env bash
# Genera la CA y los certificados MQTT (mTLS).
#   sudo ./gen-certs.sh server <dominio-o-IP>... -> CA (si no existe) + certificado del broker
#                                                  (el primer nombre es el CN; todos van al SAN)
#   sudo ./gen-certs.sh client <CN>             -> certificado de cliente (api, device1, device2...)
# La CA y todos los certificados quedan en /etc/aquafeed/pki (solo root).
set -euo pipefail

PKI=/etc/aquafeed/pki
mkdir -p "$PKI"
chmod 700 "$PKI"
cd "$PKI"

if [ ! -f ca.key ]; then
  openssl genrsa -out ca.key 4096
  openssl req -x509 -new -key ca.key -sha256 -days 3650 \
    -subj "/CN=AquaFeed-IoT-CA" -out ca.crt
  echo "CA creada en $PKI/ca.crt"
fi

case "${1:-}" in
  server)
    shift
    HOST="${1:?Falta IP o dominio del servidor}"
    SAN="DNS:localhost,IP:127.0.0.1"
    for H in "$@"; do
      if [[ "$H" =~ ^[0-9.]+$ ]]; then
        SAN="$SAN,IP:$H,DNS:$H"
      else
        SAN="$SAN,DNS:$H"
      fi
    done
    openssl genrsa -out server.key 2048
    openssl req -new -key server.key -subj "/CN=$HOST" -out server.csr
    openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial \
      -days 1825 -sha256 -out server.crt \
      -extfile <(printf "subjectAltName=%s\nkeyUsage=critical,digitalSignature,keyEncipherment\nextendedKeyUsage=serverAuth\n" "$SAN")
    rm server.csr
    echo "Certificado del broker: $PKI/server.crt (SAN: $SAN)"
    ;;
  client)
    CN="${2:?Falta el CN del cliente (ej. api, device1)}"
    openssl genrsa -out "$CN.key" 2048
    openssl req -new -key "$CN.key" -subj "/CN=$CN" -out "$CN.csr"
    openssl x509 -req -in "$CN.csr" -CA ca.crt -CAkey ca.key -CAcreateserial \
      -days 1825 -sha256 -out "$CN.crt" \
      -extfile <(printf "keyUsage=critical,digitalSignature,keyEncipherment\nextendedKeyUsage=clientAuth\n")
    rm "$CN.csr"
    echo "Certificado de cliente: $PKI/$CN.crt / $PKI/$CN.key"
    ;;
  *)
    echo "Uso: $0 server <dominio-o-IP>... | client <CN>" >&2
    exit 1
    ;;
esac
