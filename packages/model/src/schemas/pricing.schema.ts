import { z } from "zod"

import { PricingStatus } from "../enums/pricing-status"

/**
 * 定价实体校验 schema
 * - 供应商 + 物料必填
 * - 单价 > 0，精度不超过两位小数
 * - 不包含 id / code / createdAt / updatedAt（系统生成）
 */
export const pricingSchema = z.object({
  supplierId: z.string().min(1, "供应商必填"),
  materialId: z.string().min(1, "物料必填"),
  unitPrice: z
    .number()
    .positive("单价必须大于 0")
    .refine((v) => Number(v.toFixed(2)) === v, {
      message: "单价精度最多两位小数",
    }),
  currency: z.enum(["CNY"]).default("CNY"),
  status: z.nativeEnum(PricingStatus).default(PricingStatus.Active),
  remark: z.string().optional(),
})

/** 定价创建校验 */
export const createPricingSchema = pricingSchema

/** 定价更新校验（不允许修改状态，由业务层自动管理） */
export const updatePricingSchema = pricingSchema
  .omit({ status: true })
  .partial()

/** 定价列表查询参数 */
export const pricingQuerySchema = z.object({
  supplierId: z.string().optional(),
  materialId: z.string().optional(),
  categoryId: z.string().optional(),
  status: z.nativeEnum(PricingStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export type PricingEntity = z.infer<typeof pricingSchema>
export type CreatePricingInput = z.infer<typeof createPricingSchema>
export type UpdatePricingInput = z.infer<typeof updatePricingSchema>
export type PricingQuery = z.infer<typeof pricingQuerySchema>
