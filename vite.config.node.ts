import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Config usado apenas para o build do Docker/EasyPanel (Node.js runtime).
export default defineConfig({
  cloudflare: false,
});
