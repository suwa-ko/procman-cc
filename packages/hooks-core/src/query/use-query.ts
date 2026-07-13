/**
 * useQuery — TanStack Query useQuery 的类型安全封装
 *
 * 提供与 @tanstack/react-query 相同的 useQuery API，直接透传。
 * 工作区统一通过此封装引用，便于日后统一增强（如全局错误提示、日志）。
 */

import type {
  DefaultError,
  QueryKey,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query"
import { useQuery as tsUseQuery } from "@tanstack/react-query"

/**
 * 类型安全的 useQuery 封装。
 *
 * @param options - TanStack Query useQuery 选项
 * @returns Query 结果
 */
export function useQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>
): UseQueryResult<TData, TError> {
  return tsUseQuery<TQueryFnData, TError, TData, TQueryKey>(options)
}
