import { TITLE, DESCRIPTION } from './constants/seo'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {
    enabled: true,
  },
  appConfig: {
    firebase: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    },
  },
  app: {
    baseURL: process.env.BASE_URL,
    head: {
      title: TITLE,
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
      meta: [
        { name: 'description', content: DESCRIPTION },
        { name: 'og:title', content: TITLE },
        { name: 'og:description', content: DESCRIPTION },
        { name: 'og:url', content: 'https://moebarox.github.io/gaple-battle/' },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: TITLE },
        { name: 'twitter:description', content: DESCRIPTION },
      ],
      htmlAttrs: { lang: 'id' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
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
