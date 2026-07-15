// @ts-nocheck — 测试中枚举字符串字面量运行时值与枚举一致
import { beforeEach, describe, expect, it } from "vitest"

import { createMockStores } from "../mocks"
import type { AllMockStores } from "../mocks"

let stores: AllMockStores

beforeEach(() => {
  stores = createMockStores()
})

// ============================================================================
// 测试
// ============================================================================

describe("前端集成测试（Store 层）", () => {
  // ---------- 认证 ----------
  describe("认证", () => {
    it("admin 登录成功并获取 token", () => {
      const result = stores.auth.login({
        username: "admin",
        password: "admin123",
      })
      expect(result.token).toBeTruthy()
      expect(result.token).toMatch(/^mock-token-/)
    })

    it("错误密码登录抛出异常", () => {
      expect(() => {
        stores.auth.login({ username: "admin", password: "wrong" })
      }).toThrow("用户名或密码错误")
    })

    it("注册新用户成功", () => {
      const result = stores.auth.register({
        username: "test-user",
        password: "test123456",
        personId: "person-001",
      })
      expect(result.token).toBeTruthy()
      expect(result.token).toMatch(/^mock-token-/)
    })

    it("重复注册抛出异常", () => {
      stores.auth.register({
        username: "test-user-dup",
        password: "test123456",
        personId: "person-001",
      })
      expect(() => {
        stores.auth.register({
          username: "test-user-dup",
          password: "test123456",
          personId: "person-002",
        })
      }).toThrow("用户名已存在")
    })
  })

  // ---------- 供应商 CRUD ----------
  describe("供应商 CRUD", () => {
    it("创建供应商", () => {
      const created = stores.supplier.create({
        name: "测试供应商",
        creditCode: "123456789012345678",
        contactPerson: "张三",
        contactPhone: "13800001111",
        status: "active",
        address: "测试地址",
      })
      expect(created.id).toBeTruthy()
      expect(created.name).toBe("测试供应商")
    })

    it("供应商列表查询", () => {
      const result = stores.supplier.listByQuery({ page: 1, pageSize: 10 })
      // 初始 store 为空也可能，验证返回结构正确
      expect(result).toBeDefined()
      expect(Array.isArray(result.data)).toBe(true)
      expect(typeof result.total).toBe("number")
    })

    it("供应商详情", () => {
      const created = stores.supplier.create({
        name: "详情供应商",
        creditCode: "223456789012345678",
        status: "active",
      })
      const found = stores.supplier.getById(created.id)
      expect(found).toBeDefined()
      expect(found?.name).toBe("详情供应商")
    })

    it("更新供应商", () => {
      const created = stores.supplier.create({
        name: "原始名称",
        creditCode: "323456789012345678",
        status: "active",
      })
      const updated = stores.supplier.update(created.id, { name: "已更新名称" })
      expect(updated).toBeDefined()
      expect(updated?.name).toBe("已更新名称")
    })

    it("删除供应商", () => {
      const created = stores.supplier.create({
        name: "待删除",
        creditCode: "423456789012345678",
        status: "active",
      })
      const deleted = stores.supplier.delete(created.id)
      expect(deleted).toBe(true)
      const found = stores.supplier.getById(created.id)
      expect(found).toBeUndefined()
    })
  })

  // ---------- 品类 CRUD ----------
  describe("品类 CRUD", () => {
    it("创建品类", () => {
      const created = stores.category.create({ name: "测试品类", sortOrder: 1 })
      expect(created.id).toBeTruthy()
      expect(created.name).toBe("测试品类")
    })

    it("品类列表查询", () => {
      stores.category.create({ name: "列表品类", sortOrder: 1 })
      const result = stores.category.list({ page: 1, pageSize: 10 })
      expect(result.total).toBeGreaterThanOrEqual(1)
    })

    it("更新品类", () => {
      const created = stores.category.create({ name: "品类原", sortOrder: 1 })
      const updated = stores.category.update(created.id, { name: "品类更新" })
      expect(updated?.name).toBe("品类更新")
    })

    it("删除品类", () => {
      const created = stores.category.create({ name: "待删品类", sortOrder: 1 })
      const deleted = stores.category.delete(created.id)
      expect(deleted).toBe(true)
      expect(stores.category.getById(created.id)).toBeUndefined()
    })
  })

  // ---------- 物料 CRUD ----------
  describe("物料 CRUD", () => {
    it("创建物料", () => {
      const cat = stores.category.create({ name: "物料品类", sortOrder: 1 })
      const created = stores.material.create({
        name: "测试物料",
        unit: "个",
        categoryId: cat.id,
        status: "active",
      })
      expect(created.id).toBeTruthy()
      expect(created.name).toBe("测试物料")
    })

    it("物料列表查询", () => {
      const cat = stores.category.create({ name: "列表品类", sortOrder: 1 })
      stores.material.create({
        name: "列表物料",
        unit: "个",
        categoryId: cat.id,
        status: "active",
      })
      const result = stores.material.listByQuery({ page: 1, pageSize: 10 })
      expect(Array.isArray(result.data)).toBe(true)
    })

    it("更新物料", () => {
      const cat = stores.category.create({ name: "更新品类", sortOrder: 1 })
      const created = stores.material.create({
        name: "原物料",
        unit: "个",
        categoryId: cat.id,
        status: "active",
      })
      const updated = stores.material.update(created.id, {
        name: "已更新物料",
        unit: "套",
      })
      expect(updated?.name).toBe("已更新物料")
      expect(updated?.unit).toBe("套")
    })

    it("删除物料", () => {
      const cat = stores.category.create({ name: "删除品类", sortOrder: 1 })
      const created = stores.material.create({
        name: "待删物料",
        unit: "个",
        categoryId: cat.id,
        status: "active",
      })
      expect(stores.material.delete(created.id)).toBe(true)
      expect(stores.material.getById(created.id)).toBeUndefined()
    })
  })

  // ---------- 定价 CRUD ----------
  describe("定价 CRUD", () => {
    function createPricingFixture() {
      const sup = stores.supplier.create({
        name: "定价供应商",
        creditCode: "523456789012345678",
        status: "active",
      })
      const cat = stores.category.create({ name: "定价品类", sortOrder: 1 })
      const mat = stores.material.create({
        name: "定价物料",
        unit: "个",
        categoryId: cat.id,
        status: "active",
      })
      return { sup, mat }
    }

    it("创建定价", () => {
      const { sup, mat } = createPricingFixture()
      const created = stores.pricing.create({
        supplierId: sup.id,
        supplierName: sup.name,
        materialId: mat.id,
        materialName: mat.name,
        unitPrice: 99.5,
        currency: "CNY",
        status: "active",
        effectiveDate: "2026-01-01",
      })
      expect(created.id).toBeTruthy()
      expect(created.unitPrice).toBe(99.5)
    })

    it("定价自动失效（业务规则）", () => {
      const { sup, mat } = createPricingFixture()

      const first = stores.pricing.create({
        supplierId: sup.id,
        supplierName: sup.name,
        materialId: mat.id,
        materialName: mat.name,
        unitPrice: 100,
        currency: "CNY",
        status: "active",
        effectiveDate: "2026-01-01",
      })
      expect(first.status).toBe("active")

      const second = stores.pricing.createWithInvalidation({
        supplierId: sup.id,
        supplierName: sup.name,
        materialId: mat.id,
        materialName: mat.name,
        unitPrice: 200,
        currency: "CNY",
        status: "active",
        effectiveDate: "2026-06-01",
      })
      expect(second.status).toBe("active")
      expect(second.unitPrice).toBe(200)

      const updatedFirst = stores.pricing.getById(first.id)
      expect(updatedFirst?.status).toBe("inactive")
    })

    it("定价列表查询", () => {
      const { sup, mat } = createPricingFixture()
      stores.pricing.create({
        supplierId: sup.id,
        supplierName: sup.name,
        materialId: mat.id,
        materialName: mat.name,
        unitPrice: 50,
        currency: "CNY",
        status: "active",
        effectiveDate: "2026-01-01",
      })
      const result = stores.pricing.listByQuery({ page: 1, pageSize: 10 })
      expect(Array.isArray(result.data)).toBe(true)
    })

    it("更新定价", () => {
      const { sup, mat } = createPricingFixture()
      const created = stores.pricing.create({
        supplierId: sup.id,
        supplierName: sup.name,
        materialId: mat.id,
        materialName: mat.name,
        unitPrice: 50,
        currency: "CNY",
        status: "active",
        effectiveDate: "2026-01-01",
      })
      const updated = stores.pricing.update(created.id, {
        unitPrice: 150,
        currency: "USD",
      })
      expect(updated?.unitPrice).toBe(150)
      expect(updated?.currency).toBe("USD")
    })

    it("删除定价", () => {
      const { sup, mat } = createPricingFixture()
      const created = stores.pricing.create({
        supplierId: sup.id,
        supplierName: sup.name,
        materialId: mat.id,
        materialName: mat.name,
        unitPrice: 50,
        currency: "CNY",
        status: "active",
        effectiveDate: "2026-01-01",
      })
      expect(stores.pricing.delete(created.id)).toBe(true)
    })
  })

  // ---------- 模板 CRUD ----------
  describe("模板 CRUD", () => {
    it("创建模板", () => {
      const created = stores.template.create({
        name: "测试模板",
        contractType: "purchase_contract",
        htmlContent: "<h1>测试</h1>",
        enabled: true,
      })
      expect(created.id).toBeTruthy()
      expect(created.name).toBe("测试模板")
    })

    it("模板列表查询", () => {
      stores.template.create({
        name: "列表模板",
        contractType: "purchase_contract",
        htmlContent: "<p>x</p>",
        enabled: true,
      })
      const result = stores.template.list({ page: 1, pageSize: 10 })
      expect(Array.isArray(result.data)).toBe(true)
    })

    it("更新模板", () => {
      const created = stores.template.create({
        name: "模板原",
        contractType: "purchase_contract",
        htmlContent: "<p>old</p>",
        enabled: true,
      })
      const updated = stores.template.update(created.id, {
        name: "模板已更新",
        enabled: false,
      })
      expect(updated?.name).toBe("模板已更新")
      expect(updated?.enabled).toBe(false)
    })

    it("删除模板", () => {
      const created = stores.template.create({
        name: "待删模板",
        contractType: "purchase_contract",
        htmlContent: "<p>del</p>",
        enabled: true,
      })
      expect(stores.template.delete(created.id)).toBe(true)
    })
  })

  // ---------- 合同 CRUD + 状态流转 ----------
  describe("合同完整流程", () => {
    it("创建合同（含条目）", () => {
      const supId = stores.supplier.create({
        name: "合同供应商",
        creditCode: "923456789012345678",
        status: "active",
      }).id
      const tplId = stores.template.create({
        name: "合同模板",
        contractType: "purchase_contract",
        htmlContent: "<h1>{{name}}</h1>",
        enabled: true,
      }).id

      const created = stores.contract.create({
        name: "测试合同",
        type: "purchase_contract",
        supplierId: supId,
        handlerId: "person-001",
        handlerName: "张三",
        templateId: tplId,
        status: "draft",
        content: {},
        totalAmount: 50000,
      })
      expect(created.id).toBeTruthy()
      expect(created.status).toBe("draft")

      stores.contract.setEntries(created.id, [
        {
          id: "entry-1",
          contractId: created.id,
          sortOrder: 1,
          materialId: "mat-1",
          materialName: "测试物料A",
          unitPrice: 100,
          quantity: 10,
          unit: "个",
          totalPrice: 1000,
        },
      ])

      const entries = stores.contract.getEntries(created.id)
      expect(entries.length).toBe(1)
    })

    it("合同列表查询", () => {
      const supId = stores.supplier.create({
        name: "列表供应商",
        creditCode: "133456789012345678",
        status: "active",
      }).id
      stores.contract.create({
        name: "列表合同",
        type: "purchase_contract",
        supplierId: supId,
        handlerId: "person-001",
        handlerName: "张三",
        templateId: "tpl-1",
        status: "draft",
        content: {},
        totalAmount: 10000,
      })
      const result = stores.contract.listByQuery({ page: 1, pageSize: 10 })
      expect(Array.isArray(result.data)).toBe(true)
    })

    it("合同详情", () => {
      const supId = stores.supplier.create({
        name: "详情供应商",
        creditCode: "233456789012345678",
        status: "active",
      }).id
      const created = stores.contract.create({
        name: "详情合同",
        type: "purchase_contract",
        supplierId: supId,
        handlerId: "person-001",
        handlerName: "张三",
        templateId: "tpl-1",
        status: "draft",
        content: {},
        totalAmount: 50000,
      })
      const found = stores.contract.getById(created.id)
      expect(found).toBeDefined()
      expect(found?.name).toBe("详情合同")
    })

    it("合同条目查询", () => {
      const supId = stores.supplier.create({
        name: "条目供应商",
        creditCode: "333456789012345678",
        status: "active",
      }).id
      const created = stores.contract.create({
        name: "条目合同",
        type: "purchase_contract",
        supplierId: supId,
        handlerId: "person-001",
        handlerName: "张三",
        templateId: "tpl-1",
        status: "draft",
        content: {},
        totalAmount: 1000,
      })
      stores.contract.setEntries(created.id, [
        {
          id: "entry-99",
          contractId: created.id,
          sortOrder: 1,
          materialId: "mat-x",
          materialName: "条目物料",
          unitPrice: 50,
          quantity: 2,
          unit: "个",
          totalPrice: 100,
        },
      ])
      const entries = stores.contract.getEntries(created.id)
      expect(entries.length).toBe(1)
      expect(entries[0]?.materialName).toBe("条目物料")
    })

    it("合同生效（draft → effective）", () => {
      const supId = stores.supplier.create({
        name: "生效供应商",
        creditCode: "433456789012345678",
        status: "active",
      }).id
      const created = stores.contract.create({
        name: "生效合同",
        type: "purchase_contract",
        supplierId: supId,
        handlerId: "person-001",
        handlerName: "张三",
        templateId: "tpl-1",
        status: "draft",
        content: {},
        totalAmount: 50000,
      })
      const updated = stores.contract.update(created.id, {
        status: "effective",
      })
      expect(updated?.status).toBe("effective")
    })

    it("合同退回草稿（effective → draft）", () => {
      const supId = stores.supplier.create({
        name: "退回供应商",
        creditCode: "533456789012345678",
        status: "active",
      }).id
      const created = stores.contract.create({
        name: "退回合同",
        type: "purchase_contract",
        supplierId: supId,
        handlerId: "person-001",
        handlerName: "张三",
        templateId: "tpl-1",
        status: "effective",
        content: {},
        totalAmount: 50000,
      })
      const updated = stores.contract.update(created.id, { status: "draft" })
      expect(updated?.status).toBe("draft")
    })

    it("合同作废", () => {
      const supId = stores.supplier.create({
        name: "作废供应商",
        creditCode: "633456789012345678",
        status: "active",
      }).id
      const created = stores.contract.create({
        name: "作废合同",
        type: "purchase_contract",
        supplierId: supId,
        handlerId: "person-001",
        handlerName: "张三",
        templateId: "tpl-1",
        status: "draft",
        content: {},
        totalAmount: 50000,
      })
      const updated = stores.contract.update(created.id, { status: "void" })
      expect(updated?.status).toBe("void")
    })

    it("更新合同", () => {
      const supId = stores.supplier.create({
        name: "更新合同供应商",
        creditCode: "733456789012345678",
        status: "active",
      }).id
      const created = stores.contract.create({
        name: "待更新合同",
        type: "purchase_contract",
        supplierId: supId,
        handlerId: "person-001",
        handlerName: "李四",
        templateId: "tpl-1",
        status: "draft",
        content: {},
        totalAmount: 10000,
      })
      const updated = stores.contract.update(created.id, {
        name: "已更新合同",
        totalAmount: 60000,
      })
      expect(updated?.name).toBe("已更新合同")
      expect(updated?.totalAmount).toBe(60000)
    })

    it("删除合同（连带条目清理）", () => {
      const supId = stores.supplier.create({
        name: "删除合同供应商",
        creditCode: "833456789012345678",
        status: "active",
      }).id
      const created = stores.contract.create({
        name: "待删除合同",
        type: "purchase_contract",
        supplierId: supId,
        handlerId: "person-001",
        handlerName: "王五",
        templateId: "tpl-1",
        status: "draft",
        content: {},
        totalAmount: 5000,
      })
      stores.contract.setEntries(created.id, [
        {
          id: "entry-del",
          contractId: created.id,
          sortOrder: 1,
          materialId: "mat-del",
          materialName: "待删物料",
          unitPrice: 10,
          quantity: 1,
          unit: "个",
          totalPrice: 10,
        },
      ])
      expect(stores.contract.delete(created.id)).toBe(true)
      expect(stores.contract.getById(created.id)).toBeUndefined()
      expect(stores.contract.getEntries(created.id).length).toBe(0)
    })
  })
})
