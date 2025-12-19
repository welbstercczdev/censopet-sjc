import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// ATENÇÃO: Substitua 'censopet-sjc' pelo nome EXATO do seu repositório no GitHub, se for diferente.
const REPO_NAME = '/censopet-sjc/'; 

export default defineConfig({
  // 1. IMPORTANTE: Define a base para carregar os arquivos .js e .css corretamente no GitHub Pages
  base: REPO_NAME, 
  
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'CensoPet SJC',
        short_name: 'CensoPet',
        description: 'Coleta Offline de Dados Animais',
        theme_color: '#0ea5e9',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        // 2. IMPORTANTE: O escopo e a url inicial devem incluir o nome do repositório
        scope: REPO_NAME,
        start_url: REPO_NAME,
        icons: [
          {
            src: 'pwa-192x192.png', // O Vite resolve isso relativo à base automaticamente
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        // 3. IMPORTANTE: O fallback offline também precisa do caminho completo
        navigateFallback: `${REPO_NAME}index.html`,
        
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      }
    })
  ]
});