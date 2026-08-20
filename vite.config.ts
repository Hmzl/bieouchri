import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tursoApiPlugin } from './server/vite-plugin.ts'

export default defineConfig({
  plugins: [react(), tursoApiPlugin()],
  server: {
    host: true,
    port: 5173,
    strictPort: false,
  },
})
