// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {
    enabled: true,
  },
  app: {
    baseURL: '/gaple-battle/',
    head: {
      title: 'Gaple Battle!',
    },
  },
  modules: [
    '@nuxt/ui',
    [
      'nuxt-viewport',
      {
        breakpoints: {
          xs: 320,
          sm: 640,
          md: 768,
          lg: 1024,
          xl: 1280,
          '2xl': 1536,
        },

        defaultBreakpoints: {
          desktop: 'lg',
          mobile: 'xs',
          tablet: 'md',
        },

        fallbackBreakpoint: 'lg',
      },
    ],
  ],
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  routeRules: {
    '*': { ssr: false },
  },
  imports: {
    dirs: ['constants/**/*.ts', 'types/**/*.ts'],
  },
  watch: ['constants/**/*.ts', 'types/**/*.ts'],
})
