/**
 * 合同 MSW handler — 完整 CRUD + 关联条目处理
 */

import {
  ContractStatus,
  type ContractDTO,
  type ContractType,
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

    /** POST /api/contracts — 创建（支持 flat body 和嵌套 body 两种格式） */
    http.post(base, async ({ request }) => {
      const raw = await parseBody<Record<string, unknown>>(request)
      if (!raw) {
        return fail(ResponseCode.ValidationError, "合同信息不能为空")
      }
      // 兼容两种 body 格式：嵌套 { contract, entries } 和 flat 直接传
      let contractBody: Record<string, unknown>
      let entries: Record<string, unknown>[]
      if (raw.contract && typeof raw.contract === "object") {
        // 嵌套格式：{ contract: {...}, entries: [...] }
        contractBody = raw.contract as Record<string, unknown>
        entries = (raw.entries as Record<string, unknown>[]) ?? []
      } else {
        // 平面格式：直接传 { name, type, supplierId, ... }
        contractBody = raw
        entries = []
      }
      const patchCreate: Omit<
        ContractDTO,
        "id" | "code" | "version" | "createdAt" | "updatedAt"
      > = {
        ...contractBody,
        status: ContractStatus.Draft,
        content: (contractBody.content as Record<string, unknown>) ?? {},
      } as unknown as Omit<
        ContractDTO,
        "id" | "code" | "version" | "createdAt" | "updatedAt"
      >
      const created = store.create(patchCreate)
      if (entries.length > 0) {
        const entryList: ContractEntryDTO[] = entries.map((e, i) => {
          const entry: ContractEntryDTO = {
            id: crypto.randomUUID(),
            contractId: created.id,
            sortOrder: i + 1,
            materialId: (e.materialId as string) ?? "",
            materialName: (e.materialName as string) ?? "",
            spec: (e.spec as string) ?? undefined,
            unitPrice: (e.unitPrice as number) ?? 0,
            quantity: (e.quantity as number) ?? 0,
            unit: (e.unit as string) ?? "",
            totalPrice: (e.totalPrice as number) ?? 0,
            remark: (e.remark as string) ?? undefined,
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

    /** GET /api/contracts/:id/pdf — 导出合同 PDF（mock 返回简单文本） */
    http.get(`${base}/:id/pdf`, ({ params }) => {
      const id = params.id as string
      if (!id) {
        return fail(ResponseCode.NotFound, "缺少 ID")
      }
      const contract = store.getById(id)
      if (!contract) {
        return fail(ResponseCode.NotFound, "合同不存在")
      }
      const entries = store.getEntries(id)
      const lines = [
        "合同编号: " + contract.code,
        "合同名称: " + contract.name,
        "",
      ]
        .concat(
          entries.map(
            (e, i) =>
              (i + 1).toString() +
              ". " +
              e.materialName +
              " | " +
              (e.spec ?? "-") +
              " | " +
              e.unitPrice.toString() +
              "元 × " +
              e.quantity.toString() +
              e.unit +
              " = " +
              e.totalPrice.toString() +
              "元"
          )
        )
        .concat(["", "合计: " + (contract.totalAmount ?? 0).toString() + "元"])
      const text = lines.join("\n")
      return new Response(text, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition":
            'attachment; filename="contract-' + contract.code + '.pdf"',
        },
      })
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

    /** GET /api/contracts/:id/entries — 合同条目列表 */
    http.get(`${base}/:id/entries`, ({ params }) => {
      const id = params.id as string
      if (!id) {
        return fail(ResponseCode.NotFound, "缺少 ID")
      }
      const contract = store.getById(id)
      if (!contract) {
        return fail(ResponseCode.NotFound, "合同不存在")
      }
      const entries = store.getEntries(id)
      return ok(entries)
    }),

    /** PATCH /api/contracts/:id/activate — 合同生效 */
    http.patch(`${base}/:id/activate`, ({ params }) => {
      const id = params.id as string
      if (!id) {
        return fail(ResponseCode.NotFound, "缺少 ID")
      }
      const existing = store.getById(id)
      if (!existing) {
        return fail(ResponseCode.NotFound, "合同不存在")
      }
      if (existing.status !== ContractStatus.Draft) {
        return fail(ResponseCode.Conflict, "只有草稿状态的合同可以生效")
      }
      const patch: Partial<ContractDTO> = {
        status: ContractStatus.Effective,
      }
      const updated = store.update(id, patch)
      if (!updated) {
        return fail(ResponseCode.NotFound, "合同不存在")
      }
      return ok(updated)
    }),

    /** PATCH /api/contracts/:id/return-to-draft — 退回草稿 */
    http.patch(`${base}/:id/return-to-draft`, ({ params }) => {
      const id = params.id as string
      if (!id) {
        return fail(ResponseCode.NotFound, "缺少 ID")
      }
      const existing = store.getById(id)
      if (!existing) {
        return fail(ResponseCode.NotFound, "合同不存在")
      }
      if (
        existing.status !== ContractStatus.Effective &&
        existing.status !== ContractStatus.Void
      ) {
        return fail(
          ResponseCode.Conflict,
          "只有生效或作废状态的合同可以退回草稿"
        )
      }
      const patchDraft: Partial<ContractDTO> = {
        status: ContractStatus.Draft,
      }
      const updated = store.update(id, patchDraft)
      if (!updated) {
        return fail(ResponseCode.NotFound, "合同不存在")
      }
      return ok(updated)
    }),

    /** PATCH /api/contracts/:id/void — 合同作废 */
    http.patch(`${base}/:id/void`, ({ params }) => {
      const id = params.id as string
      if (!id) {
        return fail(ResponseCode.NotFound, "缺少 ID")
      }
      const existing = store.getById(id)
      if (!existing) {
        return fail(ResponseCode.NotFound, "合同不存在")
      }
      if (existing.status === ContractStatus.Void) {
        return fail(ResponseCode.Conflict, "合同已作废")
      }
      const patchVoid: Partial<ContractDTO> = {
        status: ContractStatus.Void,
      }
      const updated = store.update(id, patchVoid)
      if (!updated) {
        return fail(ResponseCode.NotFound, "合同不存在")
      }
      return ok(updated)
    }),
  ]
}
