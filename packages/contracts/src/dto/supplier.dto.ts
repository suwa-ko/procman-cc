import type { SupplierEntity } from "@ps/model"
import type { PaginatedResponse } from "@ps/types-base"


/** 供应商 DTO（含系统字段 id / code / createdAt / updatedAt） */
export type SupplierDTO = SupplierEntity & {
  id: string
  code: string
  createdAt: string
  updatedAt: string
}

export type CreateSupplierRequest = SupplierEntity
export type UpdateSupplierRequest = Partial<SupplierEntity>

/** 供应商列表查询参数 */
export interface SupplierQueryParams {
  keyword?: string
  status?: SupplierEntity["status"]
  page: number
  pageSize: number
}

/** 供应商列表响应 */
export type SupplierListResponse = PaginatedResponse<SupplierDTO>
