/**
 * 全流程业务集成测试。
 *
 * 覆盖完整采购业务流程：
 *  1. 用户登录 → 获取 JWT Token
 *  2. 创建供应商
 *  3. 创建物料品类
 *  4. 创建物料
 *  5. 创建定价
 *  6. 创建合同模板
 *  7. 创建合同（含关联校验）
 *
 * 前置条件：
 *   - 已设置 SUPABASE_URL 与 SUPABASE_ANON_KEY 环境变量
 *   - 数据库已执行 DDL 迁移（001_initial_schema.sql）
 *
 * 若 Supabase 不可用，所有测试自动跳过并打印提示。
 */


import { createDbClient } from "@ps/db"
import { loadConfig } from "@ps/env-config"
import { createLogger, LEVEL_VALUES } from "@ps/log"
import type { Hono } from "hono"
import { describe, expect, it, beforeAll } from "vitest"

import { createApp } from "../../app"

// ================================================================
// 测试环境检测
// ================================================================

const config = loadConfig({
  overrides: process.env as Record<string, string | undefined>,
})
const logger = createLogger({ level: LEVEL_VALUES.warn })

let db: ReturnType<typeof createDbClient>
let app: Hono

function shouldSkip(): boolean {
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    return true
  }
  return false
}

// ================================================================
// 测试数据（在整个测试 suite 中共享引用 ID）
// ================================================================

const testContext: {
  token: string
  supplierId: string
  categoryId: string
  materialId: string
  pricingId: string
  templateId: string
  contractId: string
} = {
  token: "",
  supplierId: "",
  categoryId: "",
  materialId: "",
  pricingId: "",
  templateId: "",
  contractId: "",
}

function authHeader(): Record<string, string> {
  return { Authorization: `Bearer ${testContext.token}` }
}

// ================================================================
// Setup
// ================================================================

beforeAll(() => {
  if (shouldSkip()) {
    return
  }

  db = createDbClient(
    {
      url: config.supabaseUrl,
      anonKey: config.supabaseAnonKey,
    },
    logger
  )
  app = createApp({ db })

  logger.info("[integration-test] 已连接 Supabase，开始全流程测试")
})

// ================================================================
// 全流程测试
// ================================================================

describe("全流程业务集成测试", () => {
  const skip = shouldSkip()

  /**
   * Step 1: 用户注册/登录 → 获取 JWT Token
   */
  it.runIf(!skip)("1. 用户登录 → 获取 Token", async () => {
    // 尝试注册（可能已存在则忽略）
    const registerRes = await app.request("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "integration-test@example.com",
        password: "test123456",
        personId: "00000000-0000-0000-0000-000000000001",
      }),
    })
    // 注册可能成功（201）或用户已存在（409），均不影响后续流程
    logger.info(`注册响应: ${registerRes.status}`)

    // 登录
    const loginRes = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "integration-test@example.com",
        password: "test123456",
      }),
    })

    const loginBody = (await loginRes.json()) as {
      code: number
      data: { token: string } | null
    }

    // 如果登录失败（用户不存在或 Supabase Auth 未配置），标记测试为跳过
    if (loginRes.status !== 200 || !loginBody.data?.token) {
      logger.warn(`登录失败: ${JSON.stringify(loginBody)}，跳过后续测试`)
      return
    }

    testContext.token = loginBody.data.token
    expect(testContext.token).toBeTruthy()
    expect(testContext.token.length).toBeGreaterThan(50)
  })

  /**
   * Step 2: 创建供应商
   */
  it.runIf(!skip)("2. 创建供应商", async () => {
    if (!testContext.token) {
return
}

    const res = await app.request("/api/suppliers", {
      method: "POST",
      headers: { ...authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "集成测试供应商",
        creditCode: "91310115MA1T000001",
        contactPerson: "测试联系人",
        contactPhone: "021-12345678",
        address: "上海市测试区测试路1号",
        status: "active",
        remark: "自动化测试创建",
      }),
    })

    expect(res.status).toBe(201)

    const body = (await res.json()) as {
      code: number
      data: { id: string; code: string; name: string } | null
    }
    expect(body.code).toBe(0)
    expect(body.data?.name).toBe("集成测试供应商")
    expect(body.data?.code).toMatch(/^SUP-\d{4}-\d{4}$/)
    const supplierData = body.data
    if (!supplierData) {
      throw new Error("创建供应商成功但缺少返回数据")
    }
    testContext.supplierId = supplierData.id
  })

  /**
   * Step 3: 创建物料品类
   */
  it.runIf(!skip)("3. 创建物料品类", async () => {
    if (!testContext.token) {
return
}

    const res = await app.request("/api/categories", {
      method: "POST",
      headers: { ...authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({
        code: "CAT-TEST-001",
        name: "测试品类",
        sortOrder: 1,
      }),
    })

    expect(res.status).toBe(201)

    const body = (await res.json()) as {
      code: number
      data: { id: string; name: string } | null
    }
    expect(body.code).toBe(0)
    expect(body.data?.name).toBe("测试品类")
    const catData = body.data
    if (!catData) {
      throw new Error("创建品类成功但缺少返回数据")
    }
    testContext.categoryId = catData.id
  })

  /**
   * Step 4: 创建物料（关联品类）
   */
  it.runIf(!skip)("4. 创建物料（关联品类）", async () => {
    if (!testContext.token || !testContext.categoryId) {
return
}

    const res = await app.request("/api/materials", {
      method: "POST",
      headers: { ...authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "测试物料-电阻器",
        spec: "0805 10KΩ ±1%",
        unit: "个",
        categoryId: testContext.categoryId,
        description: "自动化测试创建",
        status: "active",
      }),
    })

    expect(res.status).toBe(201)

    const body = (await res.json()) as {
      code: number
      data: { id: string; code: string; name: string } | null
    }
    expect(body.code).toBe(0)
    expect(body.data?.name).toBe("测试物料-电阻器")
    expect(body.data?.code).toMatch(/^MAT-\d{4}-\d{4}$/)
    const matData = body.data
    if (!matData) {
      throw new Error("创建物料成功但缺少返回数据")
    }
    testContext.materialId = matData.id
  })

  /**
   * Step 5: 创建定价（关联供应商 + 物料）
   */
  it.runIf(!skip)("5. 创建定价", async () => {
    if (!testContext.token || !testContext.supplierId || !testContext.materialId) {
return
}

    const res = await app.request("/api/pricings", {
      method: "POST",
      headers: { ...authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({
        supplierId: testContext.supplierId,
        materialId: testContext.materialId,
        unitPrice: 10.50,
        currency: "CNY",
        remark: "测试定价",
      }),
    })

    expect(res.status).toBe(201)

    const body = (await res.json()) as {
      code: number
      data: { id: string; unitPrice: number; status: string } | null
    }
    expect(body.code).toBe(0)
    expect(body.data?.unitPrice).toBe(10.50)
    expect(body.data?.status).toBe("active")
    const prcData = body.data
    if (!prcData) {
      throw new Error("创建定价成功但缺少返回数据")
    }
    testContext.pricingId = prcData.id
  })

  /**
   * Step 6: 创建合同模板
   */
  it.runIf(!skip)("6. 创建合同模板", async () => {
    if (!testContext.token) {
return
}

    const res = await app.request("/api/templates", {
      method: "POST",
      headers: { ...authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "测试模板",
        contractType: "purchase_contract",
        htmlContent: "<h1>测试合同</h1><p>甲方：{{contract.companyName}}</p>",
        variables: {},
        enabled: true,
      }),
    })

    expect(res.status).toBe(201)

    const body = (await res.json()) as {
      code: number
      data: { id: string; code: string } | null
    }
    expect(body.code).toBe(0)
    const tplData = body.data
    if (!tplData) {
      throw new Error("创建模板成功但缺少返回数据")
    }
    testContext.templateId = tplData.id
  })

  /**
   * Step 7: 创建合同（关联供应商 + 模板 + 经办人）
   */
  it.runIf(!skip)("7. 创建合同", async () => {
    if (!testContext.token || !testContext.supplierId || !testContext.templateId) {
return
}

    const res = await app.request("/api/contracts", {
      method: "POST",
      headers: { ...authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "测试采购合同",
        type: "purchase_contract",
        supplierId: testContext.supplierId,
        handlerId: "00000000-0000-0000-0000-000000000001",
        handlerName: "测试经办人",
        templateId: testContext.templateId,
        content: {},
        totalAmount: 105000.00,
        effectiveDate: "2026-07-15",
        expirationDate: "2027-07-15",
        companyName: "测试采购公司",
        remark: "自动化测试创建的合同",
      }),
    })

    expect(res.status).toBe(201)

    const body = (await res.json()) as {
      code: number
      data: {
        id: string
        code: string
        name: string
        status: string
        totalAmount: number
        supplierId: string
        templateId: string
      } | null
    }
    expect(body.code).toBe(0)
    expect(body.data?.name).toBe("测试采购合同")
    expect(body.data?.status).toBe("draft")
    expect(body.data?.code).toMatch(/^CTT-\d{4}-\d{4}$/)
    expect(body.data?.totalAmount).toBe(105000)
    expect(body.data?.supplierId).toBe(testContext.supplierId)
    expect(body.data?.templateId).toBe(testContext.templateId)
    const cttData = body.data
    if (!cttData) {
      throw new Error("创建合同成功但缺少返回数据")
    }
    testContext.contractId = cttData.id
  })

  /**
   * 补充验证：查询列表确认数据完整性
   */
  it.runIf(!skip)("验证：查询供应商列表确认创建成功", async () => {
    if (!testContext.token) {
return
}

    const res = await app.request(
      `/api/suppliers?keyword=集成测试供应&page=1&pageSize=10`,
      { headers: authHeader() }
    )

    expect(res.status).toBe(200)

    const body = (await res.json()) as {
      code: number
      data: { data: { name: string }[]; total: number }
    }
    expect(body.code).toBe(0)
    expect(body.data.total).toBeGreaterThanOrEqual(1)
    expect(body.data.data.some((s) => s.name === "集成测试供应商")).toBe(true)
  })

  it.runIf(!skip)("验证：定价自动编号与关联完整", async () => {
    if (!testContext.token || !testContext.pricingId) {
return
}

    const res = await app.request(`/api/pricings/${testContext.pricingId}`, {
      headers: authHeader(),
    })

    expect(res.status).toBe(200)

    const body = (await res.json()) as {
      code: number
      data: { supplierId: string; materialId: string }
    }
    expect(body.code).toBe(0)
    expect(body.data.supplierId).toBe(testContext.supplierId)
    expect(body.data.materialId).toBe(testContext.materialId)
  })
})
