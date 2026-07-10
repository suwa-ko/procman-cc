/**
 * 开发环境预设。
 * 连接本地 Supabase 实例，输出 debug 日志。
 */

import type { AppConfig } from "../types"

export const devPreset: AppConfig = {
  env: "dev",
  supabaseUrl: "http://localhost:54321",
  supabaseAnonKey: "",
  apiBaseUrl: "http://localhost:3000",
  logLevel: "debug",
  appName: "采购管理系统 (Dev)",
  logoUrl: "",
  nodeEnv: "development",
}
