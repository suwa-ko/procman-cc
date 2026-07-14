import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

export default defineConfig({
  plugins: [
    react(),
    dts({ rollupTypes: true }),
  ],
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "index.mjs" : "index.cjs"),
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "antd",
        "@ant-design/icons",
        "@tanstack/react-query",
        "@ps/contracts",
        "@ps/hooks-business",
        "@ps/hooks-core",
        "@ps/web-kit",
      ],
    },
  },
})
