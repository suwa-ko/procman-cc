import { z } from "zod"

import { ContractStatus } from "../enums/contract-status"
import { ContractType } from "../enums/contract-type"

/**
 * 合同采购条目实体校验 schema
 * - 物料/名称/计量单位必填
 * - 数量 > 0，单价 > 0
 * - totalPrice 由系统自动计算
 * - 不包含 id / contractId / sortOrder（系统生成）
 */
export const contractEntrySchema = z.object({
  materialId: z.string().min(1, "物料必填"),
  materialName: z.string().min(1, "物料名称不可为空"),
  spec: z.string().optional(),
  unitPrice: z.number().positive("单价必须大于 0"),
  quantity: z.number().positive("数量必须大于 0"),
  unit: z.string().min(1, "计量单位不可为空"),
  totalPrice: z.number(),
  remark: z.string().optional(),
})

/** 合同条目创建校验 */
export const createContractEntrySchema = contractEntrySchema

/** 合同条目更新校验（所有字段可选） */
export const updateContractEntrySchema = contractEntrySchema.partial()

/**
 * 合同主表实体校验 schema
 * - 名称/类型/供应商/经办人/模板必填
 * - status 创建时由系统默认 Draft
 * - 不包含 id / code / createdAt / updatedAt（系统生成）
 */
export const contractSchema = z.object({
  name: z.string().min(1, "合同名称不可为空"),
  type: z.nativeEnum(ContractType),
  supplierId: z.string().min(1, "供应商必填"),
  handlerId: z.string().min(1, "经办人必填"),
  handlerName: z.string().min(1, "经办人姓名不可为空"),
  templateId: z.string().min(1, "合同模板必填"),
  content: z.record(z.string(), z.unknown()),
  totalAmount: z.number().optional(),
  effectiveDate: z.string().optional(),
  expirationDate: z.string().optional(),
  status: z.nativeEnum(ContractStatus).default(ContractStatus.Draft),
  companyName: z.string().optional(),
  signDate: z.string().optional(),
  signedFilePath: z.string().optional(),
  remark: z.string().optional(),
})

/** 合同创建校验（status 由系统默认 Draft） */
export const createContractSchema = contractSchema.omit({ status: true })

/** 合同更新校验（所有字段可选，不做状态锁定——由 service 层控制） */
export const updateContractSchema = contractSchema.partial()

/** 合同列表查询参数 */
export const contractQuerySchema = z.object({
  keyword: z.string().optional(),
  code: z.string().optional(),
  type: z.nativeEnum(ContractType).optional(),
  supplierId: z.string().optional(),
  status: z.nativeEnum(ContractStatus).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export type ContractEntity = z.infer<typeof contractSchema>
export type ContractEntryEntity = z.infer<typeof contractEntrySchema>
export type CreateContractInput = z.infer<typeof createContractSchema>
export type UpdateContractInput = z.infer<typeof updateContractSchema>
export type CreateContractEntryInput = z.infer<typeof createContractEntrySchema>
export type UpdateContractEntryInput = z.infer<typeof updateContractEntrySchema>
export type ContractQuery = z.infer<typeof contractQuerySchema>
