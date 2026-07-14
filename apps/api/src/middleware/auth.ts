/**
 * JWT 认证中间件。
 *
 * 从 Authorization header 提取 Bearer token，通过 Supabase Auth 校验。
 * 校验通过后将 userId 注入 Hono context（c.set('userId', ...)），
 * 校验失败返回 401。
 */

import type { Context, Next } from "hono"

import type { AppDependencies } from "../types"

/**
 * 创建认证中间件工厂。
 * 通过闭包注入 deps，避免全局状态。
 */
export function createAuthMiddleware(deps: AppDependencies) {
  return async function authMiddleware(
    c: Context,
    next: Next
  ): Promise<void> {
    const authHeader = c.req.header("Authorization")

    if (!authHeader?.startsWith("Bearer ")) {
      c.status(401)
      c.json({ code: 4010, data: null, message: "未提供有效的认证令牌" })
      return
    }

    const token = authHeader.slice(7)

    try {
      // Supabase Auth 原生 API：getUser 根据 JWT 返回用户信息
      const client = deps.db.supabase as unknown as {
        auth: {
          getUser: (jwt: string) => Promise<{
            data: { user: { id: string } }
            error: Error | null
          }>
        }
      }

      const { data, error } = await client.auth.getUser(token)

      if (error || !data.user) {
        c.status(401)
        c.json({ code: 4011, data: null, message: "认证令牌无效或已过期" })
        return
      }

      c.set("userId", data.user.id)
      await next()
    } catch {
      c.status(401)
      c.json({ code: 4011, data: null, message: "认证令牌无效或已过期" })
    }
  }
}
