/**
 * setupHttpClient — 全局 HTTP 客户端初始化模块。
 *
 * 自动对接 @ps/env-config 获取当前环境配置（baseURL 等），
 * 根据 mock/dev/prod 环境自动切换网络配置。
 *
 * 保留 createHttpClient 手动传参方式，不破坏现有调用。
 */

import { loadConfig } from "@ps/env-config"

import { createHttpClient } from "./client"
import type { HttpClient, HttpClientOptions } from "./types"

/** 全局单例 */
let instance: HttpClient | null = null

/** setupHttpClient 可覆写的配置项（除 baseURL 外均继承自 HttpClientOptions） */
export interface SetupHttpClientOptions extends Partial<
  Pick<
    HttpClientOptions,
    | "requestInterceptors"
    | "responseInterceptors"
    | "defaultHeaders"
    | "timeout"
  >
> {
  /** 覆盖 baseURL（默认从 env-config 读取 config.apiBaseUrl） */
  baseURL?: string
}

/**
 * 初始化全局 HTTP 客户端。
 *
 * - 无参数调用：自动从 @ps/env-config 读取 apiBaseUrl，按当前环境配置
 * - 传入 options：可覆盖 baseURL、拦截器、超时等
 *
 * 返回创建的 HttpClient 实例（同时也是全局单例）。
 * 重复调用会覆盖旧实例（非幂等，用于测试/热更新场景）。
 */
export function setupHttpClient(options?: SetupHttpClientOptions): HttpClient {
  const config = loadConfig()
  const client = createHttpClient({
    baseURL: options?.baseURL ?? config.apiBaseUrl,
    requestInterceptors: options?.requestInterceptors,
    responseInterceptors: options?.responseInterceptors,
    defaultHeaders: options?.defaultHeaders,
    timeout: options?.timeout,
  })
  instance = client
  return client
}

/**
 * 获取已初始化的全局 HTTP 客户端。
 *
 * 未调用 setupHttpClient() 时抛出 Error（Fail-fast，应用启动时必调）。
 */
export function getHttpClient(): HttpClient {
  if (instance === null) {
    throw new Error("HTTP 客户端未初始化，请在应用启动时调用 setupHttpClient()")
  }
  return instance
}

/**
 * 清除全局客户端实例（测试/重置用）。
 */
export function resetHttpClient(): void {
  instance = null
}
