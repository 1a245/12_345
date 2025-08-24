// Build-time configuration that prevents environment variable exposure
export const buildConfig = {
  // These values are set at build time and should not contain sensitive data
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
  buildTime: new Date().toISOString(),

  // Feature flags that can be safely exposed
  features: {
    enableDebugMode: import.meta.env.DEV,
    enableAnalytics: import.meta.env.PROD,
    enableOfflineMode: true,
  },

  // App metadata
  app: {
    name: "M13 Business Management",
    version: "1.0.0",
    environment: import.meta.env.MODE,
  },
};

// Validate build configuration
export const validateBuildConfig = () => {
  // Ensure no sensitive environment variables are exposed
  const envVars = Object.keys(import.meta.env);
  const sensitiveVars = envVars.filter(
    (key) =>
      key.includes("SUPABASE") ||
      key.includes("API_KEY") ||
      key.includes("SECRET")
  );

  if (sensitiveVars.length > 0) {
    console.warn(
      "Sensitive environment variables detected in build:",
      sensitiveVars
    );
    return false;
  }

  return true;
};

// Runtime environment check (only called in browser)
export const checkRuntimeEnvironment = () => {
  if (typeof window === "undefined") {
    return false;
  }

  // Check if environment variables are available at runtime
  const hasSupabaseUrl = typeof import.meta.env.VITE_SUPABASE_URL === "string";
  const hasSupabaseKey =
    typeof import.meta.env.VITE_SUPABASE_ANON_KEY === "string";

  return hasSupabaseUrl && hasSupabaseKey;
};
