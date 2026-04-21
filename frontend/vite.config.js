import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: {
        enabled: true 
      },
      manifest: {
        name: 'Events Yote',
        short_name: 'Events',
        display: 'standalone',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        icons: [
          { src: 'pwa-64x64.png',            sizes: '64x64',   type: 'image/png' },
          { src: 'pwa-192x192.png',           sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png',           sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ],

  server: {
    // https: {
    //   key: fs.readFileSync('./server.key'),
    //   cert: fs.readFileSync('./server.pem'),
    // },
    host: true, // so other devices on LAN can access
    port: 5173,
    allowedHosts: [
      'events.yote.me', 
      'events.yote.me:5000',
      '.csb.app',
    ],
  },
})
