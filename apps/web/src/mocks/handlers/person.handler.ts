/**
 * 人员 MSW handler — 只读列表/详情（主数据来自外部系统）
 */

import { ResponseCode } from "@ps/types-base"
import { http } from "msw"
import type { HttpHandler } from "msw"

import type { PersonStore } from "../stores/person.store"

import { fail, ok } from "./helpers"

export function createPersonHandlers(store: PersonStore): HttpHandler[] {
  const base = "/api/persons"

  return [
    http.get(base, () => {
      return ok(store.getAll())
    }),

    http.get(`${base}/:id`, ({ params }) => {
      const id = params.id as string
      if (!id) {
        return fail(ResponseCode.NotFound, "缺少 ID")
      }
      const item = store.getById(id)
      if (!item) {
        return fail(ResponseCode.NotFound, "人员不存在")
      }
      return ok(item)
    }),
  ]
}
