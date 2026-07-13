import { z } from "zod"

/**
 * 品类实体校验 schema
 * - 名称必填
 * - 不包含 id / code / createdAt / updatedAt（系统生成）
 */
export const categorySchema = z.object({
  name: z.string().min(1, "品类名称不可为空"),
  parentId: z.string().nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
})

/** 品类创建校验 */
export const createCategorySchema = categorySchema

/** 品类更新校验（所有字段可选） */
export const updateCategorySchema = categorySchema.partial()

/** 品类列表查询参数 */
export const categoryQuerySchema = z.object({
  keyword: z.string().optional(),
  parentId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export type CategoryEntity = z.infer<typeof categorySchema>
export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type CategoryQuery = z.infer<typeof categoryQuerySchema>
