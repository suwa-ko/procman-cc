/**
 * 合同模板 MSW handler — 完整 CRUD
 */

import type {
  CreateTemplateRequest,
  UpdateTemplateRequest,
} from "@ps/contracts"
import { ResponseCode } from "@ps/types-base"
import { http } from "msw"
import type { HttpHandler } from "msw"

import type { TemplateStore } from "../stores/template.store"

import { fail, ok, parseBody } from "./helpers"

export function createTemplateHandlers(store: TemplateStore): HttpHandler[] {
  const base = "/api/templates"

  return [
    /** GET /api/templates — 全量列表 */
    http.get(base, () => {
      return ok(store.getAll())
    }),

    /** GET /api/templates/:id */
    http.get(`${base}/:id`, ({ params }) => {
      const id = params.id as string
      if (!id) {
        return fail(ResponseCode.NotFound, "缺少 ID")
      }
      const item = store.getById(id)
      if (!item) {
        return fail(ResponseCode.NotFound, "模板不存在")
      }
      return ok(item)
    }),

    /** POST /api/templates */
    http.post(base, async ({ request }) => {
      const body = await parseBody<CreateTemplateRequest>(request)
      if (!body) {
        return fail(ResponseCode.ValidationError, "请求体不能为空")
      }
      const created = store.create(body)
      return ok(created)
    }),

    /** PUT /api/templates/:id */
    http.put(`${base}/:id`, async ({ request, params }) => {
      const id = params.id as string
      if (!id) {
        return fail(ResponseCode.NotFound, "缺少 ID")
      }
      const body = await parseBody<UpdateTemplateRequest>(request)
      if (!body) {
        return fail(ResponseCode.ValidationError, "请求体不能为空")
      }
      const updated = store.update(id, body)
      if (!updated) {
        return fail(ResponseCode.NotFound, "模板不存在")
      }
      return ok(updated)
    }),

    /** DELETE /api/templates/:id */
    http.delete(`${base}/:id`, ({ params }) => {
      const id = params.id as string
      if (!id) {
        return fail(ResponseCode.NotFound, "缺少 ID")
      }
      const deleted = store.delete(id)
      if (!deleted) {
        return fail(ResponseCode.NotFound, "模板不存在")
      }
      return ok(null)
    }),
  ]
}
