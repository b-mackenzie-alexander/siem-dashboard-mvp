import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api/urlhaus': {
        target: 'https://urlhaus-api.abuse.ch',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/urlhaus/, '')
      },
      '/api/blocklist': {
        target: 'https://lists.blocklist.de',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/blocklist/, '')
      }
    }
  }
})