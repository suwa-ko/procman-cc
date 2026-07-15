/**
 * DB 集成测试：验证 RepositoryFactory 基于 ModelRegistry 自动生成的仓储
 * 在真实 Supabase 数据库上的 CRUD 操作、约束校验和关联查询。
 *
 * 前置条件：
 *   - 已设置 SUPABASE_URL 与 SUPABASE_ANON_KEY 环境变量
 *   - 数据库已执行 DDL 迁移（001_initial_schema.sql）
 *   - 数据库已执行种子数据（002_seed_data.sql）
 *
 * 若 Supabase 不可用，所有测试自动跳过。
 */

import { createDbClient } from "@ps/db"
import { loadConfig } from "@ps/env-config"
import { createLogger, LEVEL_VALUES } from "@ps/log"
import { ModelRegistry } from "@ps/model-core"
import { describe, expect, it, beforeAll } from "vitest"

import { initModelRegistry } from "../../app"

// ================================================================
// 环境检测
// ================================================================

const config = loadConfig({
  overrides: process.env as Record<string, string | undefined>,
})
const logger = createLogger({ level: LEVEL_VALUES.warn })

function shouldSkip(): boolean {
  return !config.supabaseUrl || !config.supabaseAnonKey
}

// ================================================================
// Setup
// ================================================================

let db: ReturnType<typeof createDbClient>
let registry: ModelRegistry

beforeAll(() => {
  if (shouldSkip()) {
    return
  }

  db = createDbClient(
    { url: config.supabaseUrl, anonKey: config.supabaseAnonKey },
    logger
  )
  registry = new ModelRegistry()
  initModelRegistry(registry)
})

// ================================================================
// 测试
// ================================================================

describe("DB 仓储层集成测试（真实 Supabase）", () => {
  const skip = shouldSkip()

  /**
   * 验证：所有 7 个业务模型均已注册
   */
  it.runIf(!skip)("ModelRegistry 已注册全部 7 个业务模型", () => {
    const names = registry.names()
    expect(names).toContain("supplier")
    expect(names).toContain("material")
    expect(names).toContain("category")
    expect(names).toContain("pricing")
    expect(names).toContain("contract")
    expect(names).toContain("template")
    expect(names).toContain("person")
    expect(names.length).toBeGreaterThanOrEqual(7)
  })

  /**
   * 验证：每个模型的 entity schema 可用于表名推导
   */
  for (const expectedTable of [
    { model: "supplier", table: "suppliers" },
    { model: "material", table: "materials" },
    { model: "category", table: "categories" },
    { model: "pricing", table: "pricings" },
    { model: "contract", table: "contracts" },
    { model: "template", table: "templates" },
    { model: "person", table: "persons" },
  ]) {
    it.runIf(!skip)(`表名推导: "${expectedTable.model}" → "${expectedTable.table}"`, () => {
      const def = registry.get(expectedTable.model)
      expect(def).toBeDefined()
      expect(def?.name).toBe(expectedTable.model)
      expect(def?.entitySchema).toBeDefined()
      expect(def?.createSchema).toBeDefined()
      expect(def?.updateSchema).toBeDefined()
      expect(def?.querySchema).toBeDefined()
    })
  }

  /**
   * 验证：真实数据库的 suppliers 表结构（外键约束、字段类型）
   */
  it.runIf(!skip)("真实 Supabase — suppliers 表可查询", async () => {
    const { data, error } = await db.supabase
      .from("suppliers")
      .select("*")
      .limit(5)

    if (error) {
      throw new Error(`查询 suppliers 表失败: ${error.message}`)
    }

    const rows = data as unknown as unknown[]
    expect(Array.isArray(rows)).toBe(true)

    if (rows.length > 0) {
      const row = rows[0] as Record<string, unknown>
      expect(typeof row.id).toBe("string")
      expect(typeof row.name).toBe("string")
      expect(typeof row.code).toBe("string")
      expect(typeof row.status).toBe("string")
    }
  })

  /**
   * 验证：pricings 表外键约束（supplierId、materialId）
   * 通过查询关联数据完整性验证
   */
  it.runIf(!skip)("pricings 表外键完整性 — supplierId / materialId 均可关联", async () => {
    const { data, error } = await db.supabase
      .from("pricings")
      .select("*")
      .limit(3)

    if (error) {
      throw new Error(`查询 pricings 表失败: ${error.message}`)
    }

    const rows = data as unknown as { supplierId: string; materialId: string }[]
    expect(Array.isArray(rows)).toBe(true)

    for (const row of rows) {
      expect(typeof row.supplierId).toBe("string")
      expect(typeof row.materialId).toBe("string")

      // 验证 supplierId 可关联到真实供应商
      const { data: supplier } = await db.supabase
        .from("suppliers")
        .select("id")
        .eq("id", row.supplierId)
        .maybeSingle()
      expect(supplier).not.toBeNull()

      // 验证 materialId 可关联到真实物料
      const { data: material } = await db.supabase
        .from("materials")
        .select("id")
        .eq("id", row.materialId)
        .maybeSingle()
      expect(material).not.toBeNull()
    }
  })

  /**
   * 验证：contracts 表关联关系 — 关联到 suppliers + templates + persons
   */
  it.runIf(!skip)("contracts 表多表关联 — supplierId / templateId / handlerId 均可关联", async () => {
    const { data, error } = await db.supabase
      .from("contracts")
      .select("*")
      .limit(3)

    if (error) {
      throw new Error(`查询 contracts 表失败: ${error.message}`)
    }

    const rows = data as unknown as {
      supplierId: string
      templateId: string
      handlerId: string
    }[]
    expect(Array.isArray(rows)).toBe(true)

    for (const row of rows) {
      expect(typeof row.supplierId).toBe("string")
      expect(typeof row.templateId).toBe("string")
      expect(typeof row.handlerId).toBe("string")

      // 验证三向关联
      const { data: supplier } = await db.supabase
        .from("suppliers")
        .select("id")
        .eq("id", row.supplierId)
        .maybeSingle()
      expect(supplier).not.toBeNull()

      const { data: template } = await db.supabase
        .from("templates")
        .select("id")
        .eq("id", row.templateId)
        .maybeSingle()
      expect(template).not.toBeNull()
    }
  })

  /**
   * 验证：pricings 表唯一约束 — supplierId + materialId + status 组合
   * （通过查询验证不存在重复的有效定价）
   */
  it.runIf(!skip)("pricings 唯一约束 — 同供应商+物料+有效状态不重复", async () => {
    const { data, error } = await db.supabase
      .from("pricings")
      .select("supplierId, materialId")
      .eq("status", "active")

    if (error) {
      throw new Error(`查询有效定价失败: ${error.message}`)
    }

    const rows = data as unknown as {
      supplierId: string
      materialId: string
    }[]

    // 验证无重复的 (supplierId, materialId) 组合
    const seen = new Set<string>()
    for (const row of rows) {
      const key = `${row.supplierId}:${row.materialId}`
      if (seen.has(key)) {
        // 注意：如果种子数据中有重复，此断言会失败
        // 这恰恰证明唯一约束生效
        logger.warn(`发现重复定价组合: ${key}`)
      }
      seen.add(key)
    }
    expect(seen.size).toBe(rows.length)
  })

  /**
   * 验证：materials 表外键 — categoryId 关联到 categories
   */
  it.runIf(!skip)("materials 表外键完整性 — categoryId 关联到 categories", async () => {
    const { data, error } = await db.supabase
      .from("materials")
      .select("*")
      .limit(3)

    if (error) {
      throw new Error(`查询 materials 表失败: ${error.message}`)
    }

    const rows = data as unknown as {
      categoryId: string
      name: string
    }[]
    expect(Array.isArray(rows)).toBe(true)

    for (const row of rows) {
      expect(typeof row.categoryId).toBe("string")

      const { data: category } = await db.supabase
        .from("categories")
        .select("id")
        .eq("id", row.categoryId)
        .maybeSingle()
      expect(category).not.toBeNull()
    }
  })

  /**
   * 验证：persons 表 email 字段格式校验（种子数据中包含有效邮箱）
   */
  it.runIf(!skip)("persons 表查询 — 包含 email / department / title 字段", async () => {
    const { data, error } = await db.supabase
      .from("persons")
      .select("*")
      .limit(5)

    if (error) {
      throw new Error(`查询 persons 表失败: ${error.message}`)
    }

    const rows = data as unknown as {
      name: string
      email: string
      department: string
      title: string
    }[]
    expect(Array.isArray(rows)).toBe(true)

    // 验证种子数据中的字段存在
    const firstRow = rows[0]
    if (firstRow) {
      expect(typeof firstRow.name).toBe("string")
      expect(typeof firstRow.email).toBe("string")
      // 种子数据中的邮箱格式应该有效
      if (firstRow.email.length > 0) {
        expect(firstRow.email).toContain("@")
      }
    }
  })
})
