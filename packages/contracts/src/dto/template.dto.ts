
import type { ContractType , TemplateEntity, TemplateVariableEntity } from "@ps/model"
import type { PaginatedResponse } from "@ps/types-base"

export type { ContractType }

/** 模板变量定义 */
export type TemplateVariable = TemplateVariableEntity

/** 合同模板 DTO（含系统字段 id / code / version / createdAt / updatedAt） */
export interface TemplateDTO extends TemplateEntity {
  id: string
  code: string
  version: string
  createdAt: string
  updatedAt: string
}

export type CreateTemplateRequest = TemplateEntity
export type UpdateTemplateRequest = Partial<TemplateEntity>

/** 模板列表查询参数 */
export interface TemplateQueryParams {
  keyword?: string
  contractType?: ContractType
  enabled?: boolean
  page: number
  pageSize: number
}

/** 模板列表响应 */
export type TemplateListResponse = PaginatedResponse<TemplateDTO>
