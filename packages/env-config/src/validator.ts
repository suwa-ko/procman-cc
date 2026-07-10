/**
 * 配置校验工具。
 * 启动时校验必填配置项，缺失时通过 console.error 告警。
 * 不依赖 @ps/log（避免 Layer 1 包之间的初始化死循环）。
 */

import type { AppConfig } from "./types"

/** 校验结果 */
interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * 校验 AppConfig 的必填项。
 * mock 环境不要求 supabaseUrl / supabaseAnonKey（无真实数据库）。
 * dev / prod 环境要求 supabaseUrl 不为空。
 */
export function validateConfig(config: AppConfig): ValidationResult {
  const errors: string[] = []

  if (!config.appName) {
    errors.push("appName（企业名称）未配置")
  }

  if (!config.apiBaseUrl) {
    errors.push("apiBaseUrl（API 基础地址）未配置")
  }

  // mock 环境不连接真实 Supabase，允许 supabaseUrl 为空
  if (config.env !== "mock") {
    if (!config.supabaseUrl) {
      errors.push(
        `${config.env.toUpperCase()} 环境缺少 supabaseUrl（请设置 SUPABASE_URL 环境变量）`
      )
    }
  }

  return { valid: errors.length === 0, errors }
}

/**
 * 校验配置，不合法时通过 console.error 输出错误提示。
 * 返回 boolean，调用方可据此决定是否退出进程。
 */
export function assertConfig(config: AppConfig): config is AppConfig {
  const result = validateConfig(config)
  if (!result.valid) {
    for (const err of result.errors) {
      console.error(`[env-config] ${err}`)
    }
    return false
  }
  return true
}
