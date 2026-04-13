import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Isolated build for logbird.me — landing page only, no app/auth dependencies
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist-landing',
    rollupOptions: {
      input: 'index.landing.html',
    },
  },
})
