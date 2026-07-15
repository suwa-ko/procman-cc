/**
 * Hono 应用工厂。
 *
 * 接收数据库客户端（由 index.ts DI 注入），
 * 注册全局中间件、ModelRegistry、路由与 Swagger 文档。
 */

import {
  categorySchema,
  contractSchema,
  createCategorySchema,
  createContractSchema,
  createMaterialSchema,
  createPricingSchema,
  createSupplierSchema,
  createTemplateSchema,
  materialSchema,
  personSchema,
  pricingSchema,
  supplierSchema,
  templateSchema,
  updateCategorySchema,
  updateContractSchema,
  updateMaterialSchema,
  updatePricingSchema,
  updateSupplierSchema,
  updateTemplateSchema,
  categoryQuerySchema,
  contractQuerySchema,
  materialQuerySchema,
  pricingQuerySchema,
  supplierQuerySchema,
  templateQuerySchema,
  personQuerySchema,
} from "@ps/contracts"
import { ModelRegistry } from "@ps/model-core"
import { Hono } from "hono"

import { generateOpenApiDoc } from "./docs/openapi"
import { swaggerHtml } from "./docs/swagger-ui"
import { MODEL_CONFIGS, createCrudRoutes } from "./factory"
import { createAuthMiddleware } from "./middleware/auth"
import { errorHandler } from "./middleware/error-handler"
import { authRoutes } from "./routes/auth.route"
import { health } from "./routes/health"
import type { AppDependencies } from "./types"

/**
 * 初始化 ModelRegistry，注册所有业务模型。
 * 该方法同时用于 OpenAPI 文档生成与运行时模型信息查询。
 */
export function initModelRegistry(registry: ModelRegistry): void {
  registry.register({
    name: "supplier",
    entitySchema: supplierSchema as Parameters<
      typeof registry.register
    >[0]["entitySchema"],
    createSchema: createSupplierSchema as Parameters<
      typeof registry.register
    >[0]["createSchema"],
    updateSchema: updateSupplierSchema as Parameters<
      typeof registry.register
    >[0]["updateSchema"],
    querySchema: supplierQuerySchema as Parameters<
      typeof registry.register
    >[0]["querySchema"],
    relations: [
      { type: "one-to-many", targetModel: "pricing", foreignKey: "supplierId" },
      {
        type: "one-to-many",
        targetModel: "contract",
        foreignKey: "supplierId",
      },
    ],
  })

  registry.register({
    name: "material",
    entitySchema: materialSchema as Parameters<
      typeof registry.register
    >[0]["entitySchema"],
    createSchema: createMaterialSchema as Parameters<
      typeof registry.register
    >[0]["createSchema"],
    updateSchema: updateMaterialSchema as Parameters<
      typeof registry.register
    >[0]["updateSchema"],
    querySchema: materialQuerySchema as Parameters<
      typeof registry.register
    >[0]["querySchema"],
    relations: [
      {
        type: "many-to-one",
        targetModel: "category",
        foreignKey: "categoryId",
      },
      { type: "one-to-many", targetModel: "pricing", foreignKey: "materialId" },
    ],
  })

  registry.register({
    name: "category",
    entitySchema: categorySchema as Parameters<
      typeof registry.register
    >[0]["entitySchema"],
    createSchema: createCategorySchema as Parameters<
      typeof registry.register
    >[0]["createSchema"],
    updateSchema: updateCategorySchema as Parameters<
      typeof registry.register
    >[0]["updateSchema"],
    querySchema: categoryQuerySchema as Parameters<
      typeof registry.register
    >[0]["querySchema"],
  })

  registry.register({
    name: "pricing",
    entitySchema: pricingSchema as Parameters<
      typeof registry.register
    >[0]["entitySchema"],
    createSchema: createPricingSchema as Parameters<
      typeof registry.register
    >[0]["createSchema"],
    updateSchema: updatePricingSchema as Parameters<
      typeof registry.register
    >[0]["updateSchema"],
    querySchema: pricingQuerySchema as Parameters<
      typeof registry.register
    >[0]["querySchema"],
    relations: [
      {
        type: "many-to-one",
        targetModel: "supplier",
        foreignKey: "supplierId",
      },
      {
        type: "many-to-one",
        targetModel: "material",
        foreignKey: "materialId",
      },
    ],
  })

  registry.register({
    name: "contract",
    entitySchema: contractSchema as Parameters<
      typeof registry.register
    >[0]["entitySchema"],
    createSchema: createContractSchema as Parameters<
      typeof registry.register
    >[0]["createSchema"],
    updateSchema: updateContractSchema as Parameters<
      typeof registry.register
    >[0]["updateSchema"],
    querySchema: contractQuerySchema as Parameters<
      typeof registry.register
    >[0]["querySchema"],
    relations: [
      {
        type: "many-to-one",
        targetModel: "supplier",
        foreignKey: "supplierId",
      },
      { type: "many-to-one", targetModel: "person", foreignKey: "handlerId" },
      {
        type: "many-to-one",
        targetModel: "template",
        foreignKey: "templateId",
      },
    ],
  })

  registry.register({
    name: "template",
    entitySchema: templateSchema as Parameters<
      typeof registry.register
    >[0]["entitySchema"],
    createSchema: createTemplateSchema as Parameters<
      typeof registry.register
    >[0]["createSchema"],
    updateSchema: updateTemplateSchema as Parameters<
      typeof registry.register
    >[0]["updateSchema"],
    querySchema: templateQuerySchema as Parameters<
      typeof registry.register
    >[0]["querySchema"],
  })

  registry.register({
    name: "person",
    entitySchema: personSchema as Parameters<
      typeof registry.register
    >[0]["entitySchema"],
    createSchema: personSchema as Parameters<
      typeof registry.register
    >[0]["createSchema"],
    updateSchema: personSchema as Parameters<
      typeof registry.register
    >[0]["updateSchema"],
    querySchema: personQuerySchema as Parameters<
      typeof registry.register
    >[0]["querySchema"],
  })
}

/**
 * 创建 Hono 应用实例
 */
export function createApp(deps: AppDependencies): Hono {
  const app = new Hono()

  // ---------- 初始化模型注册表 ----------
  const registry = new ModelRegistry()
  initModelRegistry(registry)

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

  // ---------- OpenAPI / Swagger 文档（无需认证） ----------

  // OpenAPI 规范 JSON
  app.get("/api/openapi.json", (c) => {
    const baseUrl = new URL(c.req.url).origin
    const doc = generateOpenApiDoc(registry, baseUrl)
    return c.json(doc)
  })

  // Swagger UI 页面
  app.get("/api/docs", (c) => {
    return c.html(swaggerHtml)
  })

  // ---------- 无需认证的路由 ----------
  app.route("/api", health(deps))
  app.route("/api/auth", authRoutes(deps))

  // ---------- JWT 认证中间件 —— 动态保护所有业务路由 ----------
  const authMiddleware = createAuthMiddleware(deps)
  const modelNames = registry.names()

  for (const name of modelNames) {
    const config = MODEL_CONFIGS[name]
    if (!config) {
      continue
    }
    const path = `/api/${config.tableName}`
    app.use(path, authMiddleware)
  }

  // ---------- 业务路由（ModelRegistry 驱动，通过配置表自动生成） ----------

  // Schema 映射：从 registry 获取已注册 schema，提供给工厂做请求校验
  const schemaMap: Record<
    string,
    {
      create: { parse: (data: unknown) => Record<string, unknown> }
      update: { parse: (data: unknown) => Record<string, unknown> }
      query: { parse: (data: unknown) => Record<string, unknown> }
    }
  > = {
    supplier: {
      create: createSupplierSchema as {
        parse: (data: unknown) => Record<string, unknown>
      },
      update: updateSupplierSchema as {
        parse: (data: unknown) => Record<string, unknown>
      },
      query: supplierQuerySchema as {
        parse: (data: unknown) => Record<string, unknown>
      },
    },
    material: {
      create: createMaterialSchema as {
        parse: (data: unknown) => Record<string, unknown>
      },
      update: updateMaterialSchema as {
        parse: (data: unknown) => Record<string, unknown>
      },
      query: materialQuerySchema as {
        parse: (data: unknown) => Record<string, unknown>
      },
    },
    category: {
      create: createCategorySchema as {
        parse: (data: unknown) => Record<string, unknown>
      },
      update: updateCategorySchema as {
        parse: (data: unknown) => Record<string, unknown>
      },
      query: categoryQuerySchema as {
        parse: (data: unknown) => Record<string, unknown>
      },
    },
    pricing: {
      create: createPricingSchema as {
        parse: (data: unknown) => Record<string, unknown>
      },
      update: updatePricingSchema as {
        parse: (data: unknown) => Record<string, unknown>
      },
      query: pricingQuerySchema as {
        parse: (data: unknown) => Record<string, unknown>
      },
    },
    contract: {
      create: createContractSchema as {
        parse: (data: unknown) => Record<string, unknown>
      },
      update: updateContractSchema as {
        parse: (data: unknown) => Record<string, unknown>
      },
      query: contractQuerySchema as {
        parse: (data: unknown) => Record<string, unknown>
      },
    },
    template: {
      create: createTemplateSchema as {
        parse: (data: unknown) => Record<string, unknown>
      },
      update: updateTemplateSchema as {
        parse: (data: unknown) => Record<string, unknown>
      },
      query: templateQuerySchema as {
        parse: (data: unknown) => Record<string, unknown>
      },
    },
    person: {
      create: personSchema as {
        parse: (data: unknown) => Record<string, unknown>
      },
      update: personSchema as {
        parse: (data: unknown) => Record<string, unknown>
      },
      query: personQuerySchema as {
        parse: (data: unknown) => Record<string, unknown>
      },
    },
  }

  for (const name of modelNames) {
    const config = MODEL_CONFIGS[name]
    const schemas = schemaMap[name]
    if (!config || !schemas) {
      continue
    }
    const path = `/api/${config.tableName}`
    app.route(path, createCrudRoutes(config, schemas, deps))
  }

  return app
}
