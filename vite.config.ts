// --- START OF FILE vite.config.ts ---
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// O nome do repositório no GitHub
const BASE_PATH = '/censopet-sjc/';

export default defineConfig({
  base: BASE_PATH, // Importante para o GitHub Pages
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'CensoPet SJC',
        short_name: 'CensoPet',
        description: 'Aplicativo de censo e controle animal',
        theme_color: '#0ea5e9',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: BASE_PATH, // Ajustado para o caminho do repo
        start_url: BASE_PATH, // Ajustado para o caminho do repo
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // Importante: Como você usa Tailwind via CDN, precisamos fazer cache dele em tempo de execução
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdn\.tailwindcss\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'tailwind-cdn-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 ano
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 ano
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 ano
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Cache para Lucide React Icons (se forem carregados via CDN)
          {
            urlPattern: /^https:\/\/aistudiocdn\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'cdn-libs-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 dias
              }
            }
          }
        ]
      }
    })
  ]
});