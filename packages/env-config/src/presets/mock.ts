/**
 * Mock 环境预设。
 * 不连接任何真实数据库或外部服务，供前端 MSW 拦截 + 后端 MockDbClient 使用。
 */

import type { AppConfig } from "../types"

export const mockPreset: AppConfig = {
  env: "mock",
  supabaseUrl: "",
  supabaseAnonKey: "",
  apiBaseUrl: "http://localhost:3000",
  logLevel: "debug",
  appName: "采购管理系统 (Mock)",
  logoUrl: "",
  nodeEnv: "mock",
}
