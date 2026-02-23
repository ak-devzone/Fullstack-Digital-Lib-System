import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'   // ← restored

export default defineConfig({
  plugins: [react()],                       // ← restored
  server: {
    port: 3000,
    open: true,
    allowedHosts: [
      'evelia-umbrose-unmovingly.ngrok-free.dev'  // ← kept
    ]
  }
})