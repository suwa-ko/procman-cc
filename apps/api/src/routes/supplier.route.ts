
import {
  createSupplierSchema,
  supplierQuerySchema,
  updateSupplierSchema,
} from "@ps/contracts"
import {
  CodeSequenceRepo,
  SupplierRepo,
  type QueryFilter,
  type SortField,
} from "@ps/db"
import { successResponse } from "@ps/types-base"
import { Hono } from "hono"

import { nextCode } from "../services/code.service"
import type { AppDependencies } from "../types"

export function supplierRoutes(deps: AppDependencies): Hono {
  const repo = new SupplierRepo(deps.db)
  const codeRepo = new CodeSequenceRepo(deps.db)
  const router = new Hono()

  // ---------- GET /suppliers — 分页列表 ----------
  router.get("/", async (c) => {
    const query = supplierQuerySchema.parse(c.req.queries())
    const filters: QueryFilter[] = []
    const sorts: SortField[] = []

    if (query.keyword) {
      filters.push({
        column: "name",
        operator: "ilike",
        value: `%${query.keyword}%`,
      })
    }
    if (query.status) {
      filters.push({ column: "status", operator: "eq", value: query.status })
    }

    const result = await repo.findPaginated({
      filters,
      sorts,
      pagination: { page: query.page, pageSize: query.pageSize },
    })

    return c.json(successResponse(result))
  })

  // ---------- GET /suppliers/:id — 详情 ----------
  router.get("/:id", async (c) => {
    const row = await repo.findById(c.req.param("id"))
    return c.json(successResponse(row))
  })

  // ---------- POST /suppliers — 创建 ----------
  router.post("/", async (c) => {
    const body = createSupplierSchema.parse(await c.req.json())
    const code = await nextCode(codeRepo, "suppliers", "SUP")
    const row = await repo.insert({ ...body, code })
    return c.json(successResponse(row), 201)
  })

  // ---------- PUT /suppliers/:id — 更新 ----------
  router.put("/:id", async (c) => {
    const body = updateSupplierSchema.parse(await c.req.json())
    const row = await repo.update(c.req.param("id"), body)
    return c.json(successResponse(row))
  })

  // ---------- DELETE /suppliers/:id — 删除 ----------
  router.delete("/:id", async (c) => {
    const row = await repo.findById(c.req.param("id"))
    if (row === null) {
      return c.json(successResponse(null, "供应商不存在"))
    }
    await repo.delete(c.req.param("id"))
    return c.json(successResponse(null))
  })

  return router
}
