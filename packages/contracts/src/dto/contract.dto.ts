import type { ContractStatus } from "../enums/contract-status"
import type { ContractType } from "../enums/contract-type"
import type { ContractDTO } from "../schemas/contract"

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
export interface ContractListResponse {
  data: ContractDTO[]
  total: number
  page: number
  pageSize: number
}
