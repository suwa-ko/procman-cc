
import { loginSchema, registerSchema } from "@ps/contracts"
import { successResponse } from "@ps/types-base"
import { Hono } from "hono"

import type { AppDependencies } from "../types"

/**
 * 认证路由 — 委托 Supabase Auth 处理登录/注册。
 *
 * 注意：此处通过 `deps.db.supabase` 底层 Supabase client 调用 auth API，
 * 而非通过 @ps/db 仓储层（auth 不属于实体 CRUD 范畴）。
 */
export function authRoutes(deps: AppDependencies): Hono {
  const router = new Hono()

  // ---------- POST /auth/login — 登录 ----------
  router.post("/login", async (c) => {
    const body = loginSchema.parse(await c.req.json())
    // Supabase client 原生支持 auth API（不通过 DbSupabase 类型约束）
    const client = deps.db.supabase as unknown as { auth: {
      signInWithPassword: (credentials: {
        email: string
        password: string
      }) => Promise<{
        data: { session: { access_token: string }; user: unknown }
        error: Error | null
      }>
    } }
    const { data, error } = await client.auth.signInWithPassword({
      email: body.username,
      password: body.password,
    })

    if (error) {
      return c.json({ code: 4010, data: null, message: error.message }, 401)
    }

    return c.json(
      successResponse({
        token: data.session.access_token,
        user: data.user,
      })
    )
  })

  // ---------- POST /auth/register — 注册 ----------
  router.post("/register", async (c) => {
    const body = registerSchema.parse(await c.req.json())
    const client = deps.db.supabase as unknown as { auth: {
      signUp: (credentials: {
        email: string
        password: string
      }) => Promise<{
        data: unknown
        error: Error | null
      }>
    } }
    const { data, error } = await client.auth.signUp({
      email: body.username,
      password: body.password,
    })

    if (error) {
      return c.json({ code: 4090, data: null, message: error.message }, 409)
    }

    return c.json(successResponse(data), 201)
  })

  return router
}
