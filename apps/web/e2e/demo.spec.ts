/**
 * 采购管理系统 — 实时可视化操作演示
 *
 * 运行方式:
 *   pnpm --filter @ps/web test:e2e -- --headed demo.spec.ts
 *   或设置 slowMo:
 *   pnpm --filter @ps/web test:e2e -- --headed --slow-mo=500 demo.spec.ts
 *
 * 演示流程（7 阶段，按业务依赖序）:
 *   第一阶段 → 品类管理 CRUD
 *   第二阶段 → 物料管理 CRUD（关联品类）
 *   第三阶段 → 供应商管理 CRUD
 *   第四阶段 → 合同模板管理 CRUD
 *   第五阶段 → 定价管理（供应商选择器 + 单价）
 *   第六阶段 → 合同状态流转（草稿→生效→作废）
 *   第七阶段 → 人员管理（只读列表 + 搜索过滤）
 */

import { test, expect } from "@playwright/test"
import {
  type CrudMockStore,
  type SeedEntity,
  authInitScript,
  createCrudStore,
  setupCrudRoutes,
} from "./shared/api-mocks"

// ========== 种子数据类型 ==========

interface CategorySeed extends SeedEntity {
  sortOrder: number
  description: string
  parentId: string | null
  createdAt: string
}

interface MaterialSeed extends SeedEntity {
  spec: string
  unit: string
  categoryId: string
  description: string
  createdAt: string
}

interface SupplierSeed extends SeedEntity {
  contactPerson: string
  contactPhone: string
  createdAt: string
}

interface TemplateSeed extends SeedEntity {
  contractType: string
  description: string
  enabled: boolean
  createdAt: string
}

interface PricingSeed extends SeedEntity {
  supplierId: string
  supplierName: string
  materialId: string
  materialName: string
  unitPrice: number
  currency: string
  remark: string
}

interface ContractSeed extends SeedEntity {
  type: string
  supplierId: string
  supplierName: string
  templateId: string
  totalAmount: number
  effectiveDate: string
  expirationDate: string
  remark: string
}

interface PersonSeed extends SeedEntity {
  email: string
  department: string
  title: string
  createdAt: string
}

// ========== 辅助函数 ==========

async function injectAuth(page: import("@playwright/test").Page): Promise<void> {
  await page.addInitScript(authInitScript())
}

/** 演示暂停 */
const PAUSE = 800

// ===================================================================
// 第一阶段：品类管理
// ===================================================================

test.describe("演示 — 品类管理", () => {
  let store: CrudMockStore<CategorySeed>

  test.beforeEach(async ({ page }) => {
    store = createCrudStore<CategorySeed>(4, (i) => ({
      id: `cat-${i}`,
      name: `演示品类${i + 1}`,
      code: `CAT-${String(i + 1).padStart(3, "0")}`,
      sortOrder: i + 1,
      description: `品类描述${i + 1}`,
      parentId: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      status: "active",
    }))
    await injectAuth(page)
    await setupCrudRoutes(page, store, "/api/categories")
  })

  test("新增 → 编辑 → 删除", async ({ page }) => {
    console.log("\n📂 ====== 第一阶段：品类管理 ======\n")

    // 列表
    console.log("  📋 进入品类列表页...")
    await page.goto("/categories")
    await page.waitForSelector(".ant-table-tbody tr.ant-table-row", { timeout: 10000 })
    await page.waitForTimeout(PAUSE)
    await page.screenshot({ path: "test-results/demo/01-category-list.png" })

    // 新增
    console.log("\n  ➕ 点击「新增品类」...")
    await page.getByRole("button", { name: "新增品类" }).click()
    const modal = page.locator(".ant-modal")
    await expect(modal).toBeVisible()
    await page.waitForTimeout(PAUSE)

    await page.getByLabel("名称").fill("电子元器件")
    await page.waitForTimeout(300)
    await page.getByLabel("编码").fill("CAT-ELEC")
    await page.waitForTimeout(300)
    await page.getByLabel("描述").fill("电子元器件品类")
    await page.waitForTimeout(PAUSE)
    await page.screenshot({ path: "test-results/demo/02-category-create.png" })

    console.log("  💾 提交...")
    await modal.locator(".ant-modal-footer button").last().click()
    await expect(modal).not.toBeVisible()
    await page.waitForTimeout(PAUSE)
    console.log("  ✅ 品类创建成功！")

    // 编辑
    console.log("\n  ✏️ 编辑品类...")
    await page.locator(".ant-table-tbody tr.ant-table-row").first().getByRole("button", { name: "编辑" }).click()
    await expect(modal).toBeVisible()
    await page.waitForTimeout(PAUSE)
    await page.getByLabel("名称").clear()
    await page.getByLabel("名称").fill("电子元器件（已更名）")
    await page.waitForTimeout(PAUSE)

    await modal.locator(".ant-modal-footer button").last().click()
    await expect(modal).not.toBeVisible()
    await page.waitForTimeout(PAUSE)
    console.log("  ✅ 品类已更新！")

    // 删除
    console.log("\n  🗑️ 删除品类...")
    await page.locator(".ant-table-tbody tr.ant-table-row").first().getByRole("button", { name: "删除" }).click()
    await expect(page.getByText("确定删除该品类？")).toBeVisible()
    await page.waitForTimeout(PAUSE)
    await page.locator(".ant-popconfirm-buttons button").last().click()
    await page.waitForTimeout(PAUSE)
    await page.screenshot({ path: "test-results/demo/03-category-deleted.png" })
    console.log("  ✅ 品类已删除！\n")
  })
})

// ===================================================================
// 第二阶段：物料管理
// ===================================================================

test.describe("演示 — 物料管理", () => {
  let matStore: CrudMockStore<MaterialSeed>
  let catStore: CrudMockStore<CategorySeed>

  test.beforeEach(async ({ page }) => {
    matStore = createCrudStore<MaterialSeed>(4, (i) => ({
      id: `mat-${i}`,
      name: `演示物料${i + 1}`,
      code: `MAT-2026-${String(i + 1).padStart(4, "0")}`,
      spec: `SPEC-00${i + 1}`,
      unit: ["千克", "米", "件", "升"][i % 4] ?? "件",
      categoryId: `cat-${i}`,
      description: `物料描述${i + 1}`,
      createdAt: "2026-01-01T00:00:00.000Z",
      status: "active",
    }))
    catStore = createCrudStore<CategorySeed>(4, (i) => ({
      id: `cat-${i}`,
      name: `演示品类${i + 1}`,
      code: `CAT-${String(i + 1).padStart(3, "0")}`,
      sortOrder: i + 1,
      description: `品类${i + 1}`,
      parentId: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      status: "active",
    }))
    await injectAuth(page)
    await setupCrudRoutes(page, matStore, "/api/materials")
    await setupCrudRoutes(page, catStore, "/api/categories")
  })

  test("新增 → 编辑 → 删除", async ({ page }) => {
    console.log("\n📦 ====== 第二阶段：物料管理 ======\n")

    console.log("  📋 进入物料列表页...")
    await page.goto("/materials")
    await page.waitForSelector(".ant-table-tbody tr.ant-table-row", { timeout: 10000 })
    await page.waitForTimeout(PAUSE)
    await page.screenshot({ path: "test-results/demo/04-material-list.png" })

    // 新增
    console.log("\n  ➕ 点击「新增物料」...")
    await page.getByRole("button", { name: "新增物料" }).click()
    const modal = page.locator(".ant-modal")
    await expect(modal).toBeVisible()
    await page.waitForTimeout(PAUSE)

    await page.getByLabel("名称").fill("铜芯电缆线")
    await page.waitForTimeout(300)
    await page.getByLabel("规格型号").fill("YJV-4x25")
    await page.waitForTimeout(300)
    await page.getByLabel("单位").fill("米")
    await page.waitForTimeout(300)
    await page.getByLabel("品类ID").fill("cat-0")
    await page.waitForTimeout(300)
    await page.getByLabel("描述").fill("铜芯电力电缆")
    await page.waitForTimeout(PAUSE)
    await page.screenshot({ path: "test-results/demo/05-material-create.png" })

    console.log("  💾 提交...")
    await modal.locator(".ant-modal-footer button").last().click()
    await expect(modal).not.toBeVisible()
    await page.waitForTimeout(PAUSE)
    console.log("  ✅ 物料创建成功！")

    // 编辑
    console.log("\n  ✏️ 编辑物料...")
    await page.locator(".ant-table-tbody tr.ant-table-row").first().getByRole("button", { name: "编辑" }).click()
    await expect(modal).toBeVisible()
    await page.waitForTimeout(PAUSE)
    await page.getByLabel("名称").clear()
    await page.getByLabel("名称").fill("铜芯电缆线（升级版）")
    await page.waitForTimeout(PAUSE)

    await modal.locator(".ant-modal-footer button").last().click()
    await expect(modal).not.toBeVisible()
    await page.waitForTimeout(PAUSE)
    console.log("  ✅ 物料已更新！")

    // 删除
    console.log("\n  🗑️ 删除物料...")
    await page.locator(".ant-table-tbody tr.ant-table-row").first().getByRole("button", { name: "删除" }).click()
    await expect(page.getByText("确定删除该物料？")).toBeVisible()
    await page.waitForTimeout(PAUSE)
    await page.locator(".ant-popconfirm-buttons button").last().click()
    await page.waitForTimeout(PAUSE)
    await page.screenshot({ path: "test-results/demo/06-material-deleted.png" })
    console.log("  ✅ 物料已删除！\n")
  })
})

// ===================================================================
// 第三阶段：供应商管理
// ===================================================================

test.describe("演示 — 供应商管理", () => {
  let store: CrudMockStore<SupplierSeed>

  test.beforeEach(async ({ page }) => {
    store = createCrudStore<SupplierSeed>(5, (i) => ({
      id: `sup-${i}`,
      name: `演示供应商${i + 1}`,
      code: `SUP-2026-${String(i + 1).padStart(4, "0")}`,
      contactPerson: `联系人${i + 1}`,
      contactPhone: "13800138000",
      status: "active",
      createdAt: "2026-01-01T00:00:00.000Z",
    }))
    await injectAuth(page)
    await setupCrudRoutes(page, store, "/api/suppliers")
  })

  test("新增 → 编辑 → 删除", async ({ page }) => {
    console.log("\n🏢 ====== 第三阶段：供应商管理 ======\n")

    console.log("  📋 进入供应商列表页...")
    await page.goto("/suppliers")
    await page.waitForSelector(".ant-table-tbody tr.ant-table-row", { timeout: 10000 })
    await page.waitForTimeout(PAUSE)
    await page.screenshot({ path: "test-results/demo/07-supplier-list.png" })

    // 新增
    console.log("\n  ➕ 点击「新增供应商」...")
    await page.getByRole("button", { name: "新增供应商" }).click()
    const modal = page.locator(".ant-modal")
    await expect(modal).toBeVisible()
    await page.waitForTimeout(PAUSE)

    await page.getByLabel("名称").fill("演示科技公司")
    await page.waitForTimeout(300)
    await page.getByLabel("统一社会信用代码").fill("123456789012345678")
    await page.waitForTimeout(300)
    await page.getByLabel("联系人").fill("张三")
    await page.waitForTimeout(300)
    await page.getByLabel("联系电话").fill("13912345678")
    await page.waitForTimeout(300)
    await page.getByLabel("地址").fill("北京市朝阳区")
    await page.waitForTimeout(PAUSE)
    await page.screenshot({ path: "test-results/demo/08-supplier-create.png" })

    console.log("  💾 提交...")
    await modal.locator(".ant-modal-footer button").last().click()
    await expect(modal).not.toBeVisible()
    await page.waitForTimeout(PAUSE)
    console.log("  ✅ 供应商创建成功！")

    // 编辑
    console.log("\n  ✏️ 编辑供应商...")
    await page.locator(".ant-table-tbody tr.ant-table-row").first().getByRole("button", { name: "编辑" }).click()
    await expect(modal).toBeVisible()
    await page.waitForTimeout(PAUSE)
    await page.getByLabel("名称").clear()
    await page.getByLabel("名称").fill("演示科技集团（已更名）")
    await page.waitForTimeout(PAUSE)

    await modal.locator(".ant-modal-footer button").last().click()
    await expect(modal).not.toBeVisible()
    await page.waitForTimeout(PAUSE)
    console.log("  ✅ 供应商已更新！")

    // 删除
    console.log("\n  🗑️ 删除供应商...")
    await page.locator(".ant-table-tbody tr.ant-table-row").first().getByRole("button", { name: "删除" }).click()
    await expect(page.getByText("确定删除该供应商？")).toBeVisible()
    await page.waitForTimeout(PAUSE)
    await page.locator(".ant-popconfirm-buttons button").last().click()
    await page.waitForTimeout(PAUSE)
    await page.screenshot({ path: "test-results/demo/09-supplier-deleted.png" })
    console.log("  ✅ 供应商已删除！\n")
  })
})

// ===================================================================
// 第四阶段：合同模板管理
// ===================================================================

test.describe("演示 — 合同模板管理", () => {
  let store: CrudMockStore<TemplateSeed>

  test.beforeEach(async ({ page }) => {
    store = createCrudStore<TemplateSeed>(3, (i) => ({
      id: `tpl-${i}`,
      name: `演示模板${i + 1}`,
      code: `TPL-2026-${String(i + 1).padStart(4, "0")}`,
      contractType: "purchase",
      description: `模板描述${i + 1}`,
      enabled: true,
      createdAt: "2026-01-01T00:00:00.000Z",
    }))
    await injectAuth(page)
    await setupCrudRoutes(page, store, "/api/templates")
  })

  test("新增 → 编辑 → 删除", async ({ page }) => {
    console.log("\n📄 ====== 第四阶段：合同模板管理 ======\n")

    console.log("  📋 进入模板列表页...")
    await page.goto("/templates")
    await page.waitForSelector(".ant-table-tbody tr.ant-table-row", { timeout: 10000 })
    await page.waitForTimeout(PAUSE)
    await page.screenshot({ path: "test-results/demo/10-template-list.png" })

    // 新增
    console.log("\n  ➕ 点击「新增模板」...")
    await page.getByRole("button", { name: "新增模板" }).click()
    const modal = page.locator(".ant-modal")
    await expect(modal).toBeVisible()
    await page.waitForTimeout(PAUSE)

    await page.getByLabel("模板名称").fill("年度采购合同模板A")
    await page.waitForTimeout(300)
    await page.getByLabel("描述").fill("适用于年度框架协议的采购合同标准模板")
    await page.waitForTimeout(PAUSE)
    await page.screenshot({ path: "test-results/demo/11-template-create.png" })

    console.log("  💾 提交...")
    await modal.locator(".ant-modal-footer button").last().click()
    await expect(modal).not.toBeVisible()
    await page.waitForTimeout(PAUSE)
    console.log("  ✅ 模板创建成功！")

    // 编辑
    console.log("\n  ✏️ 编辑模板...")
    await page.locator(".ant-table-tbody tr.ant-table-row").first().getByRole("button", { name: "编辑" }).click()
    await expect(modal).toBeVisible()
    await page.waitForTimeout(PAUSE)
    await page.getByLabel("模板名称").clear()
    await page.getByLabel("模板名称").fill("年度采购合同模板A（v2）")
    await page.waitForTimeout(PAUSE)

    await modal.locator(".ant-modal-footer button").last().click()
    await expect(modal).not.toBeVisible()
    await page.waitForTimeout(PAUSE)
    console.log("  ✅ 模板已更新！")

    // 删除
    console.log("\n  🗑️ 删除模板...")
    await page.locator(".ant-table-tbody tr.ant-table-row").first().getByRole("button", { name: "删除" }).click()
    await expect(page.getByText("确定删除该模板？")).toBeVisible()
    await page.waitForTimeout(PAUSE)
    await page.locator(".ant-popconfirm-buttons button").last().click()
    await page.waitForTimeout(PAUSE)
    await page.screenshot({ path: "test-results/demo/12-template-deleted.png" })
    console.log("  ✅ 模板已删除！\n")
  })
})

// ===================================================================
// 第五阶段：定价管理
// ===================================================================

test.describe("演示 — 定价管理", () => {
  let pricingStore: CrudMockStore<PricingSeed>
  let supStore: CrudMockStore<SupplierSeed>

  test.beforeEach(async ({ page }) => {
    pricingStore = createCrudStore<PricingSeed>(3, (i) => ({
      id: `prc-${i}`,
      name: `定价${i + 1}`,
      code: `PRC-2026-${String(i + 1).padStart(4, "0")}`,
      supplierId: `sup-${i}`,
      supplierName: `演示供应商${i + 1}`,
      materialId: `mat-${i}`,
      materialName: `物料${i + 1}`,
      unitPrice: 49.99 + i * 10,
      currency: "CNY",
      status: "active",
      remark: "",
    }))
    supStore = createCrudStore<SupplierSeed>(5, (i) => ({
      id: `sup-${i}`,
      name: `演示供应商${i + 1}`,
      code: `SUP-2026-${String(i + 1).padStart(4, "0")}`,
      contactPerson: `联系人${i + 1}`,
      contactPhone: "13800138000",
      status: "active",
      createdAt: "2026-01-01T00:00:00.000Z",
    }))
    await injectAuth(page)
    await setupCrudRoutes(page, pricingStore, "/api/pricings")
    await setupCrudRoutes(page, supStore, "/api/suppliers")
  })

  test("选择供应商 → 填写单价 → 创建定价", async ({ page }) => {
    console.log("\n💰 ====== 第五阶段：定价管理 ======\n")

    console.log("  📋 进入定价列表页...")
    await page.goto("/pricings")
    await page.waitForSelector(".ant-table-tbody tr.ant-table-row", { timeout: 10000 })
    await page.waitForTimeout(PAUSE)
    await page.screenshot({ path: "test-results/demo/13-pricing-list.png" })

    // 新增
    console.log("\n  ➕ 点击「新增定价」...")
    await page.getByRole("button", { name: "新增定价" }).click()
    const modal = page.locator(".ant-modal")
    await expect(modal).toBeVisible()
    await page.waitForTimeout(PAUSE)

    // 供应商选择器
    console.log("  🔍 供应商选择器..." )
    await modal.locator(".ant-select-selector").click()
    await page.waitForTimeout(500)
    await page.waitForSelector(".ant-select-dropdown", { timeout: 5000 })
    await page.waitForTimeout(PAUSE)
    await page.locator(".ant-select-dropdown .ant-select-item").first().click()
    await page.waitForTimeout(PAUSE)

    // 物料ID + 单价
    await modal.locator('[role="spinbutton"]').first().fill("10001")
    await page.waitForTimeout(300)
    await modal.locator('[role="spinbutton"]').nth(1).fill("199.99")
    await page.waitForTimeout(300)
    await modal.getByPlaceholder("备注").fill("年度框架协议价")
    await page.waitForTimeout(PAUSE)
    await page.screenshot({ path: "test-results/demo/14-pricing-form.png" })

    console.log("  💾 提交...")
    await modal.locator(".ant-modal-footer button").last().click()
    await expect(modal).not.toBeVisible()
    await page.waitForTimeout(PAUSE)
    await expect(page.getByText("¥199.99")).toBeVisible()
    console.log("  ✅ 定价创建成功！¥199.99\n")
    await page.screenshot({ path: "test-results/demo/15-pricing-created.png" })
  })
})

// ===================================================================
// 第六阶段：合同管理
// ===================================================================

test.describe("演示 — 合同管理", () => {
  let contractStore: CrudMockStore<ContractSeed>
  let supStore: CrudMockStore<SupplierSeed>
  let tplStore: CrudMockStore<TemplateSeed>

  test.beforeEach(async ({ page }) => {
    contractStore = createCrudStore<ContractSeed>(3, (i) => ({
      id: `ctr-${i}`,
      name: `演示合同${i + 1}`,
      code: `CTR-2026-${String(i + 1).padStart(4, "0")}`,
      type: "purchase",
      supplierId: `sup-${i}`,
      supplierName: `演示供应商${i + 1}`,
      templateId: `tpl-${i}`,
      totalAmount: 10000 + i * 5000,
      effectiveDate: "2026-01-01",
      expirationDate: "2026-12-31",
      status: "draft",
      remark: "",
    }))
    supStore = createCrudStore<SupplierSeed>(5, (i) => ({
      id: `sup-${i}`,
      name: `演示供应商${i + 1}`,
      code: `SUP-2026-${String(i + 1).padStart(4, "0")}`,
      contactPerson: `联系人${i + 1}`,
      contactPhone: "13800138000",
      status: "active",
      createdAt: "2026-01-01T00:00:00.000Z",
    }))
    tplStore = createCrudStore<TemplateSeed>(3, (i) => ({
      id: `tpl-${i}`,
      name: `演示模板${i + 1}`,
      code: `TPL-2026-${String(i + 1).padStart(4, "0")}`,
      contractType: "purchase",
      description: `模板${i + 1}`,
      enabled: true,
      createdAt: "2026-01-01T00:00:00.000Z",
    }))
    await injectAuth(page)
    await setupCrudRoutes(page, contractStore, "/api/contracts")
    await setupCrudRoutes(page, supStore, "/api/suppliers")
    await setupCrudRoutes(page, tplStore, "/api/templates")

    await page.route(
      /\/api\/contracts\/[^/]+\/(activate|void|return-to-draft)/,
      async (route) => {
        const url = new URL(route.request().url())
        const parts = url.pathname.split("/")
        const id = parts[3]
        const action = parts[4]
        let newStatus = "draft"
        if (action === "activate") newStatus = "effective"
        else if (action === "void") newStatus = "voided"
        else if (action === "return-to-draft") newStatus = "draft"
        const updated = contractStore.update(id ?? "", { status: newStatus } as Partial<ContractSeed>)
        return route.fulfill({ status: 200, json: { code: 0, data: updated, message: "ok" } })
      },
    )
  })

  test("状态流转：草稿 → 生效 → 作废", async ({ page }) => {
    console.log("\n📝 ====== 第六阶段：合同管理 ======\n")

    console.log("  📋 进入合同列表页...")
    await page.goto("/contracts")
    await page.waitForSelector(".ant-table-tbody tr.ant-table-row", { timeout: 10000 })
    await page.waitForTimeout(PAUSE)
    await page.screenshot({ path: "test-results/demo/16-contract-list.png" })

    const firstRow = page.locator(".ant-table-tbody tr.ant-table-row").first()
    await expect(firstRow.getByText("草稿")).toBeVisible()
    console.log("  📄 当前状态：草稿（灰色标签）")
    await page.waitForTimeout(PAUSE)

    // 生效
    console.log("\n  ✅ 点击「生效」...")
    await firstRow.getByRole("button", { name: "生效" }).click()
    await expect(page.getByText("确定生效该合同？生效后不可编辑")).toBeVisible()
    await page.waitForTimeout(PAUSE)
    await page.locator(".ant-popconfirm-buttons button").last().click()
    await page.waitForTimeout(PAUSE)

    console.log("  🔄 刷新...")
    await page.reload()
    await page.waitForSelector(".ant-table-tbody tr.ant-table-row", { timeout: 10000 })
    await page.waitForTimeout(PAUSE)

    const updatedRow = page.locator(".ant-table-tbody tr.ant-table-row").first()
    await expect(updatedRow.getByText("已生效")).toBeVisible()
    console.log("  📗 状态：已生效（绿色标签）")
    await page.screenshot({ path: "test-results/demo/17-contract-effective.png" })
    await page.waitForTimeout(PAUSE)

    // 作废
    console.log("\n  ❌ 点击「作废」...")
    await updatedRow.getByRole("button", { name: "作废" }).click()
    await expect(page.getByText("确定作废该合同？此操作不可逆")).toBeVisible()
    await page.waitForTimeout(PAUSE)
    await page.locator(".ant-popconfirm-buttons button").last().click()
    await page.waitForTimeout(PAUSE)

    console.log("  🔄 刷新...")
    await page.reload()
    await page.waitForSelector(".ant-table-tbody tr.ant-table-row", { timeout: 10000 })
    await page.waitForTimeout(PAUSE)

    const voidedRow = page.locator(".ant-table-tbody tr.ant-table-row").first()
    await expect(voidedRow.getByText("已作废")).toBeVisible()
    console.log("  📕 状态：已作废（红色标签）")
    await page.screenshot({ path: "test-results/demo/18-contract-voided.png" })
    await page.waitForTimeout(PAUSE)

    // 删除
    console.log("\n  🗑️ 删除合同...")
    await firstRow.getByRole("button", { name: "删除" }).click()
    await expect(page.getByText("确定删除该合同？")).toBeVisible()
    await page.waitForTimeout(PAUSE)
    await page.locator(".ant-popconfirm-buttons button").last().click()
    await page.waitForTimeout(PAUSE)
    await page.screenshot({ path: "test-results/demo/19-contract-deleted.png" })
    console.log("  ✅ 合同已删除！\n")
  })
})

// ===================================================================
// 第七阶段：人员管理
// ===================================================================

test.describe("演示 — 人员管理", () => {
  let store: CrudMockStore<PersonSeed>

  test.beforeEach(async ({ page }) => {
    store = createCrudStore<PersonSeed>(10, (i) => ({
      id: `person-${i}`,
      name: `用户${i + 1}`,
      email: `user${i + 1}@example.com`,
      department: ["技术部", "采购部", "财务部", "行政部"][i % 4] ?? "技术部",
      title: ["工程师", "经理", "主管"][i % 3] ?? "工程师",
      createdAt: "2026-01-01T00:00:00.000Z",
    }))
    await injectAuth(page)
    await setupCrudRoutes(page, store, "/api/persons")
  })

  test("列表展示 + 搜索过滤", async ({ page }) => {
    console.log("\n👥 ====== 第七阶段：人员管理 ======\n")

    console.log("  📋 进入人员列表页...")
    await page.goto("/persons")
    await page.waitForSelector(".ant-table-tbody tr.ant-table-row", { timeout: 10000 })
    await page.waitForTimeout(PAUSE)

    await expect(page.locator(".ant-table-tbody tr.ant-table-row")).toHaveCount(10)
    await expect(page.getByText("共 10 条")).toBeVisible()
    console.log("  ✅ 共 10 条人员记录")
    await page.screenshot({ path: "test-results/demo/20-persons-list.png" })
    await page.waitForTimeout(PAUSE)

    console.log("\n  🔍 搜索「用户1」...")
    await page.locator('input[placeholder="搜索人员姓名"]').fill("用户1")
    await page.waitForTimeout(300)
    await page.locator('input[placeholder="搜索人员姓名"]').press("Enter")
    await page.waitForTimeout(PAUSE)

    const rows = page.locator(".ant-table-tbody tr.ant-table-row")
    const count = await rows.count()
    console.log(`  ✅ 搜索结果：${count} 条匹配记录`)
    expect(count).toBeGreaterThanOrEqual(1)
    await page.screenshot({ path: "test-results/demo/21-persons-search.png" })
    await page.waitForTimeout(PAUSE)

    console.log("\n🎉 ====== 演示结束！七阶段全部完成 ======\n")
  })
})
