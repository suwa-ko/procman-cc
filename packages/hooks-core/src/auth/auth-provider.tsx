/**
 * AuthProvider — 认证状态管理
 *
 * 职责：
 * - 在挂载时从 localStorage 读取 Token
 * - 提供 setToken / clearToken 方法管理 Token 生命周期
 * - 不直接发起 API 请求（API 调用由 useAuth / useLogin 等 Hook 负责）
 */

import type { ReactNode } from "react"
import { createContext, useCallback, useContext, useMemo, useState } from "react"

import { getToken, removeToken, setToken } from "./token-manager"
import type { AuthConfig, UserInfo } from "./types"

/** 认证上下文（暴露给 useAuth / useLogin / useLogout） */
export interface AuthContextValue {
  readonly token: string | null
  readonly user: UserInfo | null
  readonly setAuth: (newToken: string, newUser: UserInfo) => void
  readonly clearAuth: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export interface AuthProviderProps {
  readonly config: AuthConfig
  readonly children: ReactNode
}

/**
 * 认证提供者。挂载时从 localStorage 恢复 Token。
 * 应在 <EnvironmentProvider> 内部、<RequestProvider> 上方使用。
 */
export function AuthProvider({
  config,
  children,
}: AuthProviderProps): ReactNode {
  const [token, setTokenState] = useState<string | null>(() =>
    getToken(config.tokenStorageKey)
  )
  const [user, setUser] = useState<UserInfo | null>(null)

  const setAuth = useCallback(
    (newToken: string, newUser: UserInfo) => {
      setToken(config.tokenStorageKey, newToken)
      setTokenState(newToken)
      setUser(newUser)
    },
    [config.tokenStorageKey]
  )

  const clearAuth = useCallback(() => {
    removeToken(config.tokenStorageKey)
    setTokenState(null)
    setUser(null)
  }, [config.tokenStorageKey])

  const value = useMemo<AuthContextValue>(
    () => ({ token, user, setAuth, clearAuth }),
    [token, user, setAuth, clearAuth]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/** 内部获取认证上下文（仅供包内 Hook 使用） */
export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (ctx === null) {
    throw new Error("useAuth / useLogin / useLogout 必须在 <AuthProvider> 内部使用")
  }
  return ctx
}
