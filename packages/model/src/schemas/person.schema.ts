import { z } from "zod"

/**
 * 人员实体校验 schema
 * - 姓名必填
 * - 人员主数据来自外部系统，本系统仅存冗余字段
 * - 不包含 id（系统生成）
 */
export const personSchema = z.object({
  name: z.string().min(1, "人员姓名不可为空"),
})

/** 人员列表查询参数（通常从外部系统同步查询） */
export const personQuerySchema = z.object({
  keyword: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export type PersonEntity = z.infer<typeof personSchema>
export type PersonQuery = z.infer<typeof personQuerySchema>
