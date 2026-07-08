/**
 * 分页请求参数
 */
export interface PaginationParams {
  /** 页码，从 1 开始 */
  page: number
  /** 每页条数 */
  pageSize: number
}

/**
 * 分页响应结构
 */
export interface PaginatedResponse<T> {
  /** 当前页数据 */
  data: T[]
  /** 总条数 */
  total: number
  /** 当前页码 */
  page: number
  /** 每页条数 */
  pageSize: number
}

/**
 * 默认分页参数
 */
export const DEFAULT_PAGE = 1
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100
