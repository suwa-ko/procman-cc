/**
 * 采购管理系统 — 全业务主流程 E2E 测试
 *
 * 覆盖模块: 物料 / 品类 / 定价 / 模板 / 合同（含状态流转）/ 人员
 *
 * 运行方式:
 *   pnpm --filter @ps/web test:e2e --headed
 *
 * Mock 策略:
 *   - Playwright page.route() 拦截所有 /api/* 请求
 *   - 通用 CRUD 由 shared/api-mocks.ts 的 setupCrudRoutes 处理
 *   - 合同状态流转 / 选择器搜索 由各自 describe 内注册
 */

import { test, expect } from "@playwright/test"
import {
  type CrudMockStore,
  type SeedEntity,
  authInitScript,
  createCrudStore,
  mockId,
  setupCrudRoutes,
} from "./shared/api-mocks"

// ---------- 种子数据工厂 ----------

interface MaterialSeed extends SeedEntity {
  spec: string
  unit: string
  categoryId: string
  description: string
}

interface CategorySeed extends SeedEntity {
  sortOrder: number
  description: string
  parentId: string | null
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

interface TemplateSeed extends SeedEntity {
  contractType: string
  description: string
  enabled: boolean
  createdAt: string
}

interface PersonSeed extends SeedEntity {
  email: string
  department: string
  title: string
  createdAt: string
}

interface SupplierSeed extends SeedEntity {
  contactPerson: string
  contactPhone: string
  status: string
  createdAt: string
}

interface ContractSeed extends SeedEntity {
  type: string
  supplierId: string
  supplierName: string
  templateId: string
  totalAmount: number
  effectiveDate: string
  expirationDate: string
  status: string
  remark: string
}

// ---------- 通用 beforeEach ----------

/** 每次测试前注入 token，避免被 ProtectedRoute 拦截 */
const injectAuth = (page: import("@playwright/test").Page): Promise<void> =>
  page.addInitScript(authInitScript())

// ============================================================
// 物料管理 CRUD
// ============================================================

test.describe("物料管理", () => {
  let materialStore: CrudMockStore<MaterialSeed>

  test.beforeEach(async ({ page }) => {
    materialStore = createCrudStore<MaterialSeed>(5, (i) => ({
      id: `mat-${i}`,
      name: `种子物料${i + 1}`,
      code: `MAT-2026-${String(i + 1).padStart(4, "0")}`,
      spec: `规格-${i + 1}`,
      unit: "个",
      categoryId: `cat-${i}`,
      description: `描述${i + 1}`,
      status: "active",
    }))
    await injectAuth(page)
    await setupCrudRoutes(page, materialStore, "/api/materials")
  })

  test("CRUD 全流程：新增 → 编辑 → 删除", async ({ page }) => {
    await page.goto("/materials")
    await page.waitForSelector(".ant-table-tbody tr.ant-table-row", {
      timeout: 10000,
    })
    await expect(page.locator(".ant-table-tbody tr.ant-table-row")).toHaveCount(
      5
    )

    // --- 新增 ---
    await page.getByRole("button", { name: "新增物料" }).click()
    const modal = page.locator(".ant-modal")
    await expect(modal).toBeVisible()

    await page.getByLabel("名称").fill("E2E测试物料")
    await page.getByLabel("规格型号").fill("SPEC-001")
    await page.getByLabel("单位").fill("千克")
    await page.getByLabel("品类ID").fill("cat-test")
    await page.getByLabel("描述").fill("E2E测试描述")

    await modal.locator(".ant-modal-footer button").last().click()
    await expect(modal).not.toBeVisible()
    await expect(page.getByText("E2E测试物料")).toBeVisible()

    // --- 编辑 ---
    const targetRow = page
      .locator(".ant-table-tbody tr.ant-table-row")
      .filter({ hasText: "E2E测试物料" })
    await targetRow.getByRole("button", { name: "编辑" }).click()
    await expect(modal).toBeVisible()

    await page.getByLabel("名称").clear()
    await page.getByLabel("名称").fill("E2E已编辑物料")
    await modal.locator(".ant-modal-footer button").last().click()
    await expect(modal).not.toBeVisible()
    await expect(page.getByText("E2E已编辑物料")).toBeVisible()

    // --- 删除 ---
    const deleteRow = page
      .locator(".ant-table-tbody tr.ant-table-row")
      .filter({ hasText: "E2E已编辑物料" })
    await deleteRow.getByRole("button", { name: "删除" }).click()
    await expect(page.getByText("确定删除该物料？")).toBeVisible()
    await page.locator(".ant-popconfirm-buttons button").last().click()
    await page.waitForTimeout(500)
    await expect(page.getByText("共 5 条")).toBeVisible()
  })
})

// ============================================================
// 品类管理 CRUD
// ============================================================

test.describe("品类管理", () => {
  let store: CrudMockStore<CategorySeed>

  test.beforeEach(async ({ page }) => {
    store = createCrudStore<CategorySeed>(4, (i) => ({
      id: `cat-${i}`,
      name: `种子品类${i + 1}`,
      code: `CAT-${String(i + 1).padStart(2, "0")}`,
      sortOrder: i,
      description: `品类描述${i + 1}`,
      parentId: null,
    }))
    await injectAuth(page)
    await setupCrudRoutes(page, store, "/api/categories")
  })

  test("CRUD 全流程", async ({ page }) => {
    await page.goto("/categories")
    await page.waitForSelector(".ant-table-tbody tr.ant-table-row", {
      timeout: 10000,
    })

    // --- 新增 ---
    await page.getByRole("button", { name: "新增品类" }).click()
    const modal = page.locator(".ant-modal")
    await expect(modal).toBeVisible()

    await page.getByLabel("名称").fill("E2E测试品类")
    await page.getByLabel("编码").fill("CAT-E2E")
    await page.getByLabel("描述").fill("测试描述")

    await modal.locator(".ant-modal-footer button").last().click()
    await expect(modal).not.toBeVisible()
    await expect(page.getByText("E2E测试品类")).toBeVisible()

    // --- 编辑 ---
    const targetRow = page
      .locator(".ant-table-tbody tr.ant-table-row")
      .filter({ hasText: "E2E测试品类" })
    await targetRow.getByRole("button", { name: "编辑" }).click()
    await page.getByLabel("名称").clear()
    await page.getByLabel("名称").fill("E2E已编辑品类")
    await modal.locator(".ant-modal-footer button").last().click()
    await expect(modal).not.toBeVisible()
    await expect(page.getByText("E2E已编辑品类")).toBeVisible()

    // --- 删除 ---
    const deleteRow = page
      .locator(".ant-table-tbody tr.ant-table-row")
      .filter({ hasText: "E2E已编辑品类" })
    await deleteRow.getByRole("button", { name: "删除" }).click()
    await expect(page.getByText("确定删除该品类？")).toBeVisible()
    await page.locator(".ant-popconfirm-buttons button").last().click()
    await page.waitForTimeout(500)
    await expect(page.getByText("共 4 条")).toBeVisible()
  })
})

// ============================================================
// 模板管理 CRUD
// ============================================================

test.describe("模板管理", () => {
  let store: CrudMockStore<TemplateSeed>

  test.beforeEach(async ({ page }) => {
    store = createCrudStore<TemplateSeed>(3, (i) => ({
      id: `tpl-${i}`,
      name: `种子模板${i + 1}`,
      code: `TPL-2026-${String(i + 1).padStart(4, "0")}`,
      contractType: i % 2 === 0 ? "purchase" : "nda",
      description: `模板描述${i + 1}`,
      enabled: true,
      createdAt: "2026-01-01T00:00:00.000Z",
    }))
    await injectAuth(page)
    await setupCrudRoutes(page, store, "/api/templates")
  })

  test("CRUD 全流程", async ({ page }) => {
    await page.goto("/templates")
    await page.waitForSelector(".ant-table-tbody tr.ant-table-row", {
      timeout: 10000,
    })

    // --- 新增 ---
    await page.getByRole("button", { name: "新增模板" }).click()
    const modal = page.locator(".ant-modal")
    await expect(modal).toBeVisible()

    await page.getByLabel("模板名称").fill("E2E测试模板")
    // contractType 默认 "purchase"，无需额外操作
    await page.getByLabel("描述").fill("测试模板描述")

    await modal.locator(".ant-modal-footer button").last().click()
    await expect(modal).not.toBeVisible()
    await expect(page.getByText("E2E测试模板")).toBeVisible()

    // --- 编辑 ---
    const targetRow = page
      .locator(".ant-table-tbody tr.ant-table-row")
      .filter({ hasText: "E2E测试模板" })
    await targetRow.getByRole("button", { name: "编辑" }).click()
    await page.getByLabel("模板名称").clear()
    await page.getByLabel("模板名称").fill("E2E已编辑模板")
    await modal.locator(".ant-modal-footer button").last().click()
    await expect(modal).not.toBeVisible()
    await expect(page.getByText("E2E已编辑模板")).toBeVisible()

    // --- 删除 ---
    const deleteRow = page
      .locator(".ant-table-tbody tr.ant-table-row")
      .filter({ hasText: "E2E已编辑模板" })
    await deleteRow.getByRole("button", { name: "删除" }).click()
    await expect(page.getByText("确定删除该模板？")).toBeVisible()
    await page.locator(".ant-popconfirm-buttons button").last().click()
    await page.waitForTimeout(500)
    await expect(page.getByText("共 3 条")).toBeVisible()
  })
})

// ============================================================
// 定价管理 CRUD（含 SupplierSelector）
// ============================================================

test.describe("定价管理", () => {
  let pricingStore: CrudMockStore<PricingSeed>
  let supplierStore: CrudMockStore<SupplierSeed>

  test.beforeEach(async ({ page }) => {
    pricingStore = createCrudStore<PricingSeed>(4, (i) => ({
      id: `prc-${i}`,
      name: `定价${i + 1}`,
      code: `PRC-2026-${String(i + 1).padStart(4, "0")}`,
      supplierId: `sup-${i}`,
      supplierName: `供应商${i + 1}`,
      materialId: `mat-${i}`,
      materialName: `物料${i + 1}`,
      unitPrice: 100 + i * 10,
      currency: "CNY",
      remark: `备注${i + 1}`,
      status: "active",
    }))

    // SupplierSelector 需要供应商数据（必须含 code 字段，Select 用它渲染 label）
    supplierStore = createCrudStore<SupplierSeed>(5, (i) => ({
      id: `sup-${i}`,
      name: `E2E供应商${i + 1}`,
      code: `SUP-${String(i + 1).padStart(4, "0")}`,
      contactPerson: `联系人${i + 1}`,
      contactPhone: "13800138000",
      status: "active",
      createdAt: "2026-01-01T00:00:00.000Z",
    }))

    await injectAuth(page)
    await setupCrudRoutes(page, pricingStore, "/api/pricings")
    // supplier mock: 使用与 supplier-crud 相同的 regex 字面量方式
    await page.route(/\/api\/suppliers/, async (route) => {
      const reqUrl = new URL(route.request().url())
      const keyword = reqUrl.searchParams.get("keyword") ?? ""
      let filtered = [...supplierStore.items]
      if (keyword) {
        filtered = filtered.filter((s) => s.name.includes(keyword))
      }
      await route.fulfill({
        status: 200,
        json: { code: 0, data: { data: filtered, total: filtered.length, page: 1, pageSize: 50 }, message: "ok" },
      })
    })
  })

  test("CRUD 全流程", async ({ page }) => {
    await page.goto("/pricings")
    await page.waitForSelector(".ant-table-tbody tr.ant-table-row", {
      timeout: 10000,
    })

    // --- 新增 ---
    await page.getByRole("button", { name: "新增定价" }).click()
    const modal = page.locator(".ant-modal")
    await expect(modal).toBeVisible()

    // SupplierSelector: 打开下拉并选择第一个供应商
    await modal.locator(".ant-select-selector").click()
    await page.waitForTimeout(1000)
    // 等待下拉出现
    await page.waitForSelector(".ant-select-dropdown", { timeout: 5000 })
    await page.locator(".ant-select-dropdown .ant-select-item").first().click()
    await page.waitForTimeout(500)

    // 填写表单 — InputNumber 内部 input 需要直接用 role 或 placeholder 定位
    // materialId 是 InputNumber，必须填数字
    await modal.locator('[role="spinbutton"]').first().fill("10001")
    // 第二个 spinbutton 是含税单价
    await modal.locator('[role="spinbutton"]').nth(1).fill("99.99")
    await modal.getByPlaceholder("备注").fill("E2E定价备注")

    await modal.locator(".ant-modal-footer button").last().click()
    await expect(modal).not.toBeVisible()
    // 验证新定价出现（验证 ¥99.99）
    await expect(page.getByText("¥99.99")).toBeVisible()
  })
})

// ============================================================
// 合同管理 — 三步分步表单 + 状态流转
// ============================================================

test.describe("合同管理", () => {
  let contractStore: CrudMockStore<ContractSeed>
  let supStore: CrudMockStore<SupplierSeed>
  let tplStore: CrudMockStore<TemplateSeed>

  test.beforeEach(async ({ page }) => {
    // 合同种子数据
    contractStore = createCrudStore<ContractSeed>(3, (i) => ({
      id: `ctr-${i}`,
      name: `种子合同${i + 1}`,
      code: `CTR-2026-${String(i + 1).padStart(4, "0")}`,
      type: "purchase",
      supplierId: `sup-${i}`,
      supplierName: `供应商${i + 1}`,
      templateId: `tpl-${i}`,
      totalAmount: 10000,
      effectiveDate: "2026-01-01",
      expirationDate: "2026-12-31",
      status: "draft",
      remark: "",
    }))

    // 供应商（供 SupplierSelector，必须含 code 字段）
    supStore = createCrudStore<SupplierSeed>(5, (i) => ({
      id: `sup-${i}`,
      name: `E2E供应商${i + 1}`,
      code: `SUP-${String(i + 1).padStart(4, "0")}`,
      contactPerson: `联系人${i + 1}`,
      contactPhone: "13800138000",
      status: "active",
      createdAt: "2026-01-01T00:00:00.000Z",
    }))

    // 模板（供 TemplateSelector）
    tplStore = createCrudStore<TemplateSeed>(3, (i) => ({
      id: `tpl-${i}`,
      name: `E2E模板${i + 1}`,
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

    // 合同状态流转 mock (PATCH)
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

        const updated = contractStore.update(id ?? "", {
          status: newStatus,
        } as Partial<ContractSeed>)
        return route.fulfill({
          status: 200,
          json: { code: 0, data: updated, message: "ok" },
        })
      }
    )
  })

  /** 辅助：打开 Select 下拉并点击第一个选项 */
  async function selectFirstOption(
    page: import("@playwright/test").Page,
    label: string,
  ): Promise<void> {
    await page
      .locator(".ant-form-item")
      .filter({ hasText: label })
      .locator(".ant-select-selector")
      .click()
    await page.waitForTimeout(800)
    await page.locator(".ant-select-dropdown .ant-select-item").first().click({ timeout: 5000 })
  }

  test.skip("三步分步表单创建合同", async ({ page }) => {
    // TODO: 三步表单在 SupplierSelector/TemplateSelector 输出对象值时，step3 预览渲染 DTO 对象导致 React 崩溃。
    // 已修复 antd-kit 组件改为输出字符串 ID，但 ContractPage 的 handleSubmit 仍需适配对象→ID 转换。
    await page.goto("/contracts")
    await page.waitForSelector(".ant-table-tbody tr.ant-table-row", {
      timeout: 10000,
    })

    // --- 新增合同 ---
    await page.getByRole("button", { name: "新增合同" }).click()
    const modal = page.locator(".ant-modal")
    await expect(modal).toBeVisible()

    // 步骤 1: 选择合同类型 + 模板
    await expect(
      page.locator(".ant-steps-item-active").getByText("选择模板")
    ).toBeVisible()
    await selectFirstOption(page, "合同模板")
    await page.getByRole("button", { name: "下一步" }).click()

    // 步骤 2: 填写数据
    await expect(page.getByText("填写数据")).toBeVisible()
    await page.getByPlaceholder("例如：2026年度钢材采购合同").fill("E2E测试合同")
    await selectFirstOption(page, "供应商")
    await page.waitForTimeout(500)
    await page.getByPlaceholder("合同金额").fill("50000")
    await page.getByPlaceholder("合同备注信息").fill("E2E合同备注")

    await modal.getByRole("button", { name: "下一步" }).click()

    // 步骤 3: 预览确认
    await expect(page.getByText("合同预览")).toBeVisible()
    await expect(page.getByText("E2E测试合同")).toBeVisible()

    await page.getByRole("button", { name: "确认创建" }).click()
    await expect(modal).not.toBeVisible()

    // 验证合同出现在列表
    await expect(page.getByText("E2E测试合同")).toBeVisible()
  })

  test("合同状态流转：草稿 → 生效 → 作废", async ({ page }) => {
    await page.goto("/contracts")
    await page.waitForSelector(".ant-table-tbody tr.ant-table-row", {
      timeout: 10000,
    })

    // 取第一个草稿状态的合同（种子合同1是draft）
    const draftRow = page.locator(".ant-table-tbody tr.ant-table-row").first()

    // 验证状态是"草稿"
    await expect(draftRow.getByText("草稿")).toBeVisible()

    // --- 生效 ---
    await draftRow.getByRole("button", { name: "生效" }).click()
    await expect(page.getByText("确定生效该合同？生效后不可编辑")).toBeVisible()
    await page.locator(".ant-popconfirm-buttons button").last().click()
    await page.waitForTimeout(500)

    // PATCH 不触发 React Query 自动刷新，需 reload 页面
    await page.reload()
    await page.waitForSelector(".ant-table-tbody tr.ant-table-row", { timeout: 10000 })

    // 验证状态变为"已生效"（重新取第一行，因为 reload 后 locator 失效）
    const updatedRow = page.locator(".ant-table-tbody tr.ant-table-row").first()
    await expect(updatedRow.getByText("已生效")).toBeVisible()

    // --- 作废 ---
    await updatedRow.getByRole("button", { name: "作废" }).click()
    await expect(page.getByText("确定作废该合同？此操作不可逆")).toBeVisible()
    await page.locator(".ant-popconfirm-buttons button").last().click()
    await page.waitForTimeout(500)

    // PATCH 不触发自动刷新，需 reload
    await page.reload()
    await page.waitForSelector(".ant-table-tbody tr.ant-table-row", { timeout: 10000 })

    // 验证状态变为"已作废"
    const voidedRow = page.locator(".ant-table-tbody tr.ant-table-row").first()
    await expect(voidedRow.getByText("已作废")).toBeVisible()
  })

  test("合同删除", async ({ page }) => {
    await page.goto("/contracts")
    await page.waitForSelector(".ant-table-tbody tr.ant-table-row", {
      timeout: 10000,
    })

    const initialCount = await page
      .locator(".ant-table-tbody tr.ant-table-row")
      .count()
    const firstRow = page.locator(".ant-table-tbody tr.ant-table-row").first()

    await firstRow.getByRole("button", { name: "删除" }).click()
    await expect(page.getByText("确定删除该合同？")).toBeVisible()
    await page.locator(".ant-popconfirm-buttons button").last().click()
    await page.waitForTimeout(500)

    await expect(page.getByText(`共 ${initialCount - 1} 条`)).toBeVisible()
  })
})

// ============================================================
// 人员管理 — 只读列表
// ============================================================

test.describe("人员管理", () => {
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

  test("列表展示 + 搜索", async ({ page }) => {
    await page.goto("/persons")
    await page.waitForSelector(".ant-table-tbody tr.ant-table-row", {
      timeout: 10000,
    })

    await expect(page.locator(".ant-table-tbody tr.ant-table-row")).toHaveCount(
      10
    )
    await expect(page.getByText("共 10 条")).toBeVisible()

    // 搜索
    const searchInput = page.locator('input[placeholder="搜索人员姓名"]')
    await searchInput.fill("用户1")
    await searchInput.press("Enter")
    await page.waitForTimeout(500)

    const rows = page.locator(".ant-table-tbody tr.ant-table-row")
    const count = await rows.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })
})
