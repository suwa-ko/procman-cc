import { z } from "zod"

import { ContractType } from "../enums/contract-type"

/**
 * 模板变量定义 schema
 */
export const templateVariableSchema = z.object({
  type: z.enum(["text", "number", "date", "boolean"]),
  label: z.string().min(1, "变量标签不可为空"),
})

/**
 * 合同模板实体校验 schema
 * - 名称/类型/HTML内容必填
 * - 不包含 id / code / version / createdAt / updatedAt（系统生成）
 */
export const templateSchema = z.object({
  name: z.string().min(1, "模板名称不可为空"),
  contractType: z.nativeEnum(ContractType),
  htmlContent: z.string().min(1, "模板内容不可为空"),
  variables: z.record(z.string(), templateVariableSchema),
  enabled: z.boolean().default(true),
})

/** 模板创建校验 */
export const createTemplateSchema = templateSchema

/** 模板更新校验（所有字段可选） */
export const updateTemplateSchema = templateSchema.partial()

/** 模板列表查询参数 */
export const templateQuerySchema = z.object({
  keyword: z.string().optional(),
  contractType: z.nativeEnum(ContractType).optional(),
  enabled: z.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export type TemplateEntity = z.infer<typeof templateSchema>
export type TemplateVariableEntity = z.infer<typeof templateVariableSchema>
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>
export type TemplateQuery = z.infer<typeof templateQuerySchema>
