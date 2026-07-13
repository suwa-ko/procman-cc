/**
 * useMutation — TanStack Query useMutation 的类型安全封装
 *
 * 提供与 @tanstack/react-query 相同的 useMutation API，直接透传。
 * 工作区统一通过此封装引用，便于日后统一增强。
 */

import type {
  DefaultError,
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query"
import { useMutation as tsUseMutation } from "@tanstack/react-query"

/**
 * 类型安全的 useMutation 封装。
 *
 * @param options - TanStack Query useMutation 选项
 * @returns Mutation 结果
 */
export function useMutation<
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
>(
  options: UseMutationOptions<TData, TError, TVariables, TContext>
): UseMutationResult<TData, TError, TVariables, TContext> {
  return tsUseMutation<TData, TError, TVariables, TContext>(options)
}
