/**
 * 生产环境预设。
 * 连接 Supabase 云实例，输出 info 日志。
 * supabaseUrl / supabaseAnonKey 必须在部署时通过环境变量注入，否则启动校验失败。
 */

import type { AppConfig } from "../types"

export const prodPreset: AppConfig = {
  env: "prod",
  supabaseUrl: "",
  supabaseAnonKey: "",
  apiBaseUrl: "/api",
  logLevel: "info",
  appName: "采购管理系统",
  logoUrl: "",
  nodeEnv: "production",
}
