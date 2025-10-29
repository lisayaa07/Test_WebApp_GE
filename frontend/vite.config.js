import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'       // ✅ ต้องมีบรรทัดนี้
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://test-webapp-ge.onrender.com',
        changeOrigin: true,
        secure: true
      }
    }
  },
  esbuild: mode === 'production' ? { drop: ['console', 'debugger'] } : undefined,
}))
