/**
 * OpenAPI 3.0 规范生成器。
 *
 * 基于 ModelRegistry 注册的模型定义，自动生成所有业务实体的标准 CRUD 路由文档。
 * 不依赖 Hono 路由实现，纯数据驱动的规范生成。
 */

import type { ModelRegistry } from "@ps/model-core"

// ================================================================
// Zod 内部类型映射
// ================================================================

interface ZodDef {
  typeName?: string
  checks?: { kind: string; value?: unknown }[]
  values?: string[]
  innerType?: { _def?: ZodDef }
}

// ================================================================
// Schema -> OpenAPI
// ================================================================

function zodToOpenApiSchema(schema: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = { type: "object", properties: {} }
  const props = result.properties as Record<string, unknown>

  if (schema.shape && typeof schema.shape === "object") {
    const shape = schema.shape as Record<string, { _def?: ZodDef }>
    for (const key of Object.keys(shape)) {
      const def = shape[key]?._def
      if (!def) {
        continue
      }

      const { typeName } = def
      let propSchema: Record<string, unknown> = {}

      switch (typeName) {
        case "ZodString": {
          propSchema = { type: "string" }
          const minCheck = def.checks?.find((c) => c.kind === "min")
          const maxCheck = def.checks?.find((c) => c.kind === "max")
          if (minCheck?.value !== undefined) {
            propSchema.minLength = minCheck.value as number
          }
          if (maxCheck?.value !== undefined) {
            propSchema.maxLength = maxCheck.value as number
          }
          break
        }
        case "ZodNumber": {
          propSchema = { type: "number" }
          const minCheck = def.checks?.find((c) => c.kind === "min")
          const maxCheck = def.checks?.find((c) => c.kind === "max")
          if (minCheck?.value !== undefined) {
            propSchema.minimum = minCheck.value as number
          }
          if (maxCheck?.value !== undefined) {
            propSchema.maximum = maxCheck.value as number
          }
          break
        }
        case "ZodBoolean": {
          propSchema = { type: "boolean" }
          break
        }
        case "ZodEnum": {
          propSchema = { type: "string", enum: def.values ?? [] }
          break
        }
        case "ZodDate":
          propSchema = { type: "string", format: "date" }
          break
        case "ZodOptional": {
          if (def.innerType?._def?.typeName === "ZodString") {
            propSchema = { type: "string" }
          } else if (def.innerType?._def?.typeName === "ZodNumber") {
            propSchema = { type: "number" }
          } else {
            propSchema = { type: "string" }
          }
          break
        }
        default:
          propSchema = { type: "string" }
      }

      props[key] = propSchema
    }
  }

  return result
}

// ================================================================
// 辅助类型
// ================================================================

interface OpenApiDoc {
  openapi: string
  info: Record<string, unknown>
  servers: Record<string, unknown>[]
  paths: Record<string, unknown>
  components: Record<string, unknown>
  security: Record<string, unknown>[]
}

interface ListParam {
  name: string
  in: string
  schema: Record<string, unknown>
  description?: string
}

interface PathParam {
  name: string
  in: string
  required: boolean
  schema: Record<string, unknown>
}

interface PathItem {
  tags?: string[]
  summary?: string
  operationId?: string
  parameters?: (ListParam | PathParam)[]
  responses?: Record<string, unknown>
  security?: Record<string, unknown>[]
  requestBody?: Record<string, unknown>
}

interface PathEntry {
  get?: PathItem
  post?: PathItem
  put?: PathItem
  delete?: PathItem
  patch?: PathItem
}

// ================================================================
// 文档生成
// ================================================================

export function generateOpenApiDoc(registry: ModelRegistry, baseUrl: string): OpenApiDoc {
  const models = registry.names()
  const paths: Record<string, PathEntry> = {}

  for (const name of models) {
    const def = registry.get(name)
    if (!def) {
      continue
    }

    const tag = modelTag(name)
    const basePath = `/api/${namePlural(name)}`

    const createSchema = zodToOpenApiSchema(def.createSchema as unknown as Record<string, unknown>)
    const updateSchema = zodToOpenApiSchema(def.updateSchema as unknown as Record<string, unknown>)

    // GET /api/{plural} — 分页列表
    paths[basePath] = {
      ...paths[basePath],
      get: {
        tags: [tag],
        summary: `获取${tag}列表`,
        operationId: `list${tag}`,
        parameters: listParameters(),
        responses: paginatedResponse(),
        security: modelSecurity(),
      },
    }

    // POST /api/{plural} — 创建
    paths[basePath] = {
      ...paths[basePath],
      post: {
        tags: [tag],
        summary: `创建${tag}`,
        operationId: `create${tag}`,
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: createSchema },
          },
        },
        responses: {
          "201": { description: "创建成功" },
          "400": { description: "参数校验失败" },
        },
        security: modelSecurity(),
      },
    }

    // GET /api/{plural}/{id} — 详情
    paths[`${basePath}/{id}`] = {
      ...paths[`${basePath}/{id}`],
      get: {
        tags: [tag],
        summary: `获取${tag}详情`,
        operationId: `get${tag}`,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          "200": { description: "成功" },
          "404": { description: "未找到" },
        },
        security: modelSecurity(),
      },
    }

    // PUT /api/{plural}/{id} — 更新
    paths[`${basePath}/{id}`] = {
      ...paths[`${basePath}/{id}`],
      put: {
        tags: [tag],
        summary: `更新${tag}`,
        operationId: `update${tag}`,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: updateSchema },
          },
        },
        responses: {
          "200": { description: "更新成功" },
          "404": { description: "未找到" },
        },
        security: modelSecurity(),
      },
    }

    // DELETE /api/{plural}/{id} — 删除（person 除外）
    if (name !== "person") {
      paths[`${basePath}/{id}`] = {
        ...paths[`${basePath}/{id}`],
        delete: {
          tags: [tag],
          summary: `删除${tag}`,
          operationId: `delete${tag}`,
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
          responses: {
            "200": { description: "删除成功" },
            "404": { description: "未找到" },
          },
          security: modelSecurity(),
        },
      }
    }
  }

  // 合同特有端点
  addContractPaths(paths)
  // 认证端点
  addAuthPaths(paths)
  // 健康检查
  addHealthPath(paths)

  return {
    openapi: "3.0.3",
    info: {
      title: "采购管理系统 API",
      version: "1.0.0",
      description: "采购管理系统后端 API，提供供应商、物料、合同、定价等业务实体的完整 CRUD 操作。",
    },
    servers: [{ url: baseUrl }],
    paths,
    components: {
      schemas: buildSchemas(),
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "在登录接口获取 token 后，在 Authorization header 中填入 `Bearer <token>`",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  }
}

// ================================================================
// Schema 定义
// ================================================================

function buildSchemas(): Record<string, unknown> {
  return {
    LoginRequest: {
      type: "object",
      required: ["username", "password"],
      properties: {
        username: { type: "string", example: "zhangsan" },
        password: { type: "string", format: "password", example: "123456", minLength: 6 },
      },
    },
    RegisterRequest: {
      type: "object",
      required: ["username", "password", "personId"],
      properties: {
        username: { type: "string" },
        password: { type: "string", format: "password", minLength: 6 },
        personId: { type: "string", format: "uuid" },
      },
    },
    ApiResponse: {
      type: "object",
      properties: {
        code: { type: "integer", example: 0 },
        data: { description: "响应数据" },
        message: { type: "string", example: "ok" },
      },
    },
    PaginatedResponse: {
      type: "object",
      properties: {
        code: { type: "integer", example: 0 },
        data: {
          type: "object",
          properties: {
            items: { type: "array", items: { type: "object" } },
            total: { type: "integer" },
            page: { type: "integer" },
            pageSize: { type: "integer" },
          },
        },
        message: { type: "string" },
      },
    },
    CreateSupplierRequest: {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string" },
        creditCode: { type: "string", minLength: 18, maxLength: 18, description: "统一社会信用代码，18位" },
        contactPerson: { type: "string" },
        contactPhone: { type: "string" },
        contactEmail: { type: "string" },
        address: { type: "string" },
        businessScope: { type: "string" },
        status: { type: "string", enum: ["active", "frozen", "obsolete"] },
        remark: { type: "string" },
      },
    },
    CreateMaterialRequest: {
      type: "object",
      required: ["name", "unit", "categoryId"],
      properties: {
        name: { type: "string" },
        spec: { type: "string" },
        unit: { type: "string" },
        categoryId: { type: "string", format: "uuid" },
        description: { type: "string" },
      },
    },
    CreateCategoryRequest: {
      type: "object",
      required: ["name"],
      properties: {
        code: { type: "string" },
        name: { type: "string" },
        parentId: { type: "string", format: "uuid" },
        sortOrder: { type: "integer", default: 0 },
      },
    },
    CreatePricingRequest: {
      type: "object",
      required: ["supplierId", "materialId", "unitPrice", "currency"],
      properties: {
        supplierId: { type: "string", format: "uuid" },
        materialId: { type: "string", format: "uuid" },
        unitPrice: { type: "number", minimum: 0.01, description: "单价（元），最多两位小数" },
        currency: { type: "string", enum: ["CNY"], default: "CNY" },
        remark: { type: "string" },
      },
    },
    CreateContractRequest: {
      type: "object",
      required: ["name", "type", "supplierId", "handlerId", "handlerName", "templateId"],
      properties: {
        name: { type: "string" },
        type: { type: "string", enum: ["purchase_contract", "nda"] },
        supplierId: { type: "string", format: "uuid" },
        handlerId: { type: "string" },
        handlerName: { type: "string" },
        templateId: { type: "string", format: "uuid" },
        totalAmount: { type: "number" },
        effectiveDate: { type: "string", format: "date" },
        expirationDate: { type: "string", format: "date" },
        companyName: { type: "string" },
        remark: { type: "string" },
      },
    },
    CreateTemplateRequest: {
      type: "object",
      required: ["name", "contractType", "htmlContent"],
      properties: {
        name: { type: "string" },
        contractType: { type: "string", enum: ["purchase_contract", "nda"] },
        htmlContent: { type: "string", description: "Handlebars 模板 HTML" },
        variables: { type: "object" },
        enabled: { type: "boolean" },
      },
    },
  }
}

// ================================================================
// 辅助函数
// ================================================================

function modelTag(name: string): string {
  const map: Record<string, string> = {
    supplier: "供应商",
    material: "物料",
    category: "品类",
    pricing: "定价",
    contract: "合同",
    template: "模板",
    person: "人员",
  }
  return map[name] ?? name
}

function namePlural(name: string): string {
  const plurals: Record<string, string> = {
    supplier: "suppliers",
    material: "materials",
    category: "categories",
    pricing: "pricings",
    contract: "contracts",
    template: "templates",
    person: "persons",
  }
  return plurals[name] ?? `${name}s`
}

function listParameters(): ListParam[] {
  return [
    { name: "page", in: "query", schema: { type: "integer", default: 1 }, description: "页码" },
    { name: "pageSize", in: "query", schema: { type: "integer", default: 20 }, description: "每页条数" },
    { name: "keyword", in: "query", schema: { type: "string" }, description: "搜索关键词" },
    { name: "status", in: "query", schema: { type: "string" }, description: "状态筛选" },
  ]
}

function paginatedResponse(): Record<string, unknown> {
  return {
    "200": {
      description: "分页列表",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/PaginatedResponse" },
        },
      },
    },
  }
}

function modelSecurity(): Record<string, unknown>[] {
  return [{ bearerAuth: [] }]
}

function addContractPaths(paths: Record<string, PathEntry>): void {
  paths["/api/contracts/{id}/entries"] = {
    get: {
      tags: ["合同"],
      summary: "获取合同条目",
      operationId: "getContractEntries",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: { "200": { description: "成功" } },
      security: [{ bearerAuth: [] }],
    },
  }
  for (const [action, desc] of [
    ["activate", "确认生效"],
    ["return-to-draft", "退回草稿"],
    ["void", "作废"],
  ] as [string, string][]) {
    paths[`/api/contracts/{id}/${action}`] = {
      patch: {
        tags: ["合同"],
        summary: desc,
        operationId: `${action.replace(/-/g, "")}Contract`,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          "200": { description: "操作成功" },
          "409": { description: "状态不允许" },
        },
        security: [{ bearerAuth: [] }],
      },
    }
  }
  paths["/api/contracts/{id}/pdf"] = {
    get: {
      tags: ["合同"],
      summary: "导出合同 PDF",
      operationId: "exportContractPdf",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: {
        "200": { description: "PDF 文件", content: { "application/pdf": { schema: { type: "string", format: "binary" } } } },
        "404": { description: "合同不存在" },
      },
      security: [{ bearerAuth: [] }],
    },
  }
}

function addAuthPaths(paths: Record<string, PathEntry>): void {
  paths["/api/auth/login"] = {
    post: {
      tags: ["认证"],
      summary: "用户登录",
      operationId: "login",
      requestBody: {
        required: true,
        content: {
          "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } },
        },
      },
      responses: {
        "200": { description: "登录成功，返回 token" },
        "401": { description: "用户名或密码错误" },
      },
      security: [],
    },
  }
  paths["/api/auth/register"] = {
    post: {
      tags: ["认证"],
      summary: "用户注册",
      operationId: "register",
      requestBody: {
        required: true,
        content: {
          "application/json": { schema: { $ref: "#/components/schemas/RegisterRequest" } },
        },
      },
      responses: {
        "201": { description: "注册成功" },
        "409": { description: "用户名已存在" },
      },
      security: [],
    },
  }
}

function addHealthPath(paths: Record<string, PathEntry>): void {
  paths["/api/health"] = {
    get: {
      tags: ["系统"],
      summary: "健康检查",
      operationId: "healthCheck",
      responses: {
        "200": {
          description: "服务正常",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", example: "ok" },
                  timestamp: { type: "string" },
                  dependencies: { type: "object" },
                },
              },
            },
          },
        },
      },
      security: [],
    },
  }
}
