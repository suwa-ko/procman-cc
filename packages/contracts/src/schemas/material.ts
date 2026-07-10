import { z } from "zod"

import { MaterialStatus } from "../enums/material-status"

/**
 * 物料创建/编辑校验 schema（对应 PRD 附录 B V-06）
 * - 名称必填
 * - 单位必填
 * - 所属品类必填
 */
export const materialSchema = z.object({
  name: z.string().min(1, "物料名称不可为空"),
  spec: z.string().optional(),
  unit: z.string().min(1, "计量单位不可为空"),
  categoryId: z.string().min(1, "所属品类必填"),
  description: z.string().optional(),
  status: z.nativeEnum(MaterialStatus),
})

export const createMaterialSchema = materialSchema

export const updateMaterialSchema = materialSchema.partial()

export type MaterialDTO = z.infer<typeof materialSchema> & {
  id: string
  code: string
  createdAt: string
  updatedAt: string
}

export type CreateMaterialRequest = z.infer<typeof createMaterialSchema>

export type UpdateMaterialRequest = z.infer<typeof updateMaterialSchema>
