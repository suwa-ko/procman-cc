
import { personQuerySchema } from "@ps/contracts"
import { PersonRepo, type QueryFilter, type SortField } from "@ps/db"
import { successResponse } from "@ps/types-base"
import { Hono } from "hono"

import type { AppDependencies } from "../types"

/**
 * 人员路由。
 * 人员主数据来自外部系统，本路由仅提供查询与冗余同步。
 * 不提供新增/编辑/删除（铁则 5.2）。
 */
export function personRoutes(deps: AppDependencies): Hono {
  const repo = new PersonRepo(deps.db)
  const router = new Hono()

  router.get("/", async (c) => {
    const query = personQuerySchema.parse(c.req.queries())
    const filters: QueryFilter[] = []
    const sorts: SortField[] = []

    if (query.keyword) {
      filters.push({
        column: "name",
        operator: "ilike",
        value: `%${query.keyword}%`,
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

  return router
}
