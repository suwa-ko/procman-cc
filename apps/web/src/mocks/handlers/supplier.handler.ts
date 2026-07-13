/**
 * 供应商 MSW handler — 委托通用 CRUD 工厂
 */

import type {
  CreateSupplierRequest,
  SupplierDTO,
  SupplierStatus,
  UpdateSupplierRequest,
} from "@ps/contracts"
import type { HttpHandler } from "msw"

import type { SupplierStore } from "../stores/supplier.store"

import { createCrudHandlers } from "./crud-factory"

/** 安全解析 URL 中的 supplier status 值 */
function parseSupplierStatus(raw: string | null): SupplierStatus | undefined {
  if (!raw) {
    return undefined
  }
  const validStatuses: string[] = ["active", "frozen", "obsolete"]
  return validStatuses.includes(raw) ? (raw as SupplierStatus) : undefined
}

export function createSupplierHandlers(store: SupplierStore): HttpHandler[] {
  return createCrudHandlers<
    SupplierDTO,
    CreateSupplierRequest,
    UpdateSupplierRequest,
    {
      keyword?: string
      status?: SupplierStatus
      page: number
      pageSize: number
    }
  >({
    baseUrl: "/api/suppliers",
    entityName: "供应商",
    store: {
      getById: (id) => store.getById(id),
      create: (data) => store.create(data),
      update: (id, patch) => store.update(id, patch),
      delete: (id) => store.delete(id),
      listByQuery: (params) => store.listByQuery(params),
    },
    parseQuery: (url, page, pageSize) => ({
      keyword: url.searchParams.get("keyword") ?? undefined,
      status: parseSupplierStatus(url.searchParams.get("status")),
      page,
      pageSize,
    }),
  })
}
