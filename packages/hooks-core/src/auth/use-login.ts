/**
 * useLogin — 登录 Mutation Hook
 *
 * 调用登录接口 → 成功后写入 Token 并更新认证状态。
 */

import type { UseMutationResult } from "@tanstack/react-query"
import { useQueryClient } from "@tanstack/react-query"

import { useEnvironment } from "../environment"
import { useMutation } from "../query"
import { useRequestClient } from "../request"

import { useAuthContext } from "./auth-provider"
import type { LoginRequest, LoginResponse } from "./types"

/**
 * 登录 Hook。
 *
 * 用法：
 * ```ts
 * const login = useLogin()
 * login.mutate({ email: "a@b.com", password: "123" })
 * ```
 */
export function useLogin(): UseMutationResult<
  LoginResponse,
  Error,
  LoginRequest
> {
  const { setAuth } = useAuthContext()
  const client = useRequestClient()
  const { apiBaseUrl } = useEnvironment()
  const queryClient = useQueryClient()

  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: async (credentials) => {
      const loginUrl = `${apiBaseUrl}/api/auth/login`
      return client.post<LoginResponse>(loginUrl, credentials)
    },
    onSuccess: (data) => {
      setAuth(data.token, data.user)
      // 登录后清除所有缓存（用户身份变更，旧缓存可能不适用）
      queryClient.clear()
    },
  })
}
