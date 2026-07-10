import { z } from "zod"

import { SupplierStatus } from "../enums/supplier-status"

/**
 * 供应商创建/编辑校验 schema（对应 PRD 附录 B V-01, V-02）
 * - 名称必填
 * - 统一社会信用代码 18 位
 */
export const supplierSchema = z.object({
  name: z.string().min(1, "供应商名称不可为空"),
  creditCode: z.string().length(18, "统一社会信用代码为 18 位"),
  contactPerson: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email("邮箱格式不正确").optional().or(z.literal("")),
  address: z.string().optional(),
  businessScope: z.string().optional(),
  status: z.nativeEnum(SupplierStatus),
  remark: z.string().optional(),
})

/** 供应商创建校验（不含 id/createdAt/updatedAt） */
export const createSupplierSchema = supplierSchema

/** 供应商编辑校验（所有字段可选） */
export const updateSupplierSchema = supplierSchema.partial()

export type SupplierDTO = z.infer<typeof supplierSchema> & {
  id: string
  code: string
  createdAt: string
  updatedAt: string
}

export type CreateSupplierRequest = z.infer<typeof createSupplierSchema>

export type UpdateSupplierRequest = z.infer<typeof updateSupplierSchema>
