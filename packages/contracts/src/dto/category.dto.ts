import type { MaterialStatus } from "../enums/material-status"

/** 物料分类树节点 */
export interface CategoryTreeNode {
  id: string
  code: string
  name: string
  parentId: string | null
  sortOrder: number
  children: CategoryTreeNode[]
}

/** 品类 DTO */
export interface CategoryDTO {
  id: string
  code: string
  name: string
  parentId: string | null
  sortOrder: number
}

/** 创建品类请求 */
export interface CreateCategoryRequest {
  name: string
  parentId?: string | null
  sortOrder?: number
}

/** 更新品类请求 */
export interface UpdateCategoryRequest {
  name?: string
  parentId?: string | null
  sortOrder?: number
}

/** 物料列表查询参数 */
export interface MaterialQueryParams {
  keyword?: string
  categoryId?: string
  status?: MaterialStatus
  page: number
  pageSize: number
}
