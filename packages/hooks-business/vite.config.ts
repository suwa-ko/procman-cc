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
        "@ps/contracts",
        "@ps/types-base",
        "@ps/hooks-core",
        "@tanstack/react-query",
        "react",
        "react/jsx-runtime",
      ],
    },
  },
})
