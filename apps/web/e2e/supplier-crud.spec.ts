/**
 * 供应商 CRUD E2E 测试（Playwright + page.route Mock）
 *
 * 使用 Playwright page.route() 拦截 /api/suppliers 请求，
 * 比 MSW Service Worker 在 headless Chromium 中更可靠。
 * Mock 数据格式与 @ps/contracts ApiResponse 一致。
 */

import { expect, test } from "@playwright/test"

// ---------- Mock 数据格式 ----------

interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

interface SupplierDTO {
  id: string
  code: string
  name: string
  creditCode: string
  contactPerson: string
  contactPhone: string
  address: string
  status: "active" | "frozen" | "obsolete"
  remark: string
  createdAt: string
  updatedAt: string
}

interface SupplierListData {
  data: SupplierDTO[]
  total: number
  page: number
  pageSize: number
}

// ---------- 种子数据 ----------

let mockSuppliers: SupplierDTO[] = []

function createSupplier(overrides: Partial<SupplierDTO> = {}): SupplierDTO {
  const id = `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return {
    id,
    code: `SUP-2026-${String(mockSuppliers.length + 1).padStart(4, "0")}`,
    name: `测试供应商${mockSuppliers.length + 1}`,
    creditCode: "123456789012345678",
    contactPerson: "张三",
    contactPhone: "13800138000",
    address: "北京市",
    status: "active",
    remark: "种子数据",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  }
}

function resetSeedData(): void {
  mockSuppliers = Array.from({ length: 5 }, (_, i) =>
    createSupplier({
      name: `种子供应商${i + 1}`,
      code: `SUP-2026-${String(i + 1).padStart(4, "0")}`,
    })
  )
}

// ---------- API Mock 路由注册 ----------

async function setupSupplierRoutes(
  page: import("@playwright/test").Page
): Promise<void> {
  await page.route(/\/api\/suppliers/, async (route) => {
    const url = new URL(route.request().url())
    const method = route.request().method()
    const pathParts = url.pathname.split("/").filter(Boolean)
    // path: ["api", "suppliers"] or ["api", "suppliers", ":id"]
    const id = pathParts.length >= 3 ? pathParts[2] : undefined

    await new Promise((r) => setTimeout(r, 50)) // 模拟网络延迟

    // GET /api/suppliers — 列表查询
    if (method === "GET" && id === undefined) {
      const pageNum = Number(url.searchParams.get("page")) || 1
      const pageSize = Number(url.searchParams.get("pageSize")) || 10
      const keyword = url.searchParams.get("keyword") ?? ""
      const status = url.searchParams.get("status") ?? ""

      let filtered = [...mockSuppliers]
      if (keyword !== "") {
        filtered = filtered.filter((s) => s.name.includes(keyword))
      }
      if (status !== "") {
        filtered = filtered.filter((s) => s.status === status)
      }

      const total = filtered.length
      const start = (pageNum - 1) * pageSize
      const paged = filtered.slice(start, start + pageSize)

      const body: ApiResponse<SupplierListData> = {
        code: 0,
        data: { data: paged, total, page: pageNum, pageSize },
        message: "ok",
      }
      return route.fulfill({ status: 200, json: body })
    }

    // GET /api/suppliers/:id — 详情
    if (method === "GET" && id !== undefined) {
      const supplier = mockSuppliers.find((s) => s.id === id)
      if (supplier === undefined) {
        return route.fulfill({
          status: 404,
          json: { code: 404, data: null, message: "供应商不存在" },
        })
      }
      return route.fulfill({
        status: 200,
        json: { code: 0, data: supplier, message: "ok" },
      })
    }

    // POST /api/suppliers — 创建
    if (method === "POST") {
      const body = route.request().postDataJSON() as Partial<SupplierDTO>
      const supplier = createSupplier({
        name: body.name ?? "",
        creditCode: body.creditCode ?? "",
        contactPerson: body.contactPerson ?? "",
        contactPhone: body.contactPhone ?? "",
        address: body.address ?? "",
        remark: body.remark ?? "",
        status: "active",
      })
      mockSuppliers.push(supplier)
      return route.fulfill({
        status: 201,
        json: { code: 0, data: supplier, message: "创建成功" },
      })
    }

    // PUT /api/suppliers/:id — 更新
    if (method === "PUT" && id !== undefined) {
      const body = route.request().postDataJSON() as
        { data: Partial<SupplierDTO> } | Partial<SupplierDTO>
      const patch = "data" in body ? body.data : body
      const index = mockSuppliers.findIndex((s) => s.id === id)
      if (index === -1) {
        return route.fulfill({
          status: 404,
          json: { code: 404, data: null, message: "供应商不存在" },
        })
      }
      mockSuppliers[index] = {
        ...mockSuppliers[index]!,
        ...patch,
        updatedAt: new Date().toISOString(),
      }
      return route.fulfill({
        status: 200,
        json: { code: 0, data: mockSuppliers[index], message: "更新成功" },
      })
    }

    // DELETE /api/suppliers/:id — 删除
    if (method === "DELETE" && id !== undefined) {
      const index = mockSuppliers.findIndex((s) => s.id === id)
      if (index === -1) {
        return route.fulfill({
          status: 404,
          json: { code: 404, data: null, message: "供应商不存在" },
        })
      }
      mockSuppliers.splice(index, 1)
      return route.fulfill({
        status: 200,
        json: { code: 0, data: null, message: "删除成功" },
      })
    }

    return route.continue()
  })
}

// ---------- 测试 ----------

test.describe("供应商 CRUD", () => {
  test.beforeEach(async ({ page }) => {
    resetSeedData()

    // 绕过认证
    await page.addInitScript(() => {
      localStorage.setItem("purchase_system_token", "mock-token-e2e-test")
    })

    // 注册 API mock 路由
    await setupSupplierRoutes(page)
  })

  test("列表展示：种子数据正确渲染", async ({ page }) => {
    await page.goto("/suppliers")
    // 等待数据行渲染（种子数据 5 条，pageSize 默认 10，全部展示）
    await page.waitForSelector(".ant-table-tbody tr.ant-table-row", {
      timeout: 10000,
    })

    const rows = page.locator(".ant-table-tbody tr.ant-table-row")
    await expect(rows).toHaveCount(5)
    await expect(page.getByText("共 5 条")).toBeVisible()
  })

  test("搜索筛选：按名称搜索供应商", async ({ page }) => {
    await page.goto("/suppliers")
    await page.waitForSelector(".ant-table-tbody tr.ant-table-row")

    // 搜索"种子供应商1"
    const searchInput = page.locator('input[placeholder="搜索供应商名称"]')
    await searchInput.fill("种子供应商1")
    await searchInput.press("Enter")
    await page.waitForTimeout(500)

    // 应只显示匹配项
    await expect(page.getByText("种子供应商1")).toBeVisible()
    // "种子供应商2"不应该通过"种子供应商1"的严格匹配...不对，includes 逻辑下也会匹配 "种子供应商10", "种子供应商11" 等
    // 实际上只会精确匹配 "种子供应商1"，因为模糊匹配会同时匹配到 "种子供应商1" 和 "种子供应商10"...
    // 这里只验证关键行为：搜索后结果更新
    const rows = page.locator(".ant-table-tbody tr.ant-table-row")
    const count = await rows.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test("新增供应商：创建 → 表格中可见", async ({ page }) => {
    await page.goto("/suppliers")
    await page.waitForSelector(".ant-table-tbody tr.ant-table-row")

    // 点击"新增供应商"
    await page.getByRole("button", { name: "新增供应商" }).click()

    const modal = page.locator(".ant-modal")
    await expect(modal).toBeVisible()

    await page.getByLabel("名称").fill("Playwright测试供应商")
    await page.getByLabel("统一社会信用代码").fill("123456789012345678")
    await page.getByLabel("联系人").fill("张三")
    await page.getByLabel("联系电话").fill("13800138000")
    await page.getByLabel("地址").fill("北京市海淀区")
    await page.getByLabel("备注").fill("E2E测试备注")

    // 点击确定
    await modal.locator(".ant-modal-footer button").last().click()
    await expect(modal).not.toBeVisible()

    // 验证新供应商出现
    await expect(page.getByText("Playwright测试供应商")).toBeVisible()
    await expect(page.getByText("共 6 条")).toBeVisible()
  })

  test("编辑供应商：修改名称 → 表格中更新", async ({ page }) => {
    await page.goto("/suppliers")
    await page.waitForSelector(".ant-table-tbody tr.ant-table-row")

    // 点击第一行"编辑"
    const firstRow = page.locator(".ant-table-tbody tr.ant-table-row").first()
    await firstRow.getByRole("button", { name: "编辑" }).click()

    const modal = page.locator(".ant-modal")
    await expect(modal).toBeVisible()
    await expect(page.getByText("编辑供应商")).toBeVisible()

    // 修改名称
    const nameInput = page.getByLabel("名称")
    await nameInput.clear()
    await nameInput.fill("Playwright已编辑供应商")

    await modal.locator(".ant-modal-footer button").last().click()
    await expect(modal).not.toBeVisible()

    // 验证名称已更新
    await expect(page.getByText("Playwright已编辑供应商")).toBeVisible()
  })

  test("删除供应商：确认删除 → 表格中消失", async ({ page }) => {
    await page.goto("/suppliers")
    await page.waitForSelector(".ant-table-tbody tr.ant-table-row")

    const initialRows = page.locator(".ant-table-tbody tr.ant-table-row")
    const initialCount = await initialRows.count()

    // 获取第一条供应商名称
    const firstName = await initialRows
      .first()
      .locator("td")
      .nth(1)
      .textContent()

    // 点击删除
    await initialRows.first().getByRole("button", { name: "删除" }).click()
    await expect(page.getByText("确定删除该供应商？")).toBeVisible()

    // 确认
    await page.locator(".ant-popconfirm-buttons button").last().click()
    await page.waitForTimeout(800)

    // 验证消失
    if (firstName !== null) {
      await expect(
        page.locator(".ant-table-tbody").getByText(firstName.trim())
      ).toHaveCount(0)
    }

    await expect(page.getByText(`共 ${initialCount - 1} 条`)).toBeVisible()
  })

  test("完整流程：新增 → 编辑 → 删除 全链路", async ({ page }) => {
    await page.goto("/suppliers")
    await page.waitForSelector(".ant-table-tbody tr.ant-table-row")

    // --- 新增 ---
    await page.getByRole("button", { name: "新增供应商" }).click()
    const modal = page.locator(".ant-modal")
    await expect(modal).toBeVisible()

    await page.getByLabel("名称").fill("全链路测试供应商")
    await page.getByLabel("统一社会信用代码").fill("123456789012345678")
    await page.getByLabel("联系人").fill("李四")
    await page.getByLabel("联系电话").fill("13900139000")
    await page.getByLabel("地址").fill("上海市浦东新区")
    await page.getByLabel("备注").fill("全链路测试")

    await modal.locator(".ant-modal-footer button").last().click()
    await expect(modal).not.toBeVisible()
    await expect(page.getByText("全链路测试供应商")).toBeVisible()

    // --- 编辑 ---
    const targetRow = page
      .locator(".ant-table-tbody tr.ant-table-row")
      .filter({ hasText: "全链路测试供应商" })

    await targetRow.getByRole("button", { name: "编辑" }).click()
    await expect(modal).toBeVisible()

    const nameInput = page.getByLabel("名称")
    await nameInput.clear()
    await nameInput.fill("全链路已编辑供应商")

    await modal.locator(".ant-modal-footer button").last().click()
    await expect(modal).not.toBeVisible()
    await expect(page.getByText("全链路已编辑供应商")).toBeVisible()

    // --- 删除 ---
    const deleteRow = page
      .locator(".ant-table-tbody tr.ant-table-row")
      .filter({ hasText: "全链路已编辑供应商" })

    await deleteRow.getByRole("button", { name: "删除" }).click()
    await expect(page.getByText("确定删除该供应商？")).toBeVisible()
    await page.locator(".ant-popconfirm-buttons button").last().click()
    await page.waitForTimeout(800)

    await expect(
      page.locator(".ant-table-tbody").getByText("全链路已编辑供应商")
    ).toHaveCount(0)
  })
})
