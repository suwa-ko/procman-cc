import type { CategoryEntity } from "@ps/model"
import type { PaginatedResponse } from "@ps/types-base"

/** 物料分类树节点 */
export interface CategoryTreeNode {
  id: string
  code: string
  name: string
  parentId: string | null
  sortOrder: number
  children: CategoryTreeNode[]
}

/** 品类 DTO（含系统字段 id / code） */
export type CategoryDTO = CategoryEntity & {
  id: string
  code: string
}

export type CreateCategoryRequest = CategoryEntity
export type UpdateCategoryRequest = Partial<CategoryEntity>

/** 品类列表查询参数 */
export interface CategoryQueryParams {
  keyword?: string
  parentId?: string
  page: number
  pageSize: number
}

/** 品类列表响应 */
export type CategoryListResponse = PaginatedResponse<CategoryDTO>
