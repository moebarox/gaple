// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  app: {
    baseURL: '/gaple-battle/',
    head: {
      title: 'Gaple Battle',
    },
  },
  modules: ['@nuxt/image'],
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  imports: {
    dirs: ['constants', 'types'],
  },
})
