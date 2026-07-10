import { SupplierStatus } from "@ps/contracts"
import { describe, expect, it } from "vitest"

import {
  createCategory,
  createCategoryList,
  createCategoryTree,
  createCategoryTreeNode,
  createContract,
  createContractEntry,
  createContractEntryList,
  createContractList,
  createLoginRequest,
  createLoginResponse,
  createMaterial,
  createMaterialList,
  createPerson,
  createPersonList,
  createPricing,
  createPricingList,
  createRegisterRequest,
  createSupplier,
  createSupplierList,
  createTemplate,
  createTemplateList,
  createTemplateVariable,
} from "../factories"

describe("supplier factory", () => {
  it("createSupplier 返回有效 SupplierDTO", () => {
    const s = createSupplier()
    expect(typeof s.id).toBe("string")
    expect(s.id.length).toBeGreaterThan(0)
    expect(s.code.startsWith("SUP-")).toBe(true)
    expect(typeof s.name).toBe("string")
    expect(s.creditCode.length).toBe(18)
    expect(Object.values(SupplierStatus)).toContain(s.status)
    expect(typeof s.createdAt).toBe("string")
  })

  it("createSupplier 支持 overrides", () => {
    const s = createSupplier({
      name: "自定义公司",
      status: SupplierStatus.Frozen,
    })
    expect(s.name).toBe("自定义公司")
    expect(s.status).toBe(SupplierStatus.Frozen)
    expect(s.creditCode.length).toBe(18)
  })

  it("createSupplierList 返回正确数量", () => {
    const list = createSupplierList(5)
    expect(list).toHaveLength(5)
  })

  it("createSupplierList 支持 overrides", () => {
    const list = createSupplierList(3, { status: SupplierStatus.Obsolete })
    expect(list).toHaveLength(3)
    list.forEach((s) => {
      expect(s.status).toBe(SupplierStatus.Obsolete)
    })
  })
})

describe("category factory", () => {
  it("createCategory 返回有效 CategoryDTO", () => {
    const c = createCategory()
    expect(typeof c.id).toBe("string")
    expect(typeof c.code).toBe("string")
    expect(typeof c.name).toBe("string")
    expect(c.parentId === null || typeof c.parentId === "string").toBe(true)
  })

  it("createCategory 支持 overrides", () => {
    const parentId = "parent-001"
    const c = createCategory({ name: "测试品类", parentId })
    expect(c.name).toBe("测试品类")
    expect(c.parentId).toBe(parentId)
  })

  it("createCategoryList 返回正确数量", () => {
    const list = createCategoryList(3)
    expect(list).toHaveLength(3)
  })

  it("createCategoryTreeNode 返回节点且 children 为空数组", () => {
    const node = createCategoryTreeNode()
    expect(Array.isArray(node.children)).toBe(true)
    expect(node.children).toHaveLength(0)
  })

  it("createCategoryTree 创建树结构", () => {
    const tree = createCategoryTree(3, 2)
    expect(tree).toHaveLength(2)
    const root = tree[0]
    if (!root) {
      throw new Error("root node missing")
    }
    expect(root.children).toHaveLength(2)
    const level2 = root.children[0]
    if (!level2) {
      throw new Error("level2 node missing")
    }
    expect(level2.parentId).toBe(root.id)
    expect(level2.children).toHaveLength(2)
    const level3 = level2.children[0]
    if (!level3) {
      throw new Error("level3 node missing")
    }
    expect(level3.parentId).toBe(level2.id)
    expect(level3.children).toHaveLength(0)
  })
})

describe("material factory", () => {
  it("createMaterial 返回有效 MaterialDTO", () => {
    const m = createMaterial()
    expect(typeof m.id).toBe("string")
    expect(m.code.startsWith("MAT-")).toBe(true)
    expect(typeof m.name).toBe("string")
    expect(typeof m.unit).toBe("string")
    expect(m.unit.length).toBeGreaterThan(0)
    expect(typeof m.categoryId).toBe("string")
    expect(typeof m.status).toBe("string")
  })

  it("createMaterial 支持 overrides", () => {
    const m = createMaterial({ name: "测试物料", unit: "箱" })
    expect(m.name).toBe("测试物料")
    expect(m.unit).toBe("箱")
  })

  it("createMaterialList 返回正确数量", () => {
    const list = createMaterialList(4)
    expect(list).toHaveLength(4)
  })
})

describe("pricing factory", () => {
  it("createPricing 返回有效 PricingDTO", () => {
    const p = createPricing()
    expect(typeof p.id).toBe("string")
    expect(p.code.startsWith("PRC-")).toBe(true)
    expect(typeof p.supplierId).toBe("string")
    expect(typeof p.materialId).toBe("string")
    expect(p.unitPrice).toBeGreaterThan(0)
    expect(p.currency).toBe("CNY")
    expect(typeof p.status).toBe("string")
  })

  it("createPricing 支持 overrides", () => {
    const p = createPricing({ unitPrice: 99.99, currency: "CNY" })
    expect(p.unitPrice).toBe(99.99)
    expect(p.currency).toBe("CNY")
  })

  it("createPricingList 返回正确数量", () => {
    const list = createPricingList(3)
    expect(list).toHaveLength(3)
  })
})

describe("contract factory", () => {
  it("createContract 返回有效 ContractDTO", () => {
    const c = createContract()
    expect(typeof c.id).toBe("string")
    expect(c.code.startsWith("CTT-")).toBe(true)
    expect(typeof c.name).toBe("string")
    expect(typeof c.type).toBe("string")
    expect(typeof c.supplierId).toBe("string")
    expect(typeof c.handlerId).toBe("string")
    expect(typeof c.handlerName).toBe("string")
    expect(typeof c.templateId).toBe("string")
    expect(typeof c.content).toBe("object")
    expect(typeof c.status).toBe("string")
    expect(typeof c.createdAt).toBe("string")
  })

  it("createContract 支持 overrides", () => {
    const c = createContract({ name: "自定义合同", totalAmount: 50000 })
    expect(c.name).toBe("自定义合同")
    expect(c.totalAmount).toBe(50000)
  })

  it("createContractList 返回正确数量", () => {
    const list = createContractList(3)
    expect(list).toHaveLength(3)
  })

  it("createContractEntry 返回有效 ContractEntryDTO", () => {
    const e = createContractEntry()
    expect(typeof e.id).toBe("string")
    expect(typeof e.contractId).toBe("string")
    expect(typeof e.materialId).toBe("string")
    expect(typeof e.materialName).toBe("string")
    expect(e.unitPrice).toBeGreaterThan(0)
    expect(e.quantity).toBeGreaterThan(0)
    expect(e.totalPrice).toBeCloseTo(e.unitPrice * e.quantity, 1)
    expect(e.sortOrder).toBeGreaterThanOrEqual(1)
  })

  it("createContractEntryList 返回正确数量且关联合同", () => {
    const contractId = "contract-001"
    const list = createContractEntryList(3, contractId)
    expect(list).toHaveLength(3)
    list.forEach((e, i) => {
      expect(e.contractId).toBe(contractId)
      expect(e.sortOrder).toBe(i + 1)
    })
  })
})

describe("template factory", () => {
  it("createTemplate 返回有效 TemplateDTO", () => {
    const t = createTemplate()
    expect(typeof t.id).toBe("string")
    expect(t.code.startsWith("TPL-")).toBe(true)
    expect(typeof t.name).toBe("string")
    expect(typeof t.contractType).toBe("string")
    expect(typeof t.htmlContent).toBe("string")
    expect(typeof t.variables).toBe("object")
    expect(Object.keys(t.variables).length).toBeGreaterThan(0)
    expect(typeof t.version).toBe("string")
    expect(typeof t.enabled).toBe("boolean")
  })

  it("createTemplate 支持 overrides", () => {
    const t = createTemplate({ name: "自定义模板", enabled: false })
    expect(t.name).toBe("自定义模板")
    expect(t.enabled).toBe(false)
  })

  it("createTemplateList 返回正确数量", () => {
    const list = createTemplateList(3)
    expect(list).toHaveLength(3)
  })

  it("createTemplateVariable 返回有效 TemplateVariable", () => {
    const v = createTemplateVariable()
    expect(typeof v.type).toBe("string")
    expect(typeof v.label).toBe("string")
  })
})

describe("auth factory", () => {
  it("createLoginRequest 返回有效 LoginRequest", () => {
    const r = createLoginRequest()
    expect(typeof r.username).toBe("string")
    expect(typeof r.password).toBe("string")
  })

  it("createLoginResponse 返回有效 LoginResponse", () => {
    const r = createLoginResponse()
    expect(typeof r.token).toBe("string")
    expect(typeof r.person.id).toBe("string")
    expect(typeof r.person.name).toBe("string")
  })

  it("createRegisterRequest 返回有效 RegisterRequest", () => {
    const r = createRegisterRequest()
    expect(typeof r.username).toBe("string")
    expect(typeof r.password).toBe("string")
    expect(typeof r.personId).toBe("string")
  })
})

describe("person factory", () => {
  it("createPerson 返回有效 PersonDTO", () => {
    const p = createPerson()
    expect(typeof p.id).toBe("string")
    expect(typeof p.name).toBe("string")
  })

  it("createPersonList 返回正确数量", () => {
    const list = createPersonList(3)
    expect(list).toHaveLength(3)
  })
})
