/**
 * 供应商 Mock 存储，含状态/关键词筛选
 */

import type { SupplierDTO, SupplierQueryParams, SupplierStatus } from "@ps/contracts"
import type { PaginatedResponse } from "@ps/types-base"

import { BaseMockStore } from "./base.store"

/** 供应商列表筛选字段 */
interface SupplierFilters {
  keyword?: string
  status?: SupplierStatus
}

export class SupplierStore extends BaseMockStore<SupplierDTO, SupplierFilters> {
  constructor(idGen: () => string) {
    super("supplier", idGen)
    this.setFilter((item, f) => {
      if (f.status && item.status !== f.status) {
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

  /** 供应商列表查询（分页） */
  listByQuery(params: SupplierQueryParams): PaginatedResponse<SupplierDTO> {
    return this.list({
      page: params.page,
      pageSize: params.pageSize,
      filters: { keyword: params.keyword, status: params.status },
    })
  }
}
