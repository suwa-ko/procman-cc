/**
 * toQueryParams — 将任意查询参数对象转换为 HttpClient 兼容的 QueryParams 类型
 *
 * 因为 TypeScript 的 interface 类型（如 SupplierQueryParams）没有索引签名，
 * 无法直接赋值给 Record<string, string | number | boolean | null | undefined>。
 * 此函数提供安全的类型转换。
 */

import type { QueryParams } from "@ps/web-kit"

/**
 * 将查询参数对象转换为 HTTP 客户端兼容的查询参数格式。
 *
 * @param params - 业务层查询参数对象
 * @returns 可传递给 HttpClient.get/post 的 params 参数
 */
export function toQueryParams<T extends Record<string, unknown>>(
  params: T
): QueryParams {
  return params as unknown as QueryParams
}
