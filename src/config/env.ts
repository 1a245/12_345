// Environment configuration that prevents secrets from being bundled
export const config = {
  supabase: {
    url: "",
    anonKey: "",
  },
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
};

// Runtime environment variable getter (only called when app is running)
export const getRuntimeConfig = () => {
  // This function should only be called in the browser
  if (typeof window === "undefined") {
    return { url: "", anonKey: "" };
  }

  // Access environment variables at runtime
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  return { url: url || "", anonKey: anonKey || "" };
};

// Validate environment variables at runtime
export const validateEnvironment = () => {
  const { url, anonKey } = getRuntimeConfig();

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
