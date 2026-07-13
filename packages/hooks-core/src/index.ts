/**
 * @ps/hooks-core
 * 前端 Hook 基础能力库
 *
 * 提供环境管理、认证管理、请求客户端、TanStack Query 封装、
 * 通用 CRUD Hook 工厂与工具 Hook。
 */

// ---- 环境管理 ----
export { EnvironmentProvider, useEnvironment } from "./environment"
export type {
  EnvironmentConfig,
  EnvironmentMode,
  EnvironmentProviderProps,
} from "./environment"

// ---- 认证管理 ----
export { AuthProvider } from "./auth"
export type { AuthConfig, AuthProviderProps, AuthContextValue } from "./auth"
export { useAuth, useLogin, useLogout, usePermission } from "./auth"
export type { UserInfo, LoginRequest, LoginResponse, AuthState } from "./auth"

// ---- 请求客户端 ----
export {
  RequestProvider,
  useRequestClient,
  wrapClientWithAuth,
  toQueryParams,
} from "./request"
export type { RequestProviderProps } from "./request"

// ---- TanStack Query 封装 ----
export { useQuery, useMutation } from "./query"

// ---- CRUD 工厂 ----
export { createCrudHooks } from "./crud"
export type { CrudHooks, CrudModelConfig, ListResponse } from "./crud"

// ---- 工具 Hook ----
export { useDebounce, usePagination } from "./utils"
