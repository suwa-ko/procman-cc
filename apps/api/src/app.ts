/**
 * Hono 应用工厂。
 *
 * 接收数据库客户端（由 index.ts DI 注入），
 * 注册全局中间件与路由，返回 Hono 实例供 serve 启动。
 */

import { Hono } from "hono"

import { createAuthMiddleware } from "./middleware/auth"
import { errorHandler } from "./middleware/error-handler"
import { authRoutes } from "./routes/auth.route"
import { categoryRoutes } from "./routes/category.route"
import { contractRoutes } from "./routes/contract.route"
import { health } from "./routes/health"
import { materialRoutes } from "./routes/material.route"
import { pdfRoutes } from "./routes/pdf.route"
import { personRoutes } from "./routes/person.route"
import { pricingRoutes } from "./routes/pricing.route"
import { supplierRoutes } from "./routes/supplier.route"
import { templateRoutes } from "./routes/template.route"
import type { AppDependencies } from "./types"

/**
 * 创建 Hono 应用实例
 */
export function createApp(deps: AppDependencies): Hono {
  const app = new Hono()

  // ---------- 全局中间件 ----------

  app.use("*", errorHandler)

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

  // ---------- 无需认证的路由 ----------
  app.route("/api", health(deps))
  app.route("/api/auth", authRoutes(deps))

  // ---------- JWT 认证中间件（保护后续所有路由） ----------
  const authMiddleware = createAuthMiddleware(deps)

  // ---------- 需要认证的业务路由 ----------
  app.use("/api/suppliers/*", authMiddleware)
  app.route("/api/suppliers", supplierRoutes(deps))

  app.use("/api/materials/*", authMiddleware)
  app.route("/api/materials", materialRoutes(deps))

  app.use("/api/categories/*", authMiddleware)
  app.route("/api/categories", categoryRoutes(deps))

  app.use("/api/pricings/*", authMiddleware)
  app.route("/api/pricings", pricingRoutes(deps))

  app.use("/api/contracts/*", authMiddleware)
  app.route("/api/contracts", contractRoutes(deps))
  app.route("/api/contracts", pdfRoutes(deps))

  app.use("/api/templates/*", authMiddleware)
  app.route("/api/templates", templateRoutes(deps))

  app.use("/api/persons/*", authMiddleware)
  app.route("/api/persons", personRoutes(deps))

  return app
}
