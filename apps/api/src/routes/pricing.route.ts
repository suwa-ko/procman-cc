
import {
  createPricingSchema,
  pricingQuerySchema,
  updatePricingSchema,
} from "@ps/contracts"
import {
  CodeSequenceRepo,
  PricingRepo,
  type QueryFilter,
  type SortField,
} from "@ps/db"
import { successResponse } from "@ps/types-base"
import { Hono } from "hono"

import { PriceService } from "../services/price.service"
import type { AppDependencies } from "../types"

export function pricingRoutes(deps: AppDependencies): Hono {
  const repo = new PricingRepo(deps.db)
  const codeRepo = new CodeSequenceRepo(deps.db)
  const service = new PriceService(repo, codeRepo)
  const router = new Hono()

  // ---------- GET /pricings — 分页列表 ----------
  router.get("/", async (c) => {
    const query = pricingQuerySchema.parse(c.req.queries())
    const filters: QueryFilter[] = []
    const sorts: SortField[] = []

    if (query.supplierId) {
      filters.push({
        column: "supplierId",
        operator: "eq",
        value: query.supplierId,
      })
    }
    if (query.materialId) {
      filters.push({
        column: "materialId",
        operator: "eq",
        value: query.materialId,
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

  // ---------- GET /pricings/:id — 详情 ----------
  router.get("/:id", async (c) => {
    const row = await repo.findById(c.req.param("id"))
    return c.json(successResponse(row))
  })

  // ---------- POST /pricings — 创建（触发自动失效） ----------
  router.post("/", async (c) => {
    const body = createPricingSchema.parse(await c.req.json())
    const row = await service.create(body)
    return c.json(successResponse(row), 201)
  })

  // ---------- PUT /pricings/:id — 更新 ----------
  router.put("/:id", async (c) => {
    const body = updatePricingSchema.parse(await c.req.json())
    const row = await repo.update(c.req.param("id"), body)
    return c.json(successResponse(row))
  })

  // ---------- DELETE /pricings/:id — 删除 ----------
  router.delete("/:id", async (c) => {
    const row = await repo.findById(c.req.param("id"))
    if (row === null) {
      return c.json(successResponse(null, "定价不存在"))
    }
    await repo.delete(c.req.param("id"))
    return c.json(successResponse(null))
  })

  return router
}
