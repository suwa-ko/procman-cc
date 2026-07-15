/**
 * 开发环境预设。
 * 连接本地 Supabase 实例，输出 debug 日志。
 */

import type { AppConfig } from "../types"

export const devPreset: AppConfig = {
  env: "dev",
  supabaseUrl: "http://localhost:54321",
  supabaseAnonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU",
  apiBaseUrl: "http://localhost:3000",
  logLevel: "debug",
  appName: "采购管理系统 (Dev)",
  logoUrl: "",
  nodeEnv: "development",
}
