/**
 * wrapClientWithAuth — 为 HttpClient 注入 Token 自动附加能力
 *
 * 包装原始 HttpClient，每次请求自动附加 Authorization: Bearer <token> 请求头。
 * Token 变化时重新调用此函数即可生成新的包装实例。
 */

import type { HttpClient, RequestConfig } from "@ps/web-kit"

/**
 * 创建一个自动附加 Token 的 HttpClient 包装。
 *
 * @param client - 原始 HttpClient 实例
 * @param token  - 当前有效的 JWT Token
 * @returns 包装后的 HttpClient（所有方法自动附带 Authorization 头）
 */
export function wrapClientWithAuth(
  client: HttpClient,
  token: string
): HttpClient {
  const authHeaders = { Authorization: `Bearer ${token}` }

  return {
    request: <T = unknown>(config: RequestConfig) =>
      client.request<T>({
        ...config,
        headers: { ...authHeaders, ...config.headers },
      }),
    get: <T = unknown>(
      url: string,
      config?: Omit<RequestConfig, "url" | "method">
    ) =>
      client.get<T>(url, {
        ...config,
        headers: { ...authHeaders, ...config?.headers },
      }),
    post: <T = unknown>(
      url: string,
      body?: unknown,
      config?: Omit<RequestConfig, "url" | "method" | "body">
    ) =>
      client.post<T>(url, body, {
        ...config,
        headers: { ...authHeaders, ...config?.headers },
      }),
    put: <T = unknown>(
      url: string,
      body?: unknown,
      config?: Omit<RequestConfig, "url" | "method" | "body">
    ) =>
      client.put<T>(url, body, {
        ...config,
        headers: { ...authHeaders, ...config?.headers },
      }),
    patch: <T = unknown>(
      url: string,
      body?: unknown,
      config?: Omit<RequestConfig, "url" | "method" | "body">
    ) =>
      client.patch<T>(url, body, {
        ...config,
        headers: { ...authHeaders, ...config?.headers },
      }),
    delete: <T = unknown>(
      url: string,
      config?: Omit<RequestConfig, "url" | "method">
    ) =>
      client.delete<T>(url, {
        ...config,
        headers: { ...authHeaders, ...config?.headers },
      }),
  }
}
