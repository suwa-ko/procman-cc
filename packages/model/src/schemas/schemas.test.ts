/**
 * @ps/model — Schema 校验冒烟测试
 * 确保每个 Zod schema 对合法数据通过、对非法数据拒绝
 */

import { describe, expect, it } from "vitest"

import { ContractStatus, ContractType, MaterialStatus, SupplierStatus } from "../enums"
import {
  categorySchema,
  contractEntrySchema,
  contractSchema,
  loginSchema,
  materialSchema,
  personSchema,
  pricingSchema,
  registerSchema,
  supplierSchema,
  templateSchema,
} from "../schemas"

// ========== supplier ==========

describe("supplierSchema", () => {
  it("合法数据通过", () => {
    const r = supplierSchema.safeParse({ name: "AB", creditCode: "123456789012345678", status: SupplierStatus.Active })
    expect(r.success).toBe(true)
  })

  it("缺少 name 拒绝", () => {
    const r = supplierSchema.safeParse({ creditCode: "123456789012345678", status: SupplierStatus.Active })
    expect(r.success).toBe(false)
  })

  it("creditCode 不是 18 位拒绝", () => {
    const r = supplierSchema.safeParse({ name: "AB", creditCode: "123", status: SupplierStatus.Active })
    expect(r.success).toBe(false)
  })

  it("非法 status 拒绝", () => {
    const r = supplierSchema.safeParse({ name: "AB", creditCode: "123456789012345678", status: "unknown" })
    expect(r.success).toBe(false)
  })
})

// ========== category ==========

describe("categorySchema", () => {
  it("合法数据通过", () => {
    const r = categorySchema.safeParse({ name: "CAT", sortOrder: 1 })
    expect(r.success).toBe(true)
  })

  it("默认 sortOrder=0", () => {
    const r = categorySchema.safeParse({ name: "CAT" })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.sortOrder).toBe(0)
    }
  })

  it("缺 name 拒绝", () => {
    const r = categorySchema.safeParse({})
    expect(r.success).toBe(false)
  })
})

// ========== material ==========

describe("materialSchema", () => {
  it("合法数据通过", () => {
    const r = materialSchema.safeParse({ name: "M", unit: "个", categoryId: "uuid-1", status: MaterialStatus.Active })
    expect(r.success).toBe(true)
  })

  it("缺 unit 拒绝", () => {
    const r = materialSchema.safeParse({ name: "M", categoryId: "uuid-1", status: MaterialStatus.Active })
    expect(r.success).toBe(false)
  })

  it("缺 categoryId 拒绝", () => {
    const r = materialSchema.safeParse({ name: "M", unit: "个", status: MaterialStatus.Active })
    expect(r.success).toBe(false)
  })
})

// ========== pricing ==========

describe("pricingSchema", () => {
  it("合法数据通过", () => {
    const r = pricingSchema.safeParse({ supplierId: "s-1", materialId: "m-1", unitPrice: 10.5, currency: "CNY" })
    expect(r.success).toBe(true)
  })

  it("unitPrice <= 0 拒绝", () => {
    const r = pricingSchema.safeParse({ supplierId: "s-1", materialId: "m-1", unitPrice: 0, currency: "CNY" })
    expect(r.success).toBe(false)
  })

  it("unitPrice 精度超限拒绝", () => {
    const r = pricingSchema.safeParse({ supplierId: "s-1", materialId: "m-1", unitPrice: 10.555, currency: "CNY" })
    expect(r.success).toBe(false)
  })

  it("非法 currency 拒绝", () => {
    const r = pricingSchema.safeParse({ supplierId: "s-1", materialId: "m-1", unitPrice: 10, currency: "USD" })
    expect(r.success).toBe(false)
  })
})

// ========== contract ==========

describe("contractSchema", () => {
  const validContract = {
    name: "C",
    type: ContractType.PurchaseContract,
    supplierId: "s-1",
    handlerId: "h-1",
    handlerName: "张三",
    templateId: "t-1",
    content: {},
  }

  it("合法数据通过", () => {
    const r = contractSchema.safeParse(validContract)
    expect(r.success).toBe(true)
  })

  it("默认 status = Draft", () => {
    const r = contractSchema.safeParse(validContract)
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.status).toBe(ContractStatus.Draft)
    }
  })

  it("缺 supplierId 拒绝", () => {
    const r = contractSchema.safeParse({ ...validContract, supplierId: "" })
    expect(r.success).toBe(false)
  })

  it("缺 handlerName 拒绝", () => {
    const r = contractSchema.safeParse({ ...validContract, handlerName: "" })
    expect(r.success).toBe(false)
  })
})

describe("contractEntrySchema", () => {
  it("合法数据通过", () => {
    const r = contractEntrySchema.safeParse({
      materialId: "m-1", materialName: "M", unitPrice: 10, quantity: 5, unit: "个", totalPrice: 50,
    })
    expect(r.success).toBe(true)
  })

  it("quantity <= 0 拒绝", () => {
    const r = contractEntrySchema.safeParse({
      materialId: "m-1", materialName: "M", unitPrice: 10, quantity: 0, unit: "个", totalPrice: 0,
    })
    expect(r.success).toBe(false)
  })
})

// ========== template ==========

describe("templateSchema", () => {
  it("合法数据通过", () => {
    const r = templateSchema.safeParse({ name: "T", contractType: ContractType.PurchaseContract, htmlContent: "<h1>T</h1>", variables: {} })
    expect(r.success).toBe(true)
  })

  it("缺 htmlContent 拒绝", () => {
    const r = templateSchema.safeParse({ name: "T", contractType: ContractType.PurchaseContract, variables: {} })
    expect(r.success).toBe(false)
  })

  it("非法 contractType 拒绝", () => {
    const r = templateSchema.safeParse({ name: "T", contractType: "unknown", htmlContent: "<h1>T</h1>", variables: {} })
    expect(r.success).toBe(false)
  })
})

// ========== person ==========

describe("personSchema", () => {
  it("合法数据通过", () => {
    const r = personSchema.safeParse({ name: "张三" })
    expect(r.success).toBe(true)
  })

  it("缺 name 拒绝", () => {
    const r = personSchema.safeParse({})
    expect(r.success).toBe(false)
  })

  it("非法 email 拒绝", () => {
    const r = personSchema.safeParse({ name: "张三", email: "not-an-email" })
    expect(r.success).toBe(false)
  })
})

// ========== auth ==========

describe("loginSchema", () => {
  it("合法数据通过", () => {
    const r = loginSchema.safeParse({ username: "zhangsan", password: "123456" })
    expect(r.success).toBe(true)
  })

  it("缺 password 拒绝", () => {
    const r = loginSchema.safeParse({ username: "zhangsan" })
    expect(r.success).toBe(false)
  })
})

describe("registerSchema", () => {
  it("合法数据通过", () => {
    const r = registerSchema.safeParse({ username: "zhangsan", password: "12345678", personId: "p-1" })
    expect(r.success).toBe(true)
  })

  it("password 少于 6 位拒绝", () => {
    const r = registerSchema.safeParse({ username: "zhangsan", password: "12345", personId: "p-1" })
    expect(r.success).toBe(false)
  })
})
