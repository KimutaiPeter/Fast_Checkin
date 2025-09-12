import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync('./server.key'),
      cert: fs.readFileSync('./server.pem'),
    },
    host: true, // so other devices on LAN can access
    port: 5173,
  },
})
