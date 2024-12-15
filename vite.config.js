import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: path.join(__dirname, '_static'),
    // Ensure assets are properly handled
    assetsDir: 'assets',
    // Generate a single CSS file
    cssCodeSplit: false,
    // Optimize chunk size
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  // Add base URL configuration for static hosting
  base: '/',
  // Development server configuration
  server: {
    port: 3009,
    open: true, // Opens the browser automatically
    host: true, // Expose to all network interfaces
    strictPort: true,
  },
});
