// vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'
import laravel from 'laravel-vite-plugin';
import dotenv from 'dotenv'
dotenv.config()

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './resources/js'),
    }
  },
  plugins: [
    react(),
    laravel([
      'resources/js/app.jsx',
    ]),
  ],
  server: {
    port: 5173, // Ensure this matches the mapped port
    host: '0.0.0.0', // Listen on all interfaces
    hmr: {
      host: process.env.VITE_SERVER_HOST || '192.168.6.69',
      protocol: 'ws',
      port: 5173,
    },
  },
});
