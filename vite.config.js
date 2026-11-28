import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Avisa cuando hay una versión nueva; el usuario decide cuándo actualizar
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png'],
      manifest: {
        id: '/',
        name: 'StudyMate',
        short_name: 'StudyMate',
        description: 'Panel del estudiante para organizar tareas, exámenes y proyectos.',
        lang: 'es-MX',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#4f46e5',
        background_color: '#ffffff',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        // 👇 Esto elimina los avisos de screenshots que te faltan
        screenshots: [
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Vista de escritorio StudyMate',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            label: 'Vista móvil StudyMate',
          },
        ],
      },
      workbox: {
        // 1. Precache: los archivos que genera el build (carpeta dist)
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        // 2. Navegación sin red: cualquier ruta responde con index.html
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
        // 3. En tiempo de ejecución: imágenes de otros dominios
        runtimeCaching: [
          {
            urlPattern: ({ request, sameOrigin }) =>
              request.destination === 'image' && !sameOrigin,
            handler: 'CacheFirst',
            options: {
              cacheName: 'imagenes-externas',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
});