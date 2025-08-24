import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Prevent environment variables from being bundled
    "process.env": {},
  },
  build: {
    rollupOptions: {
      output: {
        // Ensure environment variables are not included in bundle
        manualChunks: undefined,
      },
    },
  },
});
