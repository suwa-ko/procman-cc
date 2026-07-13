/**
 * EnvironmentProvider — 环境配置 React Context
 * 负责注入 API baseURL 等环境配置，供所有子组件/ Hook 访问
 */

import type { ReactNode } from "react"
import { createContext, useContext, useMemo } from "react"

import type { EnvironmentConfig } from "./types"

const EnvironmentContext = createContext<EnvironmentConfig | null>(null)

export interface EnvironmentProviderProps {
  /** 环境配置对象 */
  readonly config: EnvironmentConfig
  readonly children: ReactNode
}

/**
 * 环境配置提供者，应在应用根组件中包裹所有子组件。
 */
export function EnvironmentProvider({
  config,
  children,
}: EnvironmentProviderProps): ReactNode {
  const stableConfig = useMemo(() => config, [config])
  return (
    <EnvironmentContext.Provider value={stableConfig}>
      {children}
    </EnvironmentContext.Provider>
  )
}

/** 内部获取环境配置（仅供包内使用） */
export function useEnvironmentContext(): EnvironmentConfig {
  const ctx = useContext(EnvironmentContext)
  if (ctx === null) {
    throw new Error("useEnvironment 必须在 <EnvironmentProvider> 内部使用")
  }
  return ctx
}
