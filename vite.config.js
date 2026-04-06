import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Firebase SDK in its own cacheable chunk
          firebase: [
            'firebase/app',
            'firebase/auth',
            'firebase/firestore',
            'firebase/storage',
          ],
          // React core in its own chunk
          vendor: ['react', 'react-dom'],
        },
      },
    },
    // Target modern browsers for smaller output
    target: 'es2020',
  },
})
