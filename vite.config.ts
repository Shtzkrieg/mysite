import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({
  plugins: [
    tailwindcss(),
    solidPlugin(),
  ],
  server: {
    port: 3000,
  },
  preview: {
    port: 4173,
    allowedHosts: ['regular-alysa-bearhub-6aeaa056.koyeb.app',
      'cv.calebbuilds.tech',
      'calebbuilds.tech',
      'www.calebbuilds.tech',
    ],
  },
  build: {
    target: 'esnext',
  },
});