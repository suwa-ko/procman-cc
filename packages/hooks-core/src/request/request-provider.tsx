/**
 * RequestProvider — 请求客户端 React Context
 *
 * 接收原始 HttpClient 实例，内部自动从 AuthContext 读取 Token
 * 并通过 wrapClientWithAuth 注入 Authorization 请求头。
 * Token 变化时自动重建包装实例。
 *
 * 必须在 <AuthProvider> 内部使用。
 */

import type { HttpClient } from "@ps/web-kit"
import type { ReactNode } from "react"
import { createContext, useContext, useMemo } from "react"


import { useAuthContext } from "../auth/auth-provider"

import { wrapClientWithAuth } from "./wrap-with-auth"

const RequestClientContext = createContext<HttpClient | null>(null)

export interface RequestProviderProps {
  /** 原始（未附加 Token）的 HttpClient 实例 */
  readonly client: HttpClient
  readonly children: ReactNode
}

/**
 * 请求客户端提供者。
 * 自动从上层 AuthProvider 读取 Token 并注入到每次请求的 Authorization 头。
 * 应在 <AuthProvider> 内部使用。
 */
export function RequestProvider({
  client,
  children,
}: RequestProviderProps): ReactNode {
  const { token } = useAuthContext()

  const wrappedClient = useMemo<HttpClient>(() => {
    if (token === null) {
      return client
    }
    return wrapClientWithAuth(client, token)
  }, [client, token])

  return (
    <RequestClientContext.Provider value={wrappedClient}>
      {children}
    </RequestClientContext.Provider>
  )
}

/** 内部获取请求客户端（仅供包内 Hook 使用） */
export function useRequestClientContext(): HttpClient {
  const ctx = useContext(RequestClientContext)
  if (ctx === null) {
    throw new Error(
      "useRequestClient 必须在 <RequestProvider> 内部使用"
    )
  }
  return ctx
}
