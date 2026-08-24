import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  // Builds are served from https://tommyknocker81.github.io/vitaly-caremaps-prototype/
  base: command === "build" ? "/vitaly-caremaps-prototype/" : "/",
  plugins: [react()],
  server: { port: 5181, strictPort: true },
}));
