export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  modules: ['@nuxtjs/tailwindcss'],
  runtimeConfig: {
    // Estas claves se sobreescriben en tiempo de ejecución (no al compilar)
    // con las variables de entorno NUXT_DATABASE_URL, NUXT_DATABASE_SSL y
    // NUXT_SEED_ADMIN_PASSWORD. Ver README > Despliegue.
    databaseUrl: '',
    databaseSsl: true,
    seedAdminPassword: 'admin123',
  },
  nitro: {
    // Sin preset forzado: Nitro detecta la plataforma (Vercel, etc.) automáticamente
    // en el build y usa "node-server" como base para Docker/Railway/VPS propio.
    preset: process.env.NITRO_PRESET || undefined,
  },
});
