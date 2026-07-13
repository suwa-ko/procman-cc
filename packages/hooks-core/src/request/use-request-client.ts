/**
 * useRequestClient — 获取当前请求客户端实例
 */

import type { HttpClient } from "@ps/web-kit"

import { useRequestClientContext } from "./request-provider"

/**
 * 获取当前已初始化的 HttpClient 实例。
 * 需在 <RequestProvider> 内部使用。
 */
export function useRequestClient(): HttpClient {
  return useRequestClientContext()
}
