import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Ensure environment variables are available
    'process.env': process.env
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
