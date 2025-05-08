import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@game': path.resolve(__dirname, './src/game'),
      '@views': path.resolve(__dirname, './src/views'),
      '@state': path.resolve(__dirname, './src/state'),
      '@service': path.resolve(__dirname, './src/service'),
    },
  },
  optimizeDeps: {
    include: ['@battle-snakes/shared'], // Explicitly include the shared package
  },
});
