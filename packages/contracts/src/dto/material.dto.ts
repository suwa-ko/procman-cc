import type { MaterialEntity } from "@ps/model"
import type { PaginatedResponse } from "@ps/types-base"

/** 物料 DTO（含系统字段 id / code / createdAt / updatedAt） */
export type MaterialDTO = MaterialEntity & {
  id: string
  code: string
  createdAt: string
  updatedAt: string
}

export type CreateMaterialRequest = MaterialEntity
export type UpdateMaterialRequest = Partial<MaterialEntity>

/** 物料列表查询参数 */
export interface MaterialQueryParams {
  keyword?: string
  categoryId?: string
  status?: MaterialEntity["status"]
  page: number
  pageSize: number
}

/** 物料列表响应 */
export type MaterialListResponse = PaginatedResponse<MaterialDTO>
