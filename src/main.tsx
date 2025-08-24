import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { validateBuildConfig, checkRuntimeEnvironment } from "./config/build";

// Validate build configuration before rendering
if (import.meta.env.PROD) {
  validateBuildConfig();
}

// Check runtime environment and log status
if (typeof window !== "undefined") {
  const hasEnv = checkRuntimeEnvironment();
  if (!hasEnv) {
    console.warn(
      "Supabase environment variables not detected. The app may not function properly."
    );
  } else {
    console.log("Supabase environment variables detected successfully.");
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
