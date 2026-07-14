
import {
  createTemplateSchema,
  templateQuerySchema,
  updateTemplateSchema,
} from "@ps/contracts"
import {
  CodeSequenceRepo,
  TemplateRepo,
  type QueryFilter,
  type SortField,
} from "@ps/db"
import { successResponse } from "@ps/types-base"
import { Hono } from "hono"

import { nextCode } from "../services/code.service"
import type { AppDependencies } from "../types"

export function templateRoutes(deps: AppDependencies): Hono {
  const repo = new TemplateRepo(deps.db)
  const codeRepo = new CodeSequenceRepo(deps.db)
  const router = new Hono()

  router.get("/", async (c) => {
    const query = templateQuerySchema.parse(c.req.queries())
    const filters: QueryFilter[] = []
    const sorts: SortField[] = []

    if (query.keyword) {
      filters.push({
        column: "name",
        operator: "ilike",
        value: `%${query.keyword}%`,
      })
    }
    if (query.contractType) {
      filters.push({
        column: "contractType",
        operator: "eq",
        value: query.contractType,
      })
    }
    if (query.enabled !== undefined) {
      filters.push({
        column: "enabled",
        operator: "eq",
        value: query.enabled,
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
    const body = createTemplateSchema.parse(await c.req.json())
    const code = await nextCode(codeRepo, "templates", "TPL")
    const row = await repo.insert({ ...body, code })
    return c.json(successResponse(row), 201)
  })

  router.put("/:id", async (c) => {
    const body = updateTemplateSchema.parse(await c.req.json())
    const row = await repo.update(c.req.param("id"), body)
    return c.json(successResponse(row))
  })

  router.delete("/:id", async (c) => {
    const row = await repo.findById(c.req.param("id"))
    if (row === null) {
      return c.json(successResponse(null, "模板不存在"))
    }
    await repo.delete(c.req.param("id"))
    return c.json(successResponse(null))
  })

  return router
}
