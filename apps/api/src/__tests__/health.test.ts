/**
 * 健康检查路由单元测试。
 * 验证 health 路由在无真实数据库上下文时的基本可达性。
 */

import { describe, expect, it } from "vitest"

import { createHealthRouter } from "../routes/health"

describe("health route", () => {
  it("GET /health 返回 200 与 status=ok", async () => {
    const router = createHealthRouter()
    const response = await router.request("/health")

    expect(response.status).toBe(200)

    const body: unknown = await response.json()
    const typed = body as Record<string, unknown>
    expect(typed).toMatchObject({ status: "ok" })
    expect(typeof typed.timestamp).toBe("string")
  })
})
