import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@game': '/src/game',
    },
  },
  optimizeDeps: {
    include: ['@battle-snakes/shared'], // Explicitly include the shared package
  },
  build: {
    commonjsOptions: {
      include: [/@battle-snakes\/shared/, /node_modules/],
    },
  },
});
