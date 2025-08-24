import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { validateBuildConfig } from "./config/build";

// Validate build configuration before rendering
if (import.meta.env.PROD) {
  validateBuildConfig();
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
