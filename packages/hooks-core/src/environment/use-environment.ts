/**
 * useEnvironment — 获取当前环境配置
 */

import { useEnvironmentContext } from "./environment-provider"
import type { EnvironmentConfig } from "./types"

export type { EnvironmentConfig } from "./types"

/** 获取当前环境配置 */
export function useEnvironment(): EnvironmentConfig {
  return useEnvironmentContext()
}
