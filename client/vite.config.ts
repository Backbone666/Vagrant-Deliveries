import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/login': 'http://localhost:3001',
      '/callback': 'http://localhost:3001',
      '/quote': 'http://localhost:3001',
      '/contracts': 'http://localhost:3001',
      '/director': 'http://localhost:3001',
      '/character': 'http://localhost:3001',
      '/submit': 'http://localhost:3001',
      '/index': 'http://localhost:3001',
      '/unauthorized': 'http://localhost:3001',
    }
  }
})