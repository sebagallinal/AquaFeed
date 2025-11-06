module.exports = {
  apps: [
    {
      name: 'aquafeed-backend',
      script: 'server/server.js',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        JWT_SECRET: 'UNIVERSIDADcaece2025AQUAFEEDSECRET',
      }
    },
    {
      name: 'aquafeed-frontend',
      script: 'serve',
      env: {
        PM2_SERVE_PATH: './dist/aquafeed-app',
        PM2_SERVE_PORT: 4200,
        PM2_SERVE_SPA: 'true',
        PM2_SERVE_HOMEPAGE: '/index.html'
      }
    }
  ]
};
