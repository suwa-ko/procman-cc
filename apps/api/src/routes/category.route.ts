
import {
  createCategorySchema,
  categoryQuerySchema,
  updateCategorySchema,
} from "@ps/contracts"
import { CategoryRepo, type QueryFilter, type SortField } from "@ps/db"
import { successResponse } from "@ps/types-base"
import { Hono } from "hono"

import type { AppDependencies } from "../types"

export function categoryRoutes(deps: AppDependencies): Hono {
  const repo = new CategoryRepo(deps.db)
  const router = new Hono()

  router.get("/", async (c) => {
    const query = categoryQuerySchema.parse(c.req.queries())
    const filters: QueryFilter[] = []
    const sorts: SortField[] = []

    if (query.keyword) {
      filters.push({
        column: "name",
        operator: "ilike",
        value: `%${query.keyword}%`,
      })
    }
    if (query.parentId) {
      filters.push({
        column: "parentId",
        operator: "eq",
        value: query.parentId,
      })
    }

    const result = await repo.findPaginated({
      filters,
      sorts,
      pagination: { page: query.page, pageSize: query.pageSize },
    })

    return c.json(successResponse(result))
  })

  router.get("/:id", async (c) => {
    const row = await repo.findById(c.req.param("id"))
    return c.json(successResponse(row))
  })

  router.post("/", async (c) => {
    const body = createCategorySchema.parse(await c.req.json())
    const row = await repo.insert(body)
    return c.json(successResponse(row), 201)
  })

  router.put("/:id", async (c) => {
    const body = updateCategorySchema.parse(await c.req.json())
    const row = await repo.update(c.req.param("id"), body)
    return c.json(successResponse(row))
  })

  router.delete("/:id", async (c) => {
    const row = await repo.findById(c.req.param("id"))
    if (row === null) {
      return c.json(successResponse(null, "品类不存在"))
    }
    await repo.delete(c.req.param("id"))
    return c.json(successResponse(null))
  })

  return router
}
