/// <reference types="vitest/config" />
import path from 'node:path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icons/*.png'],
      manifest: {
        name: '習慣追蹤器',
        short_name: '習慣',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#6366f1',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
        shortcuts: [
          {
            name: '快速記錄',
            url: '/quick-entry',
            icons: [{ src: '/icons/shortcut-quick.png', sizes: '96x96' }],
          },
        ],
      },
      workbox: {
        // App Shell：precache 全部建置產物（HTML/CSS/JS），離線可用
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        runtimeCaching: [
          {
            // 圖片/icon：CacheFirst，30 天過期
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
