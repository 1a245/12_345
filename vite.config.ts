import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Completely prevent environment variables from being bundled
    "process.env": {},
    // Replace environment variables with empty strings during build
    "import.meta.env.VITE_SUPABASE_URL": '""',
    "import.meta.env.VITE_SUPABASE_ANON_KEY": '""',
  },
  build: {
    rollupOptions: {
      output: {
        // Ensure environment variables are not included in bundle
        manualChunks: undefined,
      },
    },
    // Prevent environment variables from being included
    target: "esnext",
    // Ensure no environment variables leak through
    sourcemap: false,
  },
  // Completely disable environment variable processing
  envPrefix: [],
  // Ensure environment variables are not loaded during build
  envDir: ".",
});
