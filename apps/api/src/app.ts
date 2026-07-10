/**
 * Hono 应用工厂。
 *
 * 接收数据库客户端与日志实例（由 index.ts DI 注入），
 * 注册全局中间件与路由，返回 Hono 实例供 serve 启动。
 */

import { Hono } from "hono"

import { health } from "./routes/health"
import type { AppDependencies } from "./types"

/**
 * 创建 Hono 应用实例
 */
export function createApp(deps: AppDependencies): Hono {
  const app = new Hono()

  // ---------- 全局中间件 ----------

  // 请求日志
  app.use("*", async (c, next) => {
    const start = Date.now()
    await next()
    const ms = Date.now() - start
    deps.db.logger.info(`${c.req.method} ${c.req.url}`, {
      status: c.res.status,
      duration: `${ms}ms`,
    })
  })

  // ---------- 路由注册 ----------
  app.route("/api", health(deps))

  return app
}
