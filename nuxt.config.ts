export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  modules: ['@nuxtjs/tailwindcss'],
  runtimeConfig: {
    // Ruta del archivo de la base de datos SQLite integrada (se crea sola si no existe)
    dbPath: process.env.NURSE_DB_PATH || '.data/nursing.db',
    // Password del usuario admin sembrado la primera vez que se crea la base de datos
    seedAdminPassword: process.env.NURSE_ADMIN_PASSWORD || 'admin123',
  },
  nitro: {
    // El módulo node:sqlite y el sistema de archivos requieren un runtime Node,
    // por lo que no se puede usar un preset "edge" (vercel-edge, cloudflare, etc.)
    preset: process.env.NITRO_PRESET || 'node-server',
  },
});
