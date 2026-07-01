import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { crx } from '@crxjs/vite-plugin';
import manifest from './src/manifest.ts';

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
    cors: {
      origin: '*',
      methods: '*',
      allowedHeaders: '*'
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    crx({ manifest }),
  ],
});
