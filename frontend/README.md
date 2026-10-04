# Frontend

App Angular de AquaFeed. Cómo correrla, las cuentas de desarrollo y la forma de reemplazar el mock están en el [README de la raíz](../README.md).

Angular 22.2, componentes standalone, signals, TypeScript estricto y Angular Material. Los textos de la interfaz están en español rioplatense.

```bash
npm ci
npm start
npm run lint
npm run format:check
npm test
npm run build
```

`npm test` observa cambios en una terminal. En CI se usa `npm run test:ci`.
