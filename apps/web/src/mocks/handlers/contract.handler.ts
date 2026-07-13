/**
 * 合同 MSW handler — 完整 CRUD + 关联条目处理
 */

import {
  ContractStatus,
  type ContractType,
  type CreateContractEntryRequest,
  type CreateContractRequest,
  type UpdateContractRequest,
  type ContractEntryDTO,
} from "@ps/contracts"
import { ResponseCode } from "@ps/types-base"
import { http } from "msw"
import type { HttpHandler } from "msw"

import type { ContractStore } from "../stores/contract.store"

import { fail, ok, parseBody, parsePagination } from "./helpers"

/** 安全解析 contract type */
function parseContractType(raw: string | null): ContractType | undefined {
  if (!raw) {
    return undefined
  }
  const validTypes: string[] = ["nda", "purchase_contract"]
  return validTypes.includes(raw) ? (raw as ContractType) : undefined
}

/** 安全解析 contract status */
function parseContractStatus(raw: string | null): ContractStatus | undefined {
  if (!raw) {
    return undefined
  }
  const validStatuses: string[] = ["draft", "effective", "archived", "void"]
  return validStatuses.includes(raw) ? (raw as ContractStatus) : undefined
}

export function createContractHandlers(store: ContractStore): HttpHandler[] {
  const base = "/api/contracts"

  return [
    /** GET /api/contracts — 分页列表 */
    http.get(base, ({ request }) => {
      const url = new URL(request.url)
      const result = store.listByQuery({
        keyword: url.searchParams.get("keyword") ?? undefined,
        code: url.searchParams.get("code") ?? undefined,
        type: parseContractType(url.searchParams.get("type")),
        supplierId: url.searchParams.get("supplierId") ?? undefined,
        status: parseContractStatus(url.searchParams.get("status")),
        startDate: url.searchParams.get("startDate") ?? undefined,
        endDate: url.searchParams.get("endDate") ?? undefined,
        ...parsePagination(request),
      })
      return ok(result)
    }),

    /** GET /api/contracts/:id */
    http.get(`${base}/:id`, ({ params }) => {
      const id = params.id as string
      if (!id) {
        return fail(ResponseCode.NotFound, "缺少 ID")
      }
      const contract = store.getById(id)
      if (!contract) {
        return fail(ResponseCode.NotFound, "合同不存在")
      }
      return ok({ contract, entries: store.getEntries(id) })
    }),

    /** POST /api/contracts — 创建（含条目） */
    http.post(base, async ({ request }) => {
      const body = await parseBody<{
        contract: CreateContractRequest
        entries: CreateContractEntryRequest[]
      }>(request)
      if (!body?.contract) {
        return fail(ResponseCode.ValidationError, "合同信息不能为空")
      }
      const created = store.create({
        ...body.contract,
        status: ContractStatus.Draft,
        content: body.contract.content ?? {},
      })
      if (body.entries && body.entries.length > 0) {
        const entryList: ContractEntryDTO[] = body.entries.map((e, i) => {
          const entry: ContractEntryDTO = {
            id: crypto.randomUUID(),
            contractId: created.id,
            sortOrder: i + 1,
            materialId: e.materialId,
            materialName: e.materialName,
            spec: e.spec ?? undefined,
            unitPrice: e.unitPrice,
            quantity: e.quantity,
            unit: e.unit,
            totalPrice: e.totalPrice,
            remark: e.remark ?? undefined,
          }
          return entry
        })
        store.setEntries(created.id, entryList)
      }
      return ok({ contract: created, entries: store.getEntries(created.id) })
    }),

    /** PUT /api/contracts/:id — 仅 Draft 可修改 */
    http.put(`${base}/:id`, async ({ request, params }) => {
      const id = params.id as string
      if (!id) {
        return fail(ResponseCode.NotFound, "缺少 ID")
      }
      const existing = store.getById(id)
      if (!existing) {
        return fail(ResponseCode.NotFound, "合同不存在")
      }
      if (existing.status !== ContractStatus.Draft) {
        return fail(ResponseCode.Conflict, "只有草稿状态的合同可以修改")
      }
      const body = await parseBody<UpdateContractRequest>(request)
      if (!body) {
        return fail(ResponseCode.ValidationError, "请求体不能为空")
      }
      const updated = store.update(id, body)
      if (!updated) {
        return fail(ResponseCode.NotFound, "合同不存在")
      }
      return ok(updated)
    }),

    /** DELETE /api/contracts/:id — 仅 Draft 可删除 */
    http.delete(`${base}/:id`, ({ params }) => {
      const id = params.id as string
      if (!id) {
        return fail(ResponseCode.NotFound, "缺少 ID")
      }
      const existing = store.getById(id)
      if (!existing) {
        return fail(ResponseCode.NotFound, "合同不存在")
      }
      if (existing.status !== ContractStatus.Draft) {
        return fail(ResponseCode.Conflict, "只有草稿状态的合同可以删除")
      }
      store.delete(id)
      return ok(null)
    }),
  ]
}
