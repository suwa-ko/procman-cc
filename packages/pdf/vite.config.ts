import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

export default defineConfig({
  plugins: [dts({ rollupTypes: true })],
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "index.mjs" : "index.cjs"),
    },
    rollupOptions: {
      external: [
        "handlebars",
        "puppeteer",
        "puppeteer-core",
        "node:path",
        "node:fs",
        "node:fs/promises",
        "node:url",
        "@ps/contracts",
        "@ps/log",
        "@ps/types-base",
      ],
    },
  },
})
