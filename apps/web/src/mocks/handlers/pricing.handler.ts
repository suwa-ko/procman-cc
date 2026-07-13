/**
 * 定价 MSW handler — 完整 CRUD + 定价自动失效
 */

import type { CreatePricingRequest, UpdatePricingRequest , PricingStatus } from "@ps/contracts"
import { ResponseCode } from "@ps/types-base"
import { http } from "msw"
import type { HttpHandler } from "msw"

import type { PricingStore } from "../stores/pricing.store"

import { fail, ok, parseBody, parsePagination } from "./helpers"

/** 安全解析 pricing status */
function parsePricingStatus(raw: string | null): PricingStatus | undefined {
  if (!raw) {
    return undefined
  }
  const validStatuses: string[] = ["active", "inactive"]
  return validStatuses.includes(raw) ? (raw as PricingStatus) : undefined
}

export function createPricingHandlers(store: PricingStore): HttpHandler[] {
  const base = "/api/pricings"

  return [
    /** GET /api/pricings — 分页列表 */
    http.get(base, ({ request }) => {
      const url = new URL(request.url)
      const result = store.listByQuery({
        supplierId: url.searchParams.get("supplierId") ?? undefined,
        materialId: url.searchParams.get("materialId") ?? undefined,
        categoryId: url.searchParams.get("categoryId") ?? undefined,
        status: parsePricingStatus(url.searchParams.get("status")),
        ...parsePagination(request),
      })
      return ok(result)
    }),

    /** GET /api/pricings/:id */
    http.get(`${base}/:id`, ({ params }) => {
      const id = params.id as string
      if (!id) {
        return fail(ResponseCode.NotFound, "缺少 ID")
      }
      const item = store.getById(id)
      if (!item) {
        return fail(ResponseCode.NotFound, "定价不存在")
      }
      return ok(item)
    }),

    /** POST /api/pricings — 创建（含旧定价自动失效） */
    http.post(base, async ({ request }) => {
      const body = await parseBody<CreatePricingRequest>(request)
      if (!body) {
        return fail(ResponseCode.ValidationError, "请求体不能为空")
      }
      const created = store.createWithInvalidation(body)
      return ok(created)
    }),

    /** PUT /api/pricings/:id */
    http.put(`${base}/:id`, async ({ request, params }) => {
      const id = params.id as string
      if (!id) {
        return fail(ResponseCode.NotFound, "缺少 ID")
      }
      const body = await parseBody<UpdatePricingRequest>(request)
      if (!body) {
        return fail(ResponseCode.ValidationError, "请求体不能为空")
      }
      const updated = store.update(id, body)
      if (!updated) {
        return fail(ResponseCode.NotFound, "定价不存在")
      }
      return ok(updated)
    }),

    /** DELETE /api/pricings/:id */
    http.delete(`${base}/:id`, ({ params }) => {
      const id = params.id as string
      if (!id) {
        return fail(ResponseCode.NotFound, "缺少 ID")
      }
      const deleted = store.delete(id)
      if (!deleted) {
        return fail(ResponseCode.NotFound, "定价不存在")
      }
      return ok(null)
    }),
  ]
}
