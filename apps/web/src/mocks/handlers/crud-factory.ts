/**
 * 通用 CRUD handler 工厂。
 * 消除 handler 文件中反复出现的 GET/POST/PUT/DELETE 重复模式。
 *
 * 适用于标准 CRUD 实体（supplier / material / category / template），
 * 不适用于含特殊业务规则的实体（contract / pricing）——后者仍需定制。
 */

import { ResponseCode } from "@ps/types-base"
import { http } from "msw"
import type { HttpHandler } from "msw"

import { fail, ok, parseBody, parsePagination } from "./helpers"

/**
 * CRUD handler 工厂配置
 */
interface CrudHandlerConfig<
  TEntity extends { id: string },
  TCreate,
  TUpdate,
  TQuery extends { page: number; pageSize: number },
> {
  /** 基础 URL（如 "/api/suppliers"） */
  baseUrl: string

  /** 实体中文名（用于错误消息，如 "供应商"） */
  entityName: string

  /** 对应的 store 实例 */
  store: {
    getById: (id: string) => TEntity | undefined
    create: (data: TCreate) => TEntity
    update: (id: string, patch: TUpdate) => TEntity | undefined
    delete: (id: string) => boolean
    listByQuery: (params: TQuery) => {
      data: TEntity[]
      total: number
      page: number
      pageSize: number
    }
  }

  /** 将 URL search params 转换为查询对象 */
  parseQuery: (url: URL, page: number, pageSize: number) => TQuery
}

/**
 * 创建标准 CRUD MSW handler。
 * 自动生成 GET list / GET :id / POST / PUT :id / DELETE :id。
 */
export function createCrudHandlers<
  TEntity extends { id: string },
  TCreate,
  TUpdate,
  TQuery extends { page: number; pageSize: number },
>(config: CrudHandlerConfig<TEntity, TCreate, TUpdate, TQuery>): HttpHandler[] {
  const { baseUrl, entityName, store, parseQuery } = config

  return [
    // GET /api/xxx — 分页列表
    http.get(baseUrl, ({ request }) => {
      const url = new URL(request.url)
      const { page, pageSize } = parsePagination(request)
      const query = parseQuery(url, page, pageSize)
      return ok(store.listByQuery(query))
    }),

    // GET /api/xxx/:id — 单条查询
    http.get(`${baseUrl}/:id`, ({ params }) => {
      const id = params.id as string
      if (!id) {
        return fail(ResponseCode.NotFound, "缺少 ID")
      }
      const item = store.getById(id)
      if (!item) {
        return fail(ResponseCode.NotFound, `${entityName}不存在`)
      }
      return ok(item)
    }),

    // POST /api/xxx — 创建
    http.post(baseUrl, async ({ request }) => {
      const body = await parseBody<TCreate>(request)
      if (!body) {
        return fail(ResponseCode.ValidationError, "请求体不能为空")
      }
      const created = store.create(body)
      return ok(created)
    }),

    // PUT /api/xxx/:id — 更新
    http.put(`${baseUrl}/:id`, async ({ request, params }) => {
      const id = params.id as string
      if (!id) {
        return fail(ResponseCode.NotFound, "缺少 ID")
      }
      const body = await parseBody<TUpdate>(request)
      if (!body) {
        return fail(ResponseCode.ValidationError, "请求体不能为空")
      }
      const updated = store.update(id, body)
      if (!updated) {
        return fail(ResponseCode.NotFound, `${entityName}不存在`)
      }
      return ok(updated)
    }),

    // DELETE /api/xxx/:id — 删除
    http.delete(`${baseUrl}/:id`, ({ params }) => {
      const id = params.id as string
      if (!id) {
        return fail(ResponseCode.NotFound, "缺少 ID")
      }
      const deleted = store.delete(id)
      if (!deleted) {
        return fail(ResponseCode.NotFound, `${entityName}不存在`)
      }
      return ok(null)
    }),
  ]
}
