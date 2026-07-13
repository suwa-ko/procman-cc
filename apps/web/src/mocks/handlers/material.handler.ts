/**
 * 物料 MSW handler — 委托通用 CRUD 工厂
 */

import type {
  CreateMaterialRequest,
  MaterialDTO,
  MaterialStatus,
  UpdateMaterialRequest,
} from "@ps/contracts"
import type { HttpHandler } from "msw"

import type { MaterialStore } from "../stores/material.store"

import { createCrudHandlers } from "./crud-factory"

/** 安全解析 URL 中的 material status 值 */
function parseMaterialStatus(raw: string | null): MaterialStatus | undefined {
  if (!raw) {
    return undefined
  }
  const validStatuses: string[] = ["active", "inactive"]
  return validStatuses.includes(raw) ? (raw as MaterialStatus) : undefined
}

export function createMaterialHandlers(store: MaterialStore): HttpHandler[] {
  return createCrudHandlers<
    MaterialDTO,
    CreateMaterialRequest,
    UpdateMaterialRequest,
    {
      keyword?: string
      categoryId?: string
      status?: MaterialStatus
      page: number
      pageSize: number
    }
  >({
    baseUrl: "/api/materials",
    entityName: "物料",
    store: {
      getById: (id) => store.getById(id),
      create: (data) => store.create(data),
      update: (id, patch) => store.update(id, patch),
      delete: (id) => store.delete(id),
      listByQuery: (params) => store.listByQuery(params),
    },
    parseQuery: (url, page, pageSize) => ({
      keyword: url.searchParams.get("keyword") ?? undefined,
      categoryId: url.searchParams.get("categoryId") ?? undefined,
      status: parseMaterialStatus(url.searchParams.get("status")),
      page,
      pageSize,
    }),
  })
}
