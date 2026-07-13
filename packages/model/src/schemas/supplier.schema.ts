import { z } from "zod"

import { SupplierStatus } from "../enums/supplier-status"

/**
 * 供应商实体校验 schema
 * - 名称必填
 * - 统一社会信用代码 18 位
 * - 不包含 id / code / createdAt / updatedAt（系统生成）
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

/** 供应商创建校验（系统字段 id/code/createdAt/updatedAt 已自动排除） */
export const createSupplierSchema = supplierSchema

/** 供应商更新校验（所有字段可选） */
export const updateSupplierSchema = supplierSchema.partial()

/** 供应商列表查询参数 */
export const supplierQuerySchema = z.object({
  keyword: z.string().optional(),
  status: z.nativeEnum(SupplierStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export type SupplierEntity = z.infer<typeof supplierSchema>
export type CreateSupplierInput = z.infer<typeof createSupplierSchema>
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>
export type SupplierQuery = z.infer<typeof supplierQuerySchema>
