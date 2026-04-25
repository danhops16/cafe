import { defineConfig } from "vite";

// GitHub project Pages URL is /<repo>/ — set BASE_URL=/cafe/ in CI (see .github/workflows).
const base = process.env.BASE_URL ?? "/";

export default defineConfig({
  base,
  server: {
    port: 5173,
    open: true,
  },
});
