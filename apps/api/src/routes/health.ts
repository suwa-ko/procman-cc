/**
 * 健康检查路由 — 验证服务可达性与 DI 接线完整性。
 */

import { Hono } from "hono"

import type { AppDependencies } from "../types"

/** Supabase 标准响应形状（兼容性判断用） */
interface SupabaseResponse {
  data: unknown[]
  error: unknown
}

/** 判断返回值是否接近 Supabase { data, error } 结构 */
function isSupabaseResponse(value: unknown): value is SupabaseResponse {
  if (typeof value !== "object" || value === null) {
    return false
  }
  const obj = value as Record<string, unknown>
  return "data" in obj && Array.isArray(obj.data) && "error" in obj
}

/**
 * 创建 health 路由（用于探测 DI 接线完整性）。
 * 返回 JSON 包含数据库状态、时间戳等信息。
 *
 * 兼容两种数据库响应：
 * - 真实 Supabase：返回 { data: [...], error: null | Error }
 * - Mock 客户端：  返回直接的数据数组 [...]
 */
export function health(deps: AppDependencies): Hono {
  const router = new Hono()

  router.get("/health", async (c) => {
    let dbStatus: string

    try {
      const result: unknown = await deps.db.supabase
        .from("suppliers")
        .select("id", { count: "exact", head: true })

      if (Array.isArray(result)) {
        // Mock 客户端：直接返回数据数组
        dbStatus = "mock"
      } else if (isSupabaseResponse(result)) {
        // 真实 Supabase：{ data, error }
        dbStatus = result.error === null ? "ok" : "error"
      } else {
        dbStatus = "unknown"
      }
    } catch {
      dbStatus = "error"
    }

    return c.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      dependencies: {
        database: dbStatus,
      },
    })
  })

  return router
}

/** 创建独立 health 路由（不依赖 AppDependencies，仅检查 HTTP 可达性） */
export function createHealthRouter(): Hono {
  const router = new Hono()

  router.get("/health", (c) => {
    return c.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    })
  })

  return router
}
