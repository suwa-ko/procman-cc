import type { ContractType } from "../enums/contract-type"

/** 模板变量定义 */
export interface TemplateVariable {
  type: "text" | "number" | "date" | "boolean"
  label: string
}

/** 合同模板 DTO */
export interface TemplateDTO {
  id: string
  code: string
  name: string
  contractType: ContractType
  htmlContent: string
  variables: Record<string, TemplateVariable>
  version: string
  enabled: boolean
  createdAt: string
  updatedAt: string
}

/** 创建模板请求 */
export interface CreateTemplateRequest {
  name: string
  contractType: ContractType
  htmlContent: string
  variables: Record<string, TemplateVariable>
}

/** 更新模板请求 */
export interface UpdateTemplateRequest {
  name?: string
  htmlContent?: string
  variables?: Record<string, TemplateVariable>
  enabled?: boolean
}
