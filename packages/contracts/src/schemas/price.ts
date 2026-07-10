import { z } from "zod"

import { PricingStatus } from "../enums/pricing-status"

/**
 * 定价创建/编辑校验 schema（对应 PRD 附录 B V-10）
 * - 供应商 + 物料必填
 * - 单价 > 0，精度不超过两位小数
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

export const createPricingSchema = pricingSchema

export const updatePricingSchema = pricingSchema
  .omit({ status: true })
  .partial()

export type PricingDTO = z.infer<typeof pricingSchema> & {
  id: string
  code: string
  createdAt: string
  updatedAt: string
}

export type CreatePricingRequest = z.infer<typeof createPricingSchema>

export type UpdatePricingRequest = z.infer<typeof updatePricingSchema>
