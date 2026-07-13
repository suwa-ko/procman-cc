/**
 * useLogout — 登出 Hook
 */

import { useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"


import { useAuthContext } from "./auth-provider"

/**
 * 登出 Hook。
 *
 * 用法：
 * ```ts
 * const logout = useLogout()
 * logout() // 清除 Token 并重置所有缓存
 * ```
 */
export function useLogout(): () => void {
  const { clearAuth } = useAuthContext()
  const queryClient = useQueryClient()

  return useCallback(() => {
    clearAuth()
    queryClient.clear()
  }, [clearAuth, queryClient])
}
