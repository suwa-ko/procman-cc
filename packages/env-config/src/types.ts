/**
 * 环境配置类型定义。
 * 纯类型，零运行时依赖。
 */

/** 应用运行环境 */
export type AppEnv = "mock" | "dev" | "prod"

/** 日志级别 */
export type LogLevel = "debug" | "info" | "warn" | "error"

/** 应用配置（所有字段由 preset 提供默认值，可被环境变量覆盖） */
export interface AppConfig {
  /** 当前运行环境 */
  env: AppEnv
  /** Supabase 项目 URL（mock 环境可为空字符串） */
  supabaseUrl: string
  /** Supabase 匿名 Key（mock 环境可为空字符串） */
  supabaseAnonKey: string
  /** 后端 API 基础地址（前端用） */
  apiBaseUrl: string
  /** 日志级别 */
  logLevel: LogLevel
  /** 企业名称（PDF 模板 / 页面标题用） */
  appName: string
  /** 企业 Logo 地址 */
  logoUrl: string
  /** Node 环境标识（NODE_ENV 原始值） */
  nodeEnv: string
}

/** loadConfig 的选项 */
export interface LoadConfigOptions {
  /** 显式指定环境，不指定则默认 "dev" */
  env?: AppEnv
  /**
   * 环境变量覆盖（键值对，来自 process.env 或 import.meta.env）。
   * 支持的键名：
   * - SUPABASE_URL → supabaseUrl
   * - SUPABASE_ANON_KEY → supabaseAnonKey
   * - API_BASE_URL → apiBaseUrl
   * - LOG_LEVEL → logLevel
   * - APP_NAME → appName
   * - LOGO_URL → logoUrl
   * - NODE_ENV → nodeEnv
   * - APP_ENV → env（可覆盖 opts.env）
   */
  overrides?: Record<string, string | undefined>
}

/** 环境变量名 → AppConfig 字段名的映射 */
export const ENV_KEY_MAP: Record<string, keyof AppConfig> = {
  SUPABASE_URL: "supabaseUrl",
  SUPABASE_ANON_KEY: "supabaseAnonKey",
  API_BASE_URL: "apiBaseUrl",
  LOG_LEVEL: "logLevel",
  APP_NAME: "appName",
  LOGO_URL: "logoUrl",
  NODE_ENV: "nodeEnv",
}
