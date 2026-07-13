import type { PricingEntity } from "@ps/model"
import type { PaginatedResponse } from "@ps/types-base"


/** 定价 DTO（含系统字段 id / code / createdAt / updatedAt） */
export type PricingDTO = PricingEntity & {
  id: string
  code: string
  createdAt: string
  updatedAt: string
}

export type CreatePricingRequest = PricingEntity
export type UpdatePricingRequest = Partial<Omit<PricingEntity, "status">>

/** 定价列表查询参数 */
export interface PricingQueryParams {
  supplierId?: string
  materialId?: string
  categoryId?: string
  status?: PricingEntity["status"]
  page: number
  pageSize: number
}

/** 定价列表响应 */
export type PricingListResponse = PaginatedResponse<PricingDTO>
