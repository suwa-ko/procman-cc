import { describe, expect, it } from "vitest"

import { ContractStatus } from "../enums/contract-status"
import { ContractType } from "../enums/contract-type"
import { MaterialStatus } from "../enums/material-status"
import { PricingStatus } from "../enums/pricing-status"
import { SupplierStatus } from "../enums/supplier-status"
import {
  contractEntrySchema,
  createContractSchema,
  createMaterialSchema,
  createPricingSchema,
  createSupplierSchema,
  updateContractSchema,
  updateSupplierSchema,
} from "../index"

// ============================================================
// 供应商 Schema
// ============================================================

describe("supplierSchema", () => {
  const validSupplier = {
    name: "测试供应商",
    creditCode: "123456789012345678",
    contactPerson: "张三",
    contactPhone: "13800138000",
    contactEmail: "test@example.com",
    address: "测试地址",
    businessScope: "电子元器件",
    status: SupplierStatus.Active,
    remark: "测试备注",
  }

  it("完整有效数据应校验通过", () => {
    const result = createSupplierSchema.safeParse(validSupplier)
    expect(result.success).toBe(true)
  })

  it("供应商名称不可为空", () => {
    const result = createSupplierSchema.safeParse({
      ...validSupplier,
      name: "",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("供应商名称不可为空")
    }
  })

  it("统一社会信用代码必须为 18 位", () => {
    const result = createSupplierSchema.safeParse({
      ...validSupplier,
      creditCode: "123",
    })
    expect(result.success).toBe(false)
  })

  it("统一社会信用代码超过 18 位应失败", () => {
    const result = createSupplierSchema.safeParse({
      ...validSupplier,
      creditCode: "1234567890123456789",
    })
    expect(result.success).toBe(false)
  })

  it("必填字段缺失应失败", () => {
    const result = createSupplierSchema.safeParse({
      name: "test",
      status: SupplierStatus.Active,
    })
    expect(result.success).toBe(false)
  })

  it("邮箱格式不正确应失败", () => {
    const result = createSupplierSchema.safeParse({
      ...validSupplier,
      contactEmail: "invalid",
    })
    expect(result.success).toBe(false)
  })

  it("updateSupplierSchema 允许部分字段", () => {
    const result = updateSupplierSchema.safeParse({ name: "新名称" })
    expect(result.success).toBe(true)
  })

  it("updateSupplierSchema 空对象应通过", () => {
    const result = updateSupplierSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})

// ============================================================
// 物料 Schema
// ============================================================

describe("materialSchema", () => {
  const validMaterial = {
    name: "贴片电容",
    spec: "0805 100nF",
    unit: "个",
    categoryId: "cat-1",
    description: "描述",
    status: MaterialStatus.Active,
  }

  it("完整有效数据应校验通过", () => {
    const result = createMaterialSchema.safeParse(validMaterial)
    expect(result.success).toBe(true)
  })

  it("物料名称不可为空", () => {
    const result = createMaterialSchema.safeParse({
      ...validMaterial,
      name: "",
    })
    expect(result.success).toBe(false)
  })

  it("计量单位不可为空", () => {
    const result = createMaterialSchema.safeParse({
      ...validMaterial,
      unit: "",
    })
    expect(result.success).toBe(false)
  })

  it("所属品类必填", () => {
    const result = createMaterialSchema.safeParse({
      ...validMaterial,
      categoryId: "",
    })
    expect(result.success).toBe(false)
  })
})

// ============================================================
// 定价 Schema
// ============================================================

describe("pricingSchema", () => {
  const validPricing = {
    supplierId: "sup-1",
    materialId: "mat-1",
    unitPrice: 12.5,
    currency: "CNY" as const,
    status: PricingStatus.Active,
  }

  it("完整有效数据应校验通过", () => {
    const result = createPricingSchema.safeParse(validPricing)
    expect(result.success).toBe(true)
  })

  it("单价必须大于 0", () => {
    const result = createPricingSchema.safeParse({
      ...validPricing,
      unitPrice: 0,
    })
    expect(result.success).toBe(false)
  })

  it("单价不能为负数", () => {
    const result = createPricingSchema.safeParse({
      ...validPricing,
      unitPrice: -1,
    })
    expect(result.success).toBe(false)
  })

  it("单价精度最多两位小数", () => {
    const result = createPricingSchema.safeParse({
      ...validPricing,
      unitPrice: 12.345,
    })
    expect(result.success).toBe(false)
  })

  it("单价两位小数应通过", () => {
    const result = createPricingSchema.safeParse({
      ...validPricing,
      unitPrice: 12.34,
    })
    expect(result.success).toBe(true)
  })

  it("供应商必填", () => {
    const result = createPricingSchema.safeParse({
      ...validPricing,
      supplierId: "",
    })
    expect(result.success).toBe(false)
  })

  it("物料必填", () => {
    const result = createPricingSchema.safeParse({
      ...validPricing,
      materialId: "",
    })
    expect(result.success).toBe(false)
  })
})

// ============================================================
// 合同 Schema
// ============================================================

describe("contractSchema", () => {
  const validContract = {
    name: "2026年度CPU采购合同",
    type: ContractType.PurchaseContract,
    supplierId: "sup-1",
    handlerId: "person-1",
    handlerName: "张三",
    templateId: "tpl-1",
    content: { delivery: "成都", payment: "月结" },
    effectiveDate: "2026-07-01",
  }

  it("完整有效数据应校验通过", () => {
    const result = createContractSchema.safeParse(validContract)
    expect(result.success).toBe(true)
  })

  it("合同名称不可为空", () => {
    const result = createContractSchema.safeParse({
      ...validContract,
      name: "",
    })
    expect(result.success).toBe(false)
  })

  it("经办人必填", () => {
    const result = createContractSchema.safeParse({
      ...validContract,
      handlerId: "",
    })
    expect(result.success).toBe(false)
  })

  it("content 必须为对象", () => {
    const result = createContractSchema.safeParse({
      ...validContract,
      content: "not-an-object",
    })
    expect(result.success).toBe(false)
  })

  it("updateContractSchema 允许部分字段", () => {
    const result = updateContractSchema.safeParse({ name: "新名称" })
    expect(result.success).toBe(true)
  })
})

// ============================================================
// 合同采购条目 Schema
// ============================================================

describe("contractEntrySchema", () => {
  const validEntry = {
    materialId: "mat-1",
    materialName: "贴片电容",
    spec: "0805",
    unitPrice: 1.5,
    quantity: 100,
    unit: "个",
    totalPrice: 150,
  }

  it("完整有效数据应校验通过", () => {
    const result = contractEntrySchema.safeParse(validEntry)
    expect(result.success).toBe(true)
  })

  it("数量必须大于 0", () => {
    const result = contractEntrySchema.safeParse({
      ...validEntry,
      quantity: 0,
    })
    expect(result.success).toBe(false)
  })

  it("单价必须大于 0", () => {
    const result = contractEntrySchema.safeParse({
      ...validEntry,
      unitPrice: 0,
    })
    expect(result.success).toBe(false)
  })

  it("物料名称不可为空", () => {
    const result = contractEntrySchema.safeParse({
      ...validEntry,
      materialName: "",
    })
    expect(result.success).toBe(false)
  })
})

// ============================================================
// 枚举常量验证
// ============================================================

describe("枚举常量", () => {
  it("SupplierStatus 包含三个状态", () => {
    expect(Object.values(SupplierStatus)).toHaveLength(3)
    expect(SupplierStatus.Active).toBe("active")
    expect(SupplierStatus.Frozen).toBe("frozen")
    expect(SupplierStatus.Obsolete).toBe("obsolete")
  })

  it("ContractStatus 包含四个状态", () => {
    expect(Object.values(ContractStatus)).toHaveLength(4)
  })

  it("ContractType 包含两种类型", () => {
    expect(Object.values(ContractType)).toHaveLength(2)
  })

  it("PricingStatus 包含两个状态", () => {
    expect(Object.values(PricingStatus)).toHaveLength(2)
  })

  it("MaterialStatus 包含两个状态", () => {
    expect(Object.values(MaterialStatus)).toHaveLength(2)
  })
})
