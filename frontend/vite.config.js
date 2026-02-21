import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',  // Vercel serves from this directory
  },
  server: {
    port: 3000,
    open: true,
    allowedHosts: [
      'evelia-umbrose-unmovingly.ngrok-free.dev'
    ]
  }
})