import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    // Must come before @vitejs/plugin-react.
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Registered from main.tsx through `virtual:pwa-register`, which also reloads on update.
      injectRegister: false,
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Quit',
        short_name: 'Quit',
        description: "Suivi personnel d'un arrêt du tabac sous patchs.",
        lang: 'fr',
        theme_color: '#1b3c53',
        background_color: '#fafafa',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Fonts must be precached: the app is used offline and they carry the identity.
        globPatterns: ['**/*.{js,css,html,svg,png,webp,avif,woff2}'],
        // What autoUpdate means; the plugin only sets these itself when it injects the register.
        skipWaiting: true,
        clientsClaim: true,
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: { port: 3000 },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    // Smoke-free days follow local calendar days: pin a zone with daylight saving so the
    // DST cases test what they claim on any machine.
    env: { TZ: 'Europe/Paris' },
    // e2e/ is Playwright's suite, run separately via `test:e2e`; .claude/ holds the
    // parallel sessions' worktrees, each with its own copy of the suite; push-sender/ is a
    // separate package with its own suite and config.
    exclude: ['node_modules/**', 'e2e/**', '.claude/**', 'push-sender/**'],
  },
})
