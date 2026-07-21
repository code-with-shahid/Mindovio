import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "logo.png",
        "pwa/apple-touch-icon.png",
        "pwa/icon-192.png",
        "pwa/icon-512.png",
      ],
      manifest: {
        id: "/",
        name: "Mindovio — AI Study Assistant",
        short_name: "Mindovio",
        description:
          "AI Powered Smart Study Assistant — generate exam-focused notes, revision sheets, diagrams, and practice questions.",
        theme_color: "#070B16",
        background_color: "#070B16",
        display: "standalone",
        display_override: ["standalone", "browser"],
        orientation: "portrait-primary",
        scope: "/",
        start_url: "/",
        lang: "en",
        categories: ["education", "productivity"],
        icons: [
          {
            src: "/pwa/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/pwa/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/pwa/icon-192-maskable.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/pwa/icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        navigateFallback: "/index.html",
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,webp}"],
        globIgnores: ["**/indian-students-*.png"],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.origin.includes("fonts.googleapis.com") ||
              url.origin.includes("fonts.gstatic.com"),
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
})
