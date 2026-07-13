/**
 * 品类 MSW handler — CRUD + 树查询
 */

import type {
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@ps/contracts"
import { ResponseCode } from "@ps/types-base"
import { http } from "msw"
import type { HttpHandler } from "msw"

import type { CategoryStore } from "../stores/category.store"

import { fail, ok, parseBody } from "./helpers"

export function createCategoryHandlers(store: CategoryStore): HttpHandler[] {
  const base = "/api/categories"

  return [
    /** GET /api/categories/tree — 品类树 */
    http.get(`${base}/tree`, () => {
      return ok(store.getTree())
    }),

    /** GET /api/categories — 全量列表 */
    http.get(base, () => {
      return ok(store.getAll())
    }),

    /** GET /api/categories/:id */
    http.get(`${base}/:id`, ({ params }) => {
      const id = params.id as string
      if (!id) {
        return fail(ResponseCode.NotFound, "缺少 ID")
      }
      const item = store.getById(id)
      if (!item) {
        return fail(ResponseCode.NotFound, "品类不存在")
      }
      return ok(item)
    }),

    /** POST /api/categories */
    http.post(base, async ({ request }) => {
      const body = await parseBody<CreateCategoryRequest>(request)
      if (!body) {
        return fail(ResponseCode.ValidationError, "请求体不能为空")
      }
      const created = store.create(body)
      return ok(created)
    }),

    /** PUT /api/categories/:id */
    http.put(`${base}/:id`, async ({ request, params }) => {
      const id = params.id as string
      if (!id) {
        return fail(ResponseCode.NotFound, "缺少 ID")
      }
      const body = await parseBody<UpdateCategoryRequest>(request)
      if (!body) {
        return fail(ResponseCode.ValidationError, "请求体不能为空")
      }
      const updated = store.update(id, body)
      if (!updated) {
        return fail(ResponseCode.NotFound, "品类不存在")
      }
      return ok(updated)
    }),

    /** DELETE /api/categories/:id */
    http.delete(`${base}/:id`, ({ params }) => {
      const id = params.id as string
      if (!id) {
        return fail(ResponseCode.NotFound, "缺少 ID")
      }
      const deleted = store.delete(id)
      if (!deleted) {
        return fail(ResponseCode.NotFound, "品类不存在")
      }
      return ok(null)
    }),
  ]
}
