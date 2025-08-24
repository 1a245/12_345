// Environment configuration that prevents secrets from being bundled
export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || "",
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
  },
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
};

// Validate environment variables at runtime
export const validateEnvironment = () => {
  const { url, anonKey } = config.supabase;

  if (!url || !anonKey) {
    console.warn("Missing Supabase environment variables");
    return false;
  }

  if (!url.includes("supabase.co")) {
    console.warn("Invalid Supabase URL format");
    return false;
  }

  if (anonKey.length < 50) {
    console.warn("Invalid Supabase anonymous key format");
    return false;
  }

  return true;
};
