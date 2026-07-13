/**
 * 认证 MSW handler — 登录/注册
 */

import type { LoginRequest, RegisterRequest } from "@ps/contracts"
import { ResponseCode } from "@ps/types-base"
import { http } from "msw"
import type { HttpHandler } from "msw"

import type { AuthStore } from "../stores/auth.store"

import { fail, ok, parseBody } from "./helpers"

export function createAuthHandlers(store: AuthStore): HttpHandler[] {
  return [
    http.post("/api/auth/login", async ({ request }) => {
      const body = await parseBody<LoginRequest>(request)
      if (!body?.username || !body?.password) {
        return fail(ResponseCode.ValidationError, "用户名和密码不能为空")
      }
      try {
        return ok(store.login(body))
      } catch (err) {
        const msg = err instanceof Error ? err.message : "登录失败"
        return fail(ResponseCode.Unauthorized, msg)
      }
    }),

    http.post("/api/auth/register", async ({ request }) => {
      const body = await parseBody<RegisterRequest>(request)
      if (!body?.username || !body?.password) {
        return fail(ResponseCode.ValidationError, "用户名和密码不能为空")
      }
      try {
        return ok(store.register(body))
      } catch (err) {
        const msg = err instanceof Error ? err.message : "注册失败"
        return fail(ResponseCode.Conflict, msg)
      }
    }),
  ]
}
