import { z } from "zod"

/**
 * 认证校验 schema
 */

/** 登录请求 */
export const loginSchema = z.object({
  username: z.string().min(1, "用户名不可为空"),
  password: z.string().min(1, "密码不可为空"),
})

/** 注册请求 */
export const registerSchema = z.object({
  username: z.string().min(1, "用户名不可为空"),
  password: z.string().min(6, "密码长度至少 6 位"),
  personId: z.string().min(1, "人员 ID 不可为空"),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
