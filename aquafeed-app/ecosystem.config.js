// El frontend (dist/aquafeed-app/browser) lo sirve Nginx; ver deploy/nginx-aquafeed.conf
// Los secretos (JWT_SECRET) van en aquafeed-app/.env, que no se versiona
module.exports = {
  apps: [
    {
      name: 'aquafeed-backend',
      script: 'server/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        MQTT_URL: 'mqtts://localhost:8883',
        MQTT_CA: '/etc/aquafeed/mqtt/ca.crt',
        MQTT_CLIENT_CERT: '/etc/aquafeed/mqtt/api.crt',
        MQTT_CLIENT_KEY: '/etc/aquafeed/mqtt/api.key'
      }
    }
  ]
};
