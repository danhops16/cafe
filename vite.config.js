import { defineConfig } from "vite";
import { resolve } from "node:path";

// GitHub project Pages URL is /<repo>/ — set BASE_URL=/cafe/ in CI (see .github/workflows).
const base = process.env.BASE_URL ?? "/";

export default defineConfig({
  base,
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        menu: resolve(__dirname, "menu.html"),
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
