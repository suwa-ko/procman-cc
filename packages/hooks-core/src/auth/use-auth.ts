/**
 * useAuth — 获取当前认证状态
 *
 * 当 Token 存在但用户信息未加载时，通过 TanStack Query 自动请求 /me 接口获取用户信息。
 */

import { useEnvironment } from "../environment"
import { useQuery } from "../query"
import { useRequestClient } from "../request"

import { useAuthContext } from "./auth-provider"
import type { UserInfo, AuthState } from "./types"

/**
 * 获取当前认证状态。
 *
 * 返回：
 * - user: 当前用户信息（未登录时为 null）
 * - token: 当前 Token
 * - isAuthenticated: 是否已认证（有 Token 且有用户信息）
 * - isLoading: 是否正在验证 Token
 *
 * 需在 <AuthProvider> + <RequestProvider> 内部使用。
 */
export function useAuth(): AuthState {
  const { token } = useAuthContext()
  const client = useRequestClient()
  const { apiBaseUrl } = useEnvironment()

  const { data: user, isLoading } = useQuery<UserInfo>({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const meUrl = `${apiBaseUrl}/api/auth/me`
      return client.get<UserInfo>(meUrl)
    },
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  return {
    user: user ?? null,
    token,
    isAuthenticated: !!token && !!user,
    isLoading: !!token && isLoading,
  }
}
