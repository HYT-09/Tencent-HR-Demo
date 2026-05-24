import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: '腾讯校招求职平台',
        short_name: '腾讯校招',
        description: 'AI智能匹配，精准推荐腾讯校招岗位',
        theme_color: '#2A5CFF',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        icons: [
          { src: '/favicon.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: '/favicon.svg', sizes: '512x512', type: 'image/svg+xml' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://tencent-hr-demo-261441-7-1436282118.sh.run.tcloudbase.com',
        changeOrigin: true,
        secure: true
      }
    }
  }
});
