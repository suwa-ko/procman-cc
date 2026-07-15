import { defineConfig } from "vite"

export default defineConfig({
  build: {
    target: "node18",
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: () => "index.mjs",
    },
    rollupOptions: {
      external: [
        "hono",
        "@hono/node-server",
        "@ps/pdf",
        "puppeteer",
        "puppeteer-core",
        "@puppeteer/browsers",
        "handlebars",
      ],
    },
  },
})
