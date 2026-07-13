import type { PersonEntity } from "@ps/model"
import type { PaginatedResponse } from "@ps/types-base"

/** 人员信息 DTO（仅冗余字段，主数据来自外部系统） */
export type PersonDTO = PersonEntity & {
  id: string
}

/** 人员列表查询参数 */
export interface PersonQueryParams {
  keyword?: string
  page: number
  pageSize: number
}

/** 人员列表响应 */
export type PersonListResponse = PaginatedResponse<PersonDTO>
