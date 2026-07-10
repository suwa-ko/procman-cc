import { describe, expect, it } from "vitest"

import { BaseRepository } from "../core/base-repository"
import { createMockDbClient } from "../core/mock-client"
import type { BaseEntity, DbClient } from "../core/types"

// ============================================================
// 测试用实体与工具
// ============================================================

interface TestEntity extends BaseEntity {
  name: string
  age: number
}

const TABLE = "test"

function makeClient(
  seed?: Record<string, Record<string, unknown>[]>
): DbClient {
  return createMockDbClient(seed)
}

function makeRepo(client: DbClient): BaseRepository<TestEntity> {
  return new BaseRepository<TestEntity>(client, TABLE)
}

// ============================================================
// CRUD 测试（MockDbClient + BaseRepository）
// ============================================================

describe("MockDbClient + BaseRepository", () => {
  describe("insert", () => {
    it("插入记录并返回完整实体（含 id/createdAt/updatedAt）", async () => {
      const repo = makeRepo(makeClient())
      const result = await repo.insert({ name: "张三", age: 20 })

      expect(result.id).toBeTruthy()
      expect(result.name).toBe("张三")
      expect(result.age).toBe(20)
      expect(result.createdAt).toBeTruthy()
      expect(result.updatedAt).toBeTruthy()
    })

    it("插入后可通过 findById 查到", async () => {
      const client = makeClient()
      const repo = makeRepo(client)
      const inserted = await repo.insert({ name: "李四", age: 25 })

      const found = await repo.findById(inserted.id)
      expect(found).not.toBeNull()
      expect(found?.name).toBe("李四")
    })
  })

  describe("findById", () => {
    it("查到记录时应返回实体", async () => {
      const client = makeClient()
      const repo = makeRepo(client)
      const inserted = await repo.insert({ name: "张三", age: 20 })

      const result = await repo.findById(inserted.id)
      expect(result).toEqual(inserted)
    })

    it("未查到记录时应返回 null", async () => {
      const repo = makeRepo(makeClient())
      const result = await repo.findById("不存在")
      expect(result).toBeNull()
    })
  })

  describe("findAll", () => {
    it("应返回全部记录", async () => {
      const client = makeClient()
      const repo = makeRepo(client)
      await repo.insert({ name: "A", age: 10 })
      await repo.insert({ name: "B", age: 20 })

      const all = await repo.findAll()
      expect(all).toHaveLength(2)
    })

    it("空表应返回空数组", async () => {
      const repo = makeRepo(makeClient())
      const all = await repo.findAll()
      expect(all).toEqual([])
    })
  })

  describe("update", () => {
    it("更新记录并返回更新后实体", async () => {
      const client = makeClient()
      const repo = makeRepo(client)
      const inserted = await repo.insert({ name: "张三", age: 20 })

      const updated = await repo.update(inserted.id, { name: "张三改名" })
      expect(updated?.name).toBe("张三改名")
      expect(updated?.age).toBe(20)
    })

    it("更新不存在的记录应返回 null", async () => {
      const repo = makeRepo(makeClient())
      const result = await repo.update("不存在", { name: "x" })
      expect(result).toBeNull()
    })

    it("updatedAt 应在更新时刷新", async () => {
      const client = makeClient()
      const repo = makeRepo(client)
      const inserted = await repo.insert({ name: "张三", age: 20 })
      const originalUpdatedAt = inserted.updatedAt

      // 等待 1ms 确保时间戳变化
      await new Promise((r) => setTimeout(r, 1))
      const updated = await repo.update(inserted.id, { name: "改名" })
      expect(updated?.updatedAt).not.toBe(originalUpdatedAt)
    })
  })

  describe("delete", () => {
    it("删除记录应返回 true", async () => {
      const client = makeClient()
      const repo = makeRepo(client)
      const inserted = await repo.insert({ name: "张三", age: 20 })

      const result = await repo.delete(inserted.id)
      expect(result).toBe(true)

      const found = await repo.findById(inserted.id)
      expect(found).toBeNull()
    })

    it("删除不存在的记录也应返回 true", async () => {
      const repo = makeRepo(makeClient())
      const result = await repo.delete("不存在")
      // BaseRepository.delete 不校验存在性，始终返回 true
      expect(result).toBe(true)
    })
  })

  // ----------------------------------------------------------
  // 查询能力
  // ----------------------------------------------------------

  describe("findMany", () => {
    it("无参数时应返回全部", async () => {
      const client = makeClient()
      const repo = makeRepo(client)
      await repo.insert({ name: "A", age: 10 })
      await repo.insert({ name: "B", age: 20 })

      const result = await repo.findMany({})
      expect(result).toHaveLength(2)
    })

    it("eq 过滤应返回匹配记录", async () => {
      const client = makeClient()
      const repo = makeRepo(client)
      await repo.insert({ name: "张三", age: 18 })
      await repo.insert({ name: "张三", age: 25 })
      await repo.insert({ name: "李四", age: 30 })

      const result = await repo.findMany({
        filters: [{ column: "name", operator: "eq", value: "张三" }],
      })
      expect(result).toHaveLength(2)
    })

    it("gte 过滤应返回 >= value 的记录", async () => {
      const client = makeClient()
      const repo = makeRepo(client)
      await repo.insert({ name: "A", age: 10 })
      await repo.insert({ name: "B", age: 20 })
      await repo.insert({ name: "C", age: 30 })

      const result = await repo.findMany({
        filters: [{ column: "age", operator: "gte", value: 20 }],
      })
      expect(result).toHaveLength(2)
    })

    it("排序应返回有序结果", async () => {
      const client = makeClient()
      const repo = makeRepo(client)
      await repo.insert({ name: "B", age: 30 })
      await repo.insert({ name: "A", age: 10 })
      await repo.insert({ name: "C", age: 20 })

      const result = await repo.findMany({
        sorts: [{ column: "age", ascending: true }],
      })
      expect(result[0]?.age).toBe(10)
      expect(result[1]?.age).toBe(20)
      expect(result[2]?.age).toBe(30)
    })

    it("降序排序应返回逆序结果", async () => {
      const client = makeClient()
      const repo = makeRepo(client)
      await repo.insert({ name: "A", age: 10 })
      await repo.insert({ name: "B", age: 30 })
      await repo.insert({ name: "C", age: 20 })

      const result = await repo.findMany({
        sorts: [{ column: "age", ascending: false }],
      })
      expect(result[0]?.age).toBe(30)
      expect(result[1]?.age).toBe(20)
      expect(result[2]?.age).toBe(10)
    })

    it("分页应返回指定页数据", async () => {
      const client = makeClient()
      const repo = makeRepo(client)
      for (let i = 1; i <= 25; i++) {
        await repo.insert({ name: `U${i}`, age: i })
      }

      const page1 = await repo.findMany({
        pagination: { page: 1, pageSize: 10 },
      })
      expect(page1).toHaveLength(10)

      const page3 = await repo.findMany({
        pagination: { page: 3, pageSize: 10 },
      })
      expect(page3).toHaveLength(5)
    })

    it("复合条件（过滤 + 排序 + 分页）应正确执行", async () => {
      const client = makeClient()
      const repo = makeRepo(client)
      for (let i = 1; i <= 15; i++) {
        await repo.insert({ name: `U${i}`, age: i })
      }

      const result = await repo.findMany({
        filters: [{ column: "age", operator: "gte", value: 5 }],
        sorts: [{ column: "age", ascending: false }],
        pagination: { page: 1, pageSize: 3 },
      })
      expect(result).toHaveLength(3)
      expect(result[0]?.age).toBe(15)
    })
  })

  describe("count", () => {
    it("空表应返回 0", async () => {
      const repo = makeRepo(makeClient())
      const result = await repo.count()
      expect(result).toBe(0)
    })

    it("应返回总记录数", async () => {
      const client = makeClient()
      const repo = makeRepo(client)
      await repo.insert({ name: "A", age: 10 })
      await repo.insert({ name: "B", age: 20 })
      await repo.insert({ name: "C", age: 30 })

      const result = await repo.count()
      expect(result).toBe(3)
    })

    it("带过滤条件的计数应正确", async () => {
      const client = makeClient()
      const repo = makeRepo(client)
      await repo.insert({ name: "张三", age: 18 })
      await repo.insert({ name: "张三", age: 25 })
      await repo.insert({ name: "李四", age: 30 })

      const result = await repo.count([
        { column: "name", operator: "eq", value: "张三" },
      ])
      expect(result).toBe(2)
    })
  })

  describe("findPaginated", () => {
    it("应返回分页结果含 total/totalPages", async () => {
      const client = makeClient()
      const repo = makeRepo(client)
      for (let i = 1; i <= 25; i++) {
        await repo.insert({ name: `U${i}`, age: i })
      }

      const result = await repo.findPaginated({
        pagination: { page: 2, pageSize: 10 },
      })
      expect(result.data).toHaveLength(10)
      expect(result.total).toBe(25)
      expect(result.page).toBe(2)
      expect(result.totalPages).toBe(3)
    })

    it("默认分页参数应有效", async () => {
      const client = makeClient()
      const repo = makeRepo(client)
      for (let i = 1; i <= 5; i++) {
        await repo.insert({ name: `U${i}`, age: i })
      }

      const result = await repo.findPaginated({})
      expect(result.data).toHaveLength(5)
      expect(result.total).toBe(5)
    })
  })
})

// ============================================================
// MockDbClient 独立测试（不通过 BaseRepository）
// ============================================================

describe("MockDbClient", () => {
  describe("createMockDbClient", () => {
    it("seed data 应被正确初始化", () => {
      const seed = {
        products: [
          { id: "p1", name: "Product A", createdAt: "", updatedAt: "" },
          { id: "p2", name: "Product B", createdAt: "", updatedAt: "" },
        ],
      }
      const client = createMockDbClient(seed)
      expect(client.supabase).toBeDefined()
      expect(client.logger).toBeDefined()

      // 验证 from 方法可用（不 throw）
      expect(() => client.supabase.from("products")).not.toThrow()
    })

    it("from 返回的链应可被 await（空数据）", async () => {
      const client = createMockDbClient()
      const result = await client.supabase.from("empty").select("*")
      expect(result.error).toBeNull()
      expect(result.data).toEqual([])
    })
  })

  describe("查询链（直接使用 supabase.from）", () => {
    it("insert → select → single 应返回插入的记录", async () => {
      const client = createMockDbClient()
      const result = await client.supabase
        .from("users")
        .insert({ name: "Alice" })
        .select()
        .single()

      expect(result.error).toBeNull()
      expect((result.data as Record<string, unknown>)?.name).toBe("Alice")
      expect((result.data as Record<string, unknown>)?.id).toBeTruthy()
    })

    it("update → eq → select → maybeSingle 应返回更新后的记录", async () => {
      const client = createMockDbClient()
      const inserted = await client.supabase
        .from("users")
        .insert({ name: "Bob", age: 25 })
        .select()
        .single()

      const updated = await client.supabase
        .from("users")
        .update({ age: 26 })
        .eq("id", (inserted.data as Record<string, unknown>)?.id)
        .select()
        .maybeSingle()

      expect((updated.data as Record<string, unknown>)?.age).toBe(26)
    })

    it("delete → eq 应删除记录", async () => {
      const client = createMockDbClient()
      const inserted = await client.supabase
        .from("users")
        .insert({ name: "Charlie" })
        .select()
        .single()

      await client.supabase
        .from("users")
        .delete()
        .eq("id", (inserted.data as Record<string, unknown>)?.id)

      const found = await client.supabase
        .from("users")
        .select("*")
        .eq("id", (inserted.data as Record<string, unknown>)?.id)
      expect(found.data).toHaveLength(0)
    })
  })
})
