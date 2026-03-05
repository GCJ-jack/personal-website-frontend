import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/tokens.css";
import "./styles/typography.css";
import "./styles/globals.css";
import App from "./App";
import { createLogger } from "./lib/logger";

const logger = createLogger("AppBootstrap");
logger.info("Bootstrapping application");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
