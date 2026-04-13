import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Production build lands in Django's static folder; load the app via workshop_app/spa.html
export default defineConfig({
  plugins: [react()],
  base: '/static/workshop_app/react/',
  build: {
    outDir: '../workshop_app/static/workshop_app/react',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/app.js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/workshop/api': 'http://127.0.0.1:8000',
      '/workshop/app': 'http://127.0.0.1:8000',
    },
  },
})
