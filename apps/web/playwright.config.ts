import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "html",
  timeout: 30000,
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    headless: true,
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
  webServer: {
    // 以 dev 模式启动（不加载 MSW），由 Playwright page.route() 接管 API mock
    command: "pnpm vite --mode e2e",
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
})
