/**
 * 物料 Mock 存储，含品类/状态/关键词筛选
 */

import type { MaterialDTO, MaterialQueryParams, MaterialStatus } from "@ps/contracts"
import type { PaginatedResponse } from "@ps/types-base"

import { BaseMockStore } from "./base.store"

/** 物料列表筛选字段 */
interface MaterialFilters {
  keyword?: string
  categoryId?: string
  status?: MaterialStatus
}

export class MaterialStore extends BaseMockStore<MaterialDTO, MaterialFilters> {
  constructor(idGen: () => string) {
    super("material", idGen)
    this.setFilter((item, f) => {
      if (f.status && item.status !== f.status) {
        return false
      }
      if (f.categoryId && item.categoryId !== f.categoryId) {
        return false
      }
      if (f.keyword) {
        const kw = f.keyword.toLowerCase()
        const matchName = item.name.toLowerCase().includes(kw)
        const matchCode = item.code.toLowerCase().includes(kw)
        if (!matchName && !matchCode) {
          return false
        }
      }
      return true
    })
  }

  /** 物料列表查询（分页） */
  listByQuery(params: MaterialQueryParams): PaginatedResponse<MaterialDTO> {
    return this.list({
      page: params.page,
      pageSize: params.pageSize,
      filters: {
        keyword: params.keyword,
        categoryId: params.categoryId,
        status: params.status,
      },
    })
  }
}
