import type { PricingStatus } from "../enums/pricing-status"
import type { PricingDTO } from "../schemas/price"

/** 定价列表查询参数 */
export interface PricingQueryParams {
  supplierId?: string
  materialId?: string
  categoryId?: string
  status?: PricingStatus
  page: number
  pageSize: number
}

/** 定价列表响应 */
export interface PricingListResponse {
  data: PricingDTO[]
  total: number
  page: number
  pageSize: number
}
