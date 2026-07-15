/**
 * 集成测试 Vitest 配置。
 *
 * 用于连接真实 Supabase 数据库执行全流程业务测试。
 * 与单元测试（vitest.config.ts）独立，目标环境为 node。
 *
 * 前置条件：
 *   设置环境变量 SUPABASE_URL 和 SUPABASE_ANON_KEY（或写入 .env 文件）
 *
 * 运行方式：
 *   pnpm --filter @ps/api test:integration
 */

import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: false,
    environment: "node",
    include: ["src/__tests__/integration/**/*.test.ts"],
    globalSetup: ["./src/__tests__/integration/setup.ts"],
    testTimeout: 30000,
    hookTimeout: 30000,
  },
})
