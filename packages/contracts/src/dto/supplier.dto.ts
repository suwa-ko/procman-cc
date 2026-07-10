import type { PaginationParams } from "@ps/types-base"

import type { SupplierStatus } from "../enums/supplier-status"
import type { SupplierDTO } from "../schemas/supplier"

/** 供应商列表查询参数 */
export interface SupplierQueryParams extends PaginationParams {
  keyword?: string
  status?: SupplierStatus
}

/** 供应商列表响应 */
export interface SupplierListResponse {
  data: SupplierDTO[]
  total: number
  page: number
  pageSize: number
}
