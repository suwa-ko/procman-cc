/**
 * 配置加载器。
 * 按 env 选择 preset，用环境变量覆盖，校验后返回冻结的 AppConfig。
 *
 * 使用方式（apps 层依赖注入入口）：
 *   // apps/api 启动时
 *   import { loadConfig } from "@ps/env-config"
 *   const config = loadConfig({ env: "dev", overrides: process.env })
 *
 *   // apps/web 启动时（Vite）
 *   import { loadConfig } from "@ps/env-config"
 *   const config = loadConfig({ env: "dev", overrides: import.meta.env })
 */

import { devPreset } from "./presets/dev"
import { mockPreset } from "./presets/mock"
import { prodPreset } from "./presets/prod"
import type { AppConfig, AppEnv, LoadConfigOptions } from "./types"
import { ENV_KEY_MAP } from "./types"
import { assertConfig } from "./validator"

/** 根据 AppEnv 获取对应预设配置 */
function loadPreset(env: AppEnv): AppConfig {
  switch (env) {
    case "mock":
      return { ...mockPreset }
    case "dev":
      return { ...devPreset }
    case "prod":
      return { ...prodPreset }
    default: {
      const exhaustive: never = env
      throw new Error(`未知环境: ${String(exhaustive)}`)
    }
  }
}

/**
 * 用环境变量覆盖 preset 中的配置字段。
 * - APP_ENV 可覆盖 opts.env（运行时切换环境）
 * - 其余 SUPABASE_URL / API_BASE_URL 等按 ENV_KEY_MAP 映射覆盖
 */
function applyOverrides(
  config: AppConfig,
  overrides: Record<string, string | undefined>
): AppConfig {
  const result = { ...config }

  // APP_ENV 特殊处理：可动态覆盖环境类型
  const appEnv = overrides.APP_ENV
  if (appEnv === "mock" || appEnv === "dev" || appEnv === "prod") {
    result.env = appEnv
  }

  // 其余环境变量按映射表覆盖
  for (const [envKey, configKey] of Object.entries(ENV_KEY_MAP)) {
    const value = overrides[envKey]
    if (value !== undefined && value !== "") {
      (result as Record<string, string>)[configKey] = value
    }
  }

  return result
}

/**
 * 加载应用配置。
 *
 * @param options.env - 显式指定环境（默认 "dev"）
 * @param options.overrides - 环境变量键值对（来自 process.env 或 import.meta.env）
 * @returns 冻结的 AppConfig（不可修改）
 * @throws 必填项缺失时抛出（调用方可 catch 后退出进程）
 */
export function loadConfig(options?: LoadConfigOptions): AppConfig {
  const env: AppEnv = options?.env ?? "dev"
  const overrides = options?.overrides ?? {}

  const preset = loadPreset(env)
  const merged = applyOverrides(preset, overrides)

  // 如果 APP_ENV 覆盖了环境类型，需基于新 preset 重新合并（不携带旧 preset 值）
  if (merged.env !== env) {
    const newPreset = loadPreset(merged.env)
    const revalidated = applyOverrides(newPreset, overrides)
    const newEnv = revalidated.env
    if (!assertConfig(revalidated)) {
      throw new Error(`环境配置校验失败（环境: ${newEnv}），请检查环境变量`)
    }
    return Object.freeze(revalidated)
  }

  const finalEnv = merged.env
  if (!assertConfig(merged)) {
    throw new Error(`环境配置校验失败（环境: ${finalEnv}），请检查环境变量`)
  }

  return Object.freeze(merged)
}
