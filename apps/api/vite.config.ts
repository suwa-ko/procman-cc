import { defineConfig } from "vite"

export default defineConfig({
  build: {
    lib: {
      entry: "src/app.ts",
      formats: ["es"],
      fileName: () => "index.mjs",
    },
    rollupOptions: {
      external: ["hono", "@hono/node-server"],
    },
  },
})
