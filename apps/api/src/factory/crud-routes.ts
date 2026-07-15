/**
 * 动态 CRUD 路由工厂。
 *
 * 基于 ModelRegistry 的模型定义 + 配置映射表，
 * 自动生成标准 RESTful CRUD 路由，消除手写路由文件的重复代码。
 *
 * 职责：
 * - 标准模型（supplier/material/category/template）：自动生成 GET/POST/PUT/DELETE
 * - 特殊模型（pricing/contract）：通过 hook 注入业务逻辑
 * - 只读模型（person）：仅生成 GET 路由
 *
 * 原则：
 * - 路由工厂不包含任何业务规则，业务规则在 service 层或 hook 中
 * - 所有路由配置集中管理，新增模型只需添加 config 无需新建文件
 */

import { CodeSequenceRepo, type QueryFilter, type SortField } from "@ps/db"
import type { DbClient } from "@ps/db"
import { successResponse } from "@ps/types-base"
import type { Hono } from "hono"

import { Hono as createRouter } from "hono"

import { nextCode } from "../services/code.service"
import type { AppDependencies } from "../types"
import { flatQueries } from "../utils/flat-queries"

// ============================================================================
// 类型定义
// ============================================================================

/** 标准 Repository 接口（所有手写 Repo 的公共方法签名） */
export interface StandardRepo {
  findById: (id: string) => Promise<unknown>
  findPaginated: (params: {
    filters: QueryFilter[]
    sorts: SortField[]
    pagination: { page: number; pageSize: number }
  }) => Promise<{
    data: unknown[]
    total: number
    page: number
    pageSize: number
    totalPages: number
  }>
  insert: (...args: unknown[]) => Promise<unknown>
  update: (...args: unknown[]) => Promise<unknown>
  delete: (id: string) => Promise<unknown>
}

/** 查询过滤映射 */
export interface FilterMapping {
  /** 查询参数名 */
  param: string
  /** 数据库列名 */
  column: string
  /** 过滤操作符 */
  operator: "eq" | "ilike"
}

/** CRUD 路由配置（每个模型一份） */
export interface CrudModelConfig {
  /** 模型名称（对应 registry） */
  name: string
  /** 数据库表名（如 "suppliers"、"categories"） */
  tableName: string
  /** Repository 构造函数 */
  RepoClass: new (db: DbClient) => StandardRepo
  /** 模型中文标签（用于错误消息） */
  label: string
  /** 是否生成编码（如 SUP-2026-0001） */
  codePrefix?: string
  /** 查询参数 → DB 过滤字段映射 */
  queryFilters?: FilterMapping[]
  /** 禁用 POST（创建） */
  disableCreate?: boolean
  /** 禁用 PUT（更新） */
  disableUpdate?: boolean
  /** 禁用 DELETE（删除） */
  disableDelete?: boolean
  /** 自定义创建逻辑（如定价自动失效） */
  onCreate?: (
    deps: AppDependencies,
    body: Record<string, unknown>
  ) => Promise<unknown>
  /** 自定义更新逻辑（如合同锁定检查） */
  onUpdate?: (
    deps: AppDependencies,
    id: string,
    body: Record<string, unknown>
  ) => Promise<unknown>
  /** 额外路由注册（如合同生效/作废/PDF等） */
  extraRoutes?: (router: Hono, deps: AppDependencies) => void
}

// ============================================================================
// 通用过滤构造
// ============================================================================

/**
 * 根据 FilterMapping 和请求查询参数构造 DB QueryFilter。
 * ilike 操作自动包装 %keyword%。
 */
function buildFilters(
  query: Record<string, unknown>,
  mappings: FilterMapping[]
): QueryFilter[] {
  const filters: QueryFilter[] = []

  for (const mapping of mappings) {
    const raw = query[mapping.param]
    if (raw === undefined || raw === null || raw === "") {
      continue
    }

    if (mapping.operator === "ilike") {
      filters.push({
        column: mapping.column,
        operator: "ilike",
        value: `%${String(raw)}%`,
      })
    } else {
      filters.push({
        column: mapping.column,
        operator: "eq",
        value: raw as string,
      })
    }
  }

  return filters
}

// ============================================================================
// 路由工厂
// ============================================================================

/**
 * 创建标准 CRUD 路由。
 *
 * 基于配置自动生成：
 * - GET    /            分页列表
 * - GET    /:id         详情
 * - POST   /            创建（支持 code 生成 + 自定义 hook）
 * - PUT    /:id         更新（支持自定义 hook）
 * - DELETE /:id         删除
 * - 通过 extraRoutes 注入的扩展路由
 *
 * @param model - 模型配置
 * @param schemas - Zod 校验 schema（来自 contracts）
 * @param deps - 应用依赖
 * @returns Hono 路由实例
 */
export function createCrudRoutes(
  model: CrudModelConfig,
  schemas: {
    create: { parse: (data: unknown) => Record<string, unknown> }
    update: { parse: (data: unknown) => Record<string, unknown> }
    query: { parse: (data: unknown) => Record<string, unknown> }
  },
  deps: AppDependencies
): Hono {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const router = new createRouter() as any as Hono

  // ---------- 通用 Repository 实例 ----------
  const repo = new model.RepoClass(deps.db)

  // ---------- GET / — 分页列表 ----------
  router.get("/", async (c) => {
    const query = schemas.query.parse(flatQueries(c.req.queries()))
    const filters = model.queryFilters
      ? buildFilters(query, model.queryFilters)
      : []
    const sorts: SortField[] = []

    const pagination = {
      page: (query.page as number) ?? 1,
      pageSize: (query.pageSize as number) ?? 20,
    }

    const result = await repo.findPaginated({
      filters,
      sorts,
      pagination,
    })

    return c.json(successResponse(result))
  })

  // ---------- GET /:id — 详情 ----------
  router.get("/:id", async (c) => {
    const row = await repo.findById(c.req.param("id"))
    return c.json(successResponse(row))
  })

  // ---------- POST / — 创建 ----------
  if (!model.disableCreate) {
    router.post("/", async (c) => {
      const body = schemas.create.parse(await c.req.json())

      let row: unknown

      if (model.onCreate) {
        row = await model.onCreate(deps, body as Record<string, unknown>)
      } else {
        // 标准创建：生成编码 + insert
        let data: Record<string, unknown> = body as Record<string, unknown>
        if (model.codePrefix) {
          const codeRepo = new CodeSequenceRepo(deps.db)
          const code = await nextCode(
            codeRepo,
            model.tableName,
            model.codePrefix
          )
          data = { ...data, code }
        }
        row = await repo.insert(data)
      }

      return c.json(successResponse(row), 201)
    })
  }

  // ---------- PUT /:id — 更新 ----------
  if (!model.disableUpdate) {
    router.put("/:id", async (c) => {
      const body = schemas.update.parse(await c.req.json())

      let row: unknown

      if (model.onUpdate) {
        row = await model.onUpdate(
          deps,
          c.req.param("id"),
          body as Record<string, unknown>
        )
      } else {
        row = await repo.update(c.req.param("id"), body)
      }

      return c.json(successResponse(row))
    })
  }

  // ---------- DELETE /:id — 删除 ----------
  if (!model.disableDelete) {
    router.delete("/:id", async (c) => {
      const id = c.req.param("id")
      const row = await repo.findById(id)
      if (row === null) {
        return c.json(successResponse(null, `${model.label}不存在`))
      }
      await repo.delete(id)
      return c.json(successResponse(null))
    })
  }

  // ---------- 扩展路由（如合同的状态转换、PDF 等） ----------
  if (model.extraRoutes) {
    model.extraRoutes(router, deps)
  }

  return router
}
