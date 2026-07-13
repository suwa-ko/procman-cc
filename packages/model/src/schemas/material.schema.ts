import { z } from "zod"

import { MaterialStatus } from "../enums/material-status"

/**
 * 物料实体校验 schema
 * - 名称/单位/品类必填
 * - 不包含 id / code / createdAt / updatedAt（系统生成）
 */
export const materialSchema = z.object({
  name: z.string().min(1, "物料名称不可为空"),
  spec: z.string().optional(),
  unit: z.string().min(1, "计量单位不可为空"),
  categoryId: z.string().min(1, "所属品类必填"),
  description: z.string().optional(),
  status: z.nativeEnum(MaterialStatus),
})

/** 物料创建校验 */
export const createMaterialSchema = materialSchema

/** 物料更新校验（所有字段可选） */
export const updateMaterialSchema = materialSchema.partial()

/** 物料列表查询参数 */
export const materialQuerySchema = z.object({
  keyword: z.string().optional(),
  categoryId: z.string().optional(),
  status: z.nativeEnum(MaterialStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export type MaterialEntity = z.infer<typeof materialSchema>
export type CreateMaterialInput = z.infer<typeof createMaterialSchema>
export type UpdateMaterialInput = z.infer<typeof updateMaterialSchema>
export type MaterialQuery = z.infer<typeof materialQuerySchema>
