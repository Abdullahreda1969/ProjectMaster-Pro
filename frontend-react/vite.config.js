import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 3001,
    open: true
  },
  resolve: {
    alias: {
      // eslint-disable-next-line no-undef
      'api': path.resolve(__dirname, 'src/services/api.js')
    }
  }
})