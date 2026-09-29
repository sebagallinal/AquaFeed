// environment.ts - Configuración de desarrollo
// La API se sirve bajo /api en el mismo origen (Nginx en producción,
// proxy.conf.json con `ng serve` en desarrollo local)

export const environment = {
  production: false,
  apiUrl: '/api',
  frontendUrl: 'http://localhost:4200',
  websocketUrl: 'http://35.173.129.81'
};
