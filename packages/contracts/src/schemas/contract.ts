import { z } from "zod"

import { ContractStatus } from "../enums/contract-status"
import { ContractType } from "../enums/contract-type"

/**
 * 合同采购条目校验 schema（对应 PRD 附录 B V-14）
 * - 数量 > 0
 * - 单价 > 0
 */
export const contractEntrySchema = z.object({
  materialId: z.string().min(1, "物料必填"),
  materialName: z.string().min(1, "物料名称不可为空"),
  spec: z.string().optional(),
  unitPrice: z.number().positive("单价必须大于 0"),
  quantity: z.number().positive("数量必须大于 0"),
  unit: z.string().min(1, "计量单位不可为空"),
  totalPrice: z.number(), // 系统自动计算
  remark: z.string().optional(),
})

/**
 * 合同主表校验 schema
 * - 供应商、类型、经办人必填
 * - 内容 JSON 必填
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
})

export const createContractSchema = contractSchema.omit({ status: true })

export const updateContractSchema = contractSchema
  .omit({
    status: true,
    type: true,
    supplierId: true,
    handlerId: true,
    handlerName: true,
    templateId: true,
  })
  .partial()

export type ContractDTO = z.infer<typeof contractSchema> & {
  id: string
  code: string
  createdAt: string
  updatedAt: string
}

export type ContractEntryDTO = z.infer<typeof contractEntrySchema> & {
  id: string
  contractId: string
  sortOrder: number
}

export type CreateContractRequest = z.infer<typeof createContractSchema>

export type UpdateContractRequest = z.infer<typeof updateContractSchema>

export type CreateContractEntryRequest = z.infer<typeof contractEntrySchema>
