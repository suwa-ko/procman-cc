/**
 * 环境配置类型定义
 */

/** 运行模式 */
export type EnvironmentMode = "dev" | "mock" | "prod"

/**
 * 环境配置。
 * mode 决定是否启用 MSW Mock：
 * - "mock" → 启用 Mock Service Worker，所有请求由 MSW 拦截
 * - "dev"  → 连接本地/远程开发 API
 * - "prod" → 连接生产 API
 */
export interface EnvironmentConfig {
  /** 当前运行模式 */
  readonly mode: EnvironmentMode

  /** API 基础 URL（如 "http://localhost:3000"） */
  readonly apiBaseUrl: string
}
