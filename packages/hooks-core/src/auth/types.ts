/**
 * 认证模块类型定义
 */

/** 当前登录用户信息 */
export interface UserInfo {
  readonly id: string
  readonly email: string
  readonly name: string
  /** 用户拥有的角色列表（如 ["admin", "buyer"]） */
  readonly roles: readonly string[]
}

/** 登录请求 */
export interface LoginRequest {
  readonly email: string
  readonly password: string
}

/** 登录响应 */
export interface LoginResponse {
  readonly token: string
  readonly user: UserInfo
}

/** 认证状态 */
export interface AuthState {
  readonly user: UserInfo | null
  readonly token: string | null
  readonly isAuthenticated: boolean
  readonly isLoading: boolean
}

/** 认证提供者配置 */
export interface AuthConfig {
  /** 登录接口路径（如 "/api/auth/login"） */
  readonly loginUrl: string
  /** 获取当前用户信息接口路径（如 "/api/auth/me"） */
  readonly meUrl: string
  /** Token 存储键名（默认 "auth_token"） */
  readonly tokenStorageKey: string
}
