require("dotenv").config({ path: ".env.local" });

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  alias: {
    "~": ".",
  },
  modules: ["@nuxtjs/google-fonts", "convex-nuxt"],
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
  css: ["~/styles/_tokens.scss"],
  convex: {
    url: process.env.CONVEX_URL,
  },
});
