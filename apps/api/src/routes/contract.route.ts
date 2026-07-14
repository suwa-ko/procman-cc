
import {
  contractQuerySchema,
  ContractStatus,
  createContractSchema,
  updateContractSchema,
} from "@ps/contracts"
import {
  CodeSequenceRepo,
  ContractEntryRepo,
  ContractRepo,
  type QueryFilter,
  type SortField,
} from "@ps/db"
import { successResponse } from "@ps/types-base"
import { Hono } from "hono"

import { nextCode } from "../services/code.service"
import { ContractService } from "../services/contract.service"
import type { AppDependencies } from "../types"

export function contractRoutes(deps: AppDependencies): Hono {
  const repo = new ContractRepo(deps.db)
  const entryRepo = new ContractEntryRepo(deps.db)
  const codeRepo = new CodeSequenceRepo(deps.db)
  const service = new ContractService(repo, entryRepo, codeRepo)
  const router = new Hono()

  // ---------- GET /contracts — 分页列表 ----------
  router.get("/", async (c) => {
    const query = contractQuerySchema.parse(c.req.queries())
    const filters: QueryFilter[] = []
    const sorts: SortField[] = []

    if (query.keyword) {
      filters.push({
        column: "name",
        operator: "ilike",
        value: `%${query.keyword}%`,
      })
    }
    if (query.code) {
      filters.push({ column: "code", operator: "eq", value: query.code })
    }
    if (query.type) {
      filters.push({ column: "type", operator: "eq", value: query.type })
    }
    if (query.supplierId) {
      filters.push({
        column: "supplierId",
        operator: "eq",
        value: query.supplierId,
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

  // ---------- GET /contracts/:id — 详情 ----------
  router.get("/:id", async (c) => {
    const row = await repo.findById(c.req.param("id"))
    return c.json(successResponse(row))
  })

  // ---------- GET /contracts/:id/entries — 采购条目 ----------
  router.get("/:id/entries", async (c) => {
    const rows = await entryRepo.findByContractId(c.req.param("id"))
    return c.json(successResponse(rows))
  })

  // ---------- POST /contracts — 创建 ----------
  router.post("/", async (c) => {
    const body = createContractSchema.parse(await c.req.json())
    const code = await nextCode(codeRepo, "contracts", "CTT")
    const row = await repo.insert({
      ...body,
      code,
      status: ContractStatus.Draft,
    })
    return c.json(successResponse(row), 201)
  })

  // ---------- PUT /contracts/:id — 更新（service 层锁定检查） ----------
  router.put("/:id", async (c) => {
    const body = updateContractSchema.parse(await c.req.json())
    const row = await service.update(c.req.param("id"), body)
    return c.json(successResponse(row))
  })

  // ---------- DELETE /contracts/:id — 删除 ----------
  router.delete("/:id", async (c) => {
    const row = await repo.findById(c.req.param("id"))
    if (row === null) {
      return c.json(successResponse(null, "合同不存在"))
    }
    await repo.delete(c.req.param("id"))
    return c.json(successResponse(null))
  })

  // ---------- PATCH /contracts/:id/activate — 确认生效 ----------
  router.patch("/:id/activate", async (c) => {
    const row = await service.activate(c.req.param("id"))
    return c.json(successResponse(row))
  })

  // ---------- PATCH /contracts/:id/return-to-draft — 退回草稿 ----------
  router.patch("/:id/return-to-draft", async (c) => {
    const row = await service.returnToDraft(c.req.param("id"))
    return c.json(successResponse(row))
  })

  // ---------- PATCH /contracts/:id/void — 作废 ----------
  router.patch("/:id/void", async (c) => {
    const row = await service.voidContract(c.req.param("id"))
    return c.json(successResponse(row))
  })

  return router
}
