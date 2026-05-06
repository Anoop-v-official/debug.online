import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  clearScreen: false,
  build: {
    target: 'esnext',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion')) return 'motion';
            if (id.includes('react-router')) return 'router';
            if (id.includes('zustand')) return 'store';
            if (id.includes('lucide-react')) return 'icons';
            // Heavy tool-specific libs: let them split with the dynamic tool import.
            if (
              id.includes('bcryptjs') ||
              id.includes('sql-formatter') ||
              id.includes('js-yaml') ||
              id.includes('qrcode')
            ) {
              return undefined;
            }
            return 'vendor';
          }
          if (id.includes('/src/tools/')) {
            // each tool already lazy-loaded; let Rollup chunk per dynamic import
            return undefined;
          }
        },
      },
    },
  },
});
