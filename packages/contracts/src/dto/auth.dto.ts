import type { LoginInput, RegisterInput } from "@ps/model"

export type { LoginInput, RegisterInput }

/** 登录请求 */
export type LoginRequest = LoginInput

/** 注册请求 */
export type RegisterRequest = RegisterInput

/** 登录响应 */
export interface LoginResponse {
  token: string
  person: {
    id: string
    name: string
  }
}
