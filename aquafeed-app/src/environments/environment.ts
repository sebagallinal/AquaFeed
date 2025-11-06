// environment.ts - Configuración de desarrollo
// NOTA: Apuntando al servidor de producción para desarrollo
// porque el servidor local requiere certificados MQTT

export const environment = {
  production: false,
  apiUrl: 'http://aquafeed.com.ar/api',
  frontendUrl: 'http://localhost:4200',
  websocketUrl: 'http://aquafeed.com.ar'
};
