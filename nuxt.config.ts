require("dotenv").config({ path: ".env.local" });

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  alias: {
    "~": ".",
  },
  modules: ["@nuxtjs/google-fonts", "convex-nuxt", "@vite-pwa/nuxt"],
  googleFonts: {
    // --f-display: 'Almendra', serif          → titles, theme names, score numbers
    // --f-body:    'IM Fell DW Pica', serif   → question text, passages, explanations
    // --f-sans:    'IBM Plex Sans', sans-serif → answer options, small UI (legibility on mobile)
    // --f-mono:    'IBM Plex Mono', monospace  → timer, Q numbers, keyboard hints, labels
    families: {
      Almendra: {
        wght: [400, 700],
        ital: [400, 700],
      },
      "IM Fell DW Pica": {
        wght: [400],
        ital: [400],
      },
      "IBM Plex Sans": {
        wght: [300, 400, 500, 600, 700],
        ital: [300, 400, 500, 600, 700],
      },
      "IBM Plex Mono": {
        wght: [300, 400, 500, 600, 700],
        ital: [300, 400, 500, 600, 700],
      },
    },
  },
  app: {
    head: {
      link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    },
  },
  css: ["~/styles/_tokens.scss"],
  vite: {
    optimizeDeps: {
      include: ["convex-vue", "convex/server"],
    },
  },
  convex: {
    url: process.env.CONVEX_URL,
  },
  pwa: {
    registerType: "autoUpdate",
    manifest: {
      name: "whim·ec",
      short_name: "whim·ec",
      description: "Simulateur d'examen civique pour NAT/CSP",
      theme_color: "#e8e4d9",
      background_color: "#e8e4d9",
      display: "standalone",
      orientation: "portrait",
      lang: "fr",
      icons: [
        {
          src: "pwa-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "pwa-512x512-maskable.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
      screenshots: [
        {
          src: "screenshot-wide.png",
          sizes: "1280x720",
          type: "image/png",
          form_factor: "wide",
          label: "whim·ec — écran de démarrage",
        },
        {
          src: "screenshot-narrow.png",
          sizes: "390x844",
          type: "image/png",
          form_factor: "narrow",
          label: "whim·ec — écran de démarrage",
        },
      ],
    },
    workbox: {
      navigateFallback: "/",
      globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600,
    },
    devOptions: {
      enabled: false,
    },
  },
});
