
import type { ContractType , ContractStatus , ContractEntity, ContractEntryEntity } from "@ps/model"
import type { PaginatedResponse } from "@ps/types-base"

/** 合同 DTO（含系统字段 id / code / createdAt / updatedAt） */
export type ContractDTO = ContractEntity & {
  id: string
  code: string
  createdAt: string
  updatedAt: string
}

/** 合同条目 DTO（含系统字段 id / contractId / sortOrder） */
export type ContractEntryDTO = ContractEntryEntity & {
  id: string
  contractId: string
  sortOrder: number
}

export type CreateContractRequest = Omit<ContractEntity, "status">
export type UpdateContractRequest = Partial<ContractEntity>
export type CreateContractEntryRequest = ContractEntryEntity
export type UpdateContractEntryRequest = Partial<ContractEntryEntity>

/** 合同列表查询参数 */
export interface ContractQueryParams {
  keyword?: string
  code?: string
  type?: ContractType
  supplierId?: string
  status?: ContractStatus
  startDate?: string
  endDate?: string
  page: number
  pageSize: number
}

/** 合同列表响应 */
export type ContractListResponse = PaginatedResponse<ContractDTO>
