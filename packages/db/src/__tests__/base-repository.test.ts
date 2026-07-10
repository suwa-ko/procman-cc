import type { Logger } from "@ps/log"
import { describe, it, expect } from "vitest"

import { BaseRepository } from "../core/base-repository"
import type {
  BaseEntity,
  DbClient,
  DbQueryChain,
  QueryResult,
} from "../core/types"

// ============================================================
// 测试用类型与 Mock 工具
// ============================================================

/** 测试用实体 */
interface TestEntity extends BaseEntity {
  name: string
  age: number
}

/** mock 查询链配置 */
interface MockChainOptions {
  /** 直接 await 链时的结果（findAll / findMany / delete / count / findPaginated） */
  arrayResult?: QueryResult<unknown[]>
  /** maybeSingle / single 的结果（findById / insert / update） */
  singleResult?: QueryResult<unknown>
}

/** mock 查询链句柄（含调用记录） */
interface MockChainHandle {
  chain: DbQueryChain
  /** 获取指定方法的调用参数列表 */
  getCalls: (method: string) => unknown[][]
}

/** 创建 mock 查询链（记录所有链式方法调用） */
function createMockChain(options: MockChainOptions): MockChainHandle {
  const arrayResult: QueryResult<unknown[]> = options.arrayResult ?? {
    data: null,
    error: null,
  }
  const singleResult: QueryResult<unknown> = options.singleResult ?? {
    data: null,
    error: null,
  }
  const calls: Record<string, unknown[][]> = {}
  const ref: { current: DbQueryChain | null } = { current: null }

  const track = (method: string, args: unknown[]): void => {
    if (!(method in calls)) {
      calls[method] = []
    }
    calls[method].push(args)
  }

  const record =
    (method: string) =>
    (...args: unknown[]): DbQueryChain => {
      track(method, args)
      return ref.current as DbQueryChain
    }

  const chain: Record<string, unknown> = {
    select: record("select"),
    eq: record("eq"),
    neq: record("neq"),
    gt: record("gt"),
    lt: record("lt"),
    gte: record("gte"),
    lte: record("lte"),
    like: record("like"),
    ilike: record("ilike"),
    in: record("in"),
    order: record("order"),
    range: record("range"),
    limit: record("limit"),
    insert: record("insert"),
    update: record("update"),
    delete: record("delete"),
    maybeSingle: () => {
      track("maybeSingle", [])
      return Promise.resolve(singleResult)
    },
    single: () => {
      track("single", [])
      return Promise.resolve(singleResult)
    },
    then: (resolve: (value: QueryResult<unknown[]>) => unknown) =>
      Promise.resolve(arrayResult).then(resolve),
  }

  ref.current = chain as unknown as DbQueryChain

  return {
    chain: ref.current,
    getCalls: (method: string): unknown[][] => calls[method] ?? [],
  }
}

/** 错误日志调用记录 */
interface ErrorCall {
  message: string
  context?: unknown
}

/** 创建 mock DbClient（含错误记录与查询链句柄） */
function createMockClient(options: MockChainOptions): {
  client: DbClient
  errorCalls: ErrorCall[]
  getCalls: (method: string) => unknown[][]
  fromCalls: string[]
} {
  const errorCalls: ErrorCall[] = []
  const logger = {
    error: (message: string, context?: unknown) => {
      errorCalls.push({ message, context })
    },
  } as unknown as Logger
  const handle = createMockChain(options)
  const fromCalls: string[] = []
  const client: DbClient = {
    supabase: {
      from: (table: string): DbQueryChain => {
        fromCalls.push(table)
        return handle.chain
      },
    },
    logger,
  }
  return {
    client,
    errorCalls,
    getCalls: handle.getCalls,
    fromCalls,
  }
}

const TABLE = "test_table"
const NOW = "2026-07-09T00:00:00.000Z"

function makeEntity(id: string, name: string, age: number): TestEntity {
  return { id, name, age, createdAt: NOW, updatedAt: NOW }
}

// ============================================================
// CRUD 测试
// ============================================================

describe("BaseRepository", () => {
  describe("findById", () => {
    it("查到记录时应返回实体", async () => {
      const entity = makeEntity("1", "张三", 20)
      const { client } = createMockClient({
        singleResult: { data: entity, error: null },
      })
      const repo = new BaseRepository<TestEntity>(client, TABLE)

      const result = await repo.findById("1")

      expect(result).toEqual(entity)
    })

    it("未查到记录时应返回 null", async () => {
      const { client } = createMockClient({
        singleResult: { data: null, error: null },
      })
      const repo = new BaseRepository<TestEntity>(client, TABLE)

      const result = await repo.findById("不存在")

      expect(result).toBeNull()
    })

    it("发生错误时应抛出并记录日志", async () => {
      const error = new Error("查询失败")
      const { client, errorCalls } = createMockClient({
        singleResult: { data: null, error },
      })
      const repo = new BaseRepository<TestEntity>(client, TABLE)

      await expect(repo.findById("1")).rejects.toThrow("查询失败")
      expect(errorCalls).toHaveLength(1)
      expect(errorCalls[0]?.message).toBe("findById 失败")
      expect(errorCalls[0]?.context).toEqual(
        expect.objectContaining({ table: TABLE, id: "1", error: "查询失败" })
      )
    })

    it("应正确构建查询链（select * + eq + maybeSingle）", async () => {
      const { client, getCalls, fromCalls } = createMockClient({
        singleResult: { data: null, error: null },
      })
      const repo = new BaseRepository<TestEntity>(client, TABLE)

      await repo.findById("abc")

      expect(fromCalls).toEqual([TABLE])
      expect(getCalls("select")).toEqual([["*"]])
      expect(getCalls("eq")).toEqual([["id", "abc"]])
      expect(getCalls("maybeSingle")).toHaveLength(1)
    })
  })

  describe("findAll", () => {
    it("应返回全部记录数组", async () => {
      const entities = [
        makeEntity("1", "张三", 20),
        makeEntity("2", "李四", 25),
      ]
      const { client } = createMockClient({
        arrayResult: { data: entities, error: null },
      })
      const repo = new BaseRepository<TestEntity>(client, TABLE)

      const result = await repo.findAll()

      expect(result).toEqual(entities)
      expect(result).toHaveLength(2)
    })

    it("无记录时应返回空数组", async () => {
      const { client } = createMockClient({
        arrayResult: { data: [], error: null },
      })
      const repo = new BaseRepository<TestEntity>(client, TABLE)

      const result = await repo.findAll()

      expect(result).toEqual([])
    })

    it("data 为 null 时应返回空数组", async () => {
      const { client } = createMockClient({
        arrayResult: { data: null, error: null },
      })
      const repo = new BaseRepository<TestEntity>(client, TABLE)

      const result = await repo.findAll()

      expect(result).toEqual([])
    })

    it("发生错误时应抛出并记录日志", async () => {
      const error = new Error("查询全部失败")
      const { client, errorCalls } = createMockClient({
        arrayResult: { data: null, error },
      })
      const repo = new BaseRepository<TestEntity>(client, TABLE)

      await expect(repo.findAll()).rejects.toThrow("查询全部失败")
      expect(errorCalls).toHaveLength(1)
      expect(errorCalls[0]?.message).toBe("findAll 失败")
    })
  })

  describe("insert", () => {
    it("应插入记录并返回完整实体", async () => {
      const created = makeEntity("1", "张三", 20)
      const { client } = createMockClient({
        singleResult: { data: created, error: null },
      })
      const repo = new BaseRepository<TestEntity>(client, TABLE)

      const result = await repo.insert({ name: "张三", age: 20 })

      expect(result).toEqual(created)
    })

    it("应将插入数据透传给 supabase", async () => {
      const created = makeEntity("1", "张三", 20)
      const { client, getCalls } = createMockClient({
        singleResult: { data: created, error: null },
      })
      const repo = new BaseRepository<TestEntity>(client, TABLE)

      await repo.insert({ name: "张三", age: 20 })

      expect(getCalls("insert")).toEqual([[{ name: "张三", age: 20 }]])
    })

    it("发生错误时应抛出并记录日志", async () => {
      const error = new Error("插入失败")
      const { client, errorCalls } = createMockClient({
        singleResult: { data: null, error },
      })
      const repo = new BaseRepository<TestEntity>(client, TABLE)

      await expect(repo.insert({ name: "张三", age: 20 })).rejects.toThrow(
        "插入失败"
      )
      expect(errorCalls).toHaveLength(1)
      expect(errorCalls[0]?.message).toBe("insert 失败")
    })

    it("插入后 data 为 null 时应抛出错误", async () => {
      const { client } = createMockClient({
        singleResult: { data: null, error: null },
      })
      const repo = new BaseRepository<TestEntity>(client, TABLE)

      await expect(repo.insert({ name: "张三", age: 20 })).rejects.toThrow(
        `insert 未返回数据: ${TABLE}`
      )
    })
  })

  describe("update", () => {
    it("应更新记录并返回更新后实体", async () => {
      const updated = makeEntity("1", "张三改名", 21)
      const { client } = createMockClient({
        singleResult: { data: updated, error: null },
      })
      const repo = new BaseRepository<TestEntity>(client, TABLE)

      const result = await repo.update("1", { name: "张三改名" })

      expect(result).toEqual(updated)
    })

    it("应将更新数据透传给 supabase", async () => {
      const updated = makeEntity("1", "x", 20)
      const { client, getCalls } = createMockClient({
        singleResult: { data: updated, error: null },
      })
      const repo = new BaseRepository<TestEntity>(client, TABLE)

      await repo.update("1", { name: "x" })

      expect(getCalls("update")).toEqual([[{ name: "x" }]])
      expect(getCalls("eq")).toEqual([["id", "1"]])
    })

    it("目标不存在时应返回 null", async () => {
      const { client } = createMockClient({
        singleResult: { data: null, error: null },
      })
      const repo = new BaseRepository<TestEntity>(client, TABLE)

      const result = await repo.update("不存在", { name: "x" })

      expect(result).toBeNull()
    })

    it("发生错误时应抛出并记录日志", async () => {
      const error = new Error("更新失败")
      const { client, errorCalls } = createMockClient({
        singleResult: { data: null, error },
      })
      const repo = new BaseRepository<TestEntity>(client, TABLE)

      await expect(repo.update("1", { name: "x" })).rejects.toThrow("更新失败")
      expect(errorCalls).toHaveLength(1)
      expect(errorCalls[0]?.message).toBe("update 失败")
    })
  })

  describe("delete", () => {
    it("删除成功应返回 true", async () => {
      const { client } = createMockClient({
        arrayResult: { data: null, error: null },
      })
      const repo = new BaseRepository<TestEntity>(client, TABLE)

      const result = await repo.delete("1")

      expect(result).toBe(true)
    })

    it("发生错误时应抛出并记录日志", async () => {
      const error = new Error("删除失败")
      const { client, errorCalls } = createMockClient({
        arrayResult: { data: null, error },
      })
      const repo = new BaseRepository<TestEntity>(client, TABLE)

      await expect(repo.delete("1")).rejects.toThrow("删除失败")
      expect(errorCalls).toHaveLength(1)
      expect(errorCalls[0]?.message).toBe("delete 失败")
    })
  })

  // ============================================================
  // 查询能力测试
  // ============================================================

  describe("findMany", () => {
    it("无参数时应查询全部", async () => {
      const entities = [makeEntity("1", "张三", 20)]
      const { client } = createMockClient({
        arrayResult: { data: entities, error: null },
      })
      const repo = new BaseRepository<TestEntity>(client, TABLE)

      const result = await repo.findMany({})

      expect(result).toEqual(entities)
    })

    it("带过滤条件时应返回过滤后数据", async () => {
      const entities = [makeEntity("1", "张三", 20)]
      const { client } = createMockClient({
        arrayResult: { data: entities, error: null },
      })
      const repo = new BaseRepository<TestEntity>(client, TABLE)

      const result = await repo.findMany({
        filters: [
          { column: "age", operator: "gte", value: 18 },
          { column: "name", operator: "like", value: "%张%" },
        ],
      })

      expect(result).toEqual(entities)
    })

    it("带排序时应返回排序后数据", async () => {
      const entities = [
        makeEntity("1", "张三", 25),
        makeEntity("2", "李四", 20),
      ]
      const { client } = createMockClient({
        arrayResult: { data: entities, error: null },
      })
      const repo = new BaseRepository<TestEntity>(client, TABLE)

      const result = await repo.findMany({
        sorts: [{ column: "age", ascending: false }],
      })

      expect(result).toEqual(entities)
    })

    it("带分页时应返回当前页数据", async () => {
      const entities = [makeEntity("1", "张三", 20)]
      const { client } = createMockClient({
        arrayResult: { data: entities, error: null },
      })
      const repo = new BaseRepository<TestEntity>(client, TABLE)

      const result = await repo.findMany({
        pagination: { page: 2, pageSize: 10 },
      })

      expect(result).toEqual(entities)
    })

    it("发生错误时应抛出并记录日志", async () => {
      const error = new Error("条件查询失败")
      const { client, errorCalls } = createMockClient({
        arrayResult: { data: null, error },
      })
      const repo = new BaseRepository<TestEntity>(client, TABLE)

      await expect(
        repo.findMany({ filters: [{ column: "x", operator: "eq", value: 1 }] })
      ).rejects.toThrow("条件查询失败")
      expect(errorCalls).toHaveLength(1)
      expect(errorCalls[0]?.message).toBe("findMany 失败")
    })

    it("应正确构建查询链（过滤 + 排序 + 分页）", async () => {
      const { client, getCalls, fromCalls } = createMockClient({
        arrayResult: { data: [], error: null },
      })
      const repo = new BaseRepository<TestEntity>(client, TABLE)

      await repo.findMany({
        filters: [
          { column: "status", operator: "eq", value: "active" },
          { column: "age", operator: "gte", value: 18 },
          { column: "name", operator: "ilike", value: "%test%" },
        ],
        sorts: [{ column: "createdAt", ascending: false }, { column: "name" }],
        pagination: { page: 3, pageSize: 20 },
      })

      expect(fromCalls).toEqual([TABLE])
      expect(getCalls("select")).toEqual([["*"]])
      expect(getCalls("eq")).toEqual([["status", "active"]])
      expect(getCalls("gte")).toEqual([["age", 18]])
      expect(getCalls("ilike")).toEqual([["name", "%test%"]])
      expect(getCalls("order")).toEqual([
        ["createdAt", { ascending: false }],
        ["name", { ascending: true }],
      ])
      expect(getCalls("range")).toEqual([[40, 59]])
    })

    it("无分页参数时不应调用 range", async () => {
      const { client, getCalls } = createMockClient({
        arrayResult: { data: [], error: null },
      })
      const repo = new BaseRepository<TestEntity>(client, TABLE)

      await repo.findMany({ sorts: [{ column: "name" }] })

      expect(getCalls("range")).toHaveLength(0)
    })
  })

  describe("count", () => {
    it("应返回总记录数", async () => {
      const { client } = createMockClient({
        arrayResult: { data: null, error: null, count: 42 },
      })
      const repo = new BaseRepository<TestEntity>(client, TABLE)

      const result = await repo.count()

      expect(result).toBe(42)
    })

    it("带过滤条件时应计数过滤后的记录", async () => {
      const { client } = createMockClient({
        arrayResult: { data: null, error: null, count: 5 },
      })
      const repo = new BaseRepository<TestEntity>(client, TABLE)

      const result = await repo.count([
        { column: "status", operator: "eq", value: "active" },
      ])

      expect(result).toBe(5)
    })

    it("count 为 null 时应返回 0", async () => {
      const { client } = createMockClient({
        arrayResult: { data: null, error: null, count: null },
      })
      const repo = new BaseRepository<TestEntity>(client, TABLE)

      const result = await repo.count()

      expect(result).toBe(0)
    })

    it("发生错误时应抛出并记录日志", async () => {
      const error = new Error("计数失败")
      const { client, errorCalls } = createMockClient({
        arrayResult: { data: null, error },
      })
      const repo = new BaseRepository<TestEntity>(client, TABLE)

      await expect(repo.count()).rejects.toThrow("计数失败")
      expect(errorCalls).toHaveLength(1)
      expect(errorCalls[0]?.message).toBe("count 失败")
    })

    it("应使用 head:true + count:exact 查询", async () => {
      const { client, getCalls } = createMockClient({
        arrayResult: { data: null, error: null, count: 0 },
      })
      const repo = new BaseRepository<TestEntity>(client, TABLE)

      await repo.count([{ column: "age", operator: "gt", value: 18 }])

      expect(getCalls("select")).toEqual([
        ["*", { count: "exact", head: true }],
      ])
      expect(getCalls("gt")).toEqual([["age", 18]])
    })
  })

  describe("findPaginated", () => {
    it("应返回分页结果（含总数与总页数）", async () => {
      const entities = [
        makeEntity("1", "张三", 20),
        makeEntity("2", "李四", 25),
      ]
      const { client } = createMockClient({
        arrayResult: { data: entities, error: null, count: 55 },
      })
      const repo = new BaseRepository<TestEntity>(client, TABLE)

      const result = await repo.findPaginated({
        pagination: { page: 3, pageSize: 10 },
      })

      expect(result.data).toEqual(entities)
      expect(result.total).toBe(55)
      expect(result.page).toBe(3)
      expect(result.pageSize).toBe(10)
      expect(result.totalPages).toBe(6)
    })

    it("无分页参数时应使用默认值（page=1, pageSize=20）", async () => {
      const { client, getCalls } = createMockClient({
        arrayResult: { data: [], error: null, count: 0 },
      })
      const repo = new BaseRepository<TestEntity>(client, TABLE)

      const result = await repo.findPaginated({})

      expect(result.page).toBe(1)
      expect(result.pageSize).toBe(20)
      expect(getCalls("range")).toEqual([[0, 19]])
    })

    it("总数为零时总页数应为 0", async () => {
      const { client } = createMockClient({
        arrayResult: { data: [], error: null, count: 0 },
      })
      const repo = new BaseRepository<TestEntity>(client, TABLE)

      const result = await repo.findPaginated({
        pagination: { page: 1, pageSize: 10 },
      })

      expect(result.totalPages).toBe(0)
    })

    it("发生错误时应抛出并记录日志", async () => {
      const error = new Error("分页查询失败")
      const { client, errorCalls } = createMockClient({
        arrayResult: { data: null, error },
      })
      const repo = new BaseRepository<TestEntity>(client, TABLE)

      await expect(
        repo.findPaginated({ pagination: { page: 1, pageSize: 10 } })
      ).rejects.toThrow("分页查询失败")
      expect(errorCalls).toHaveLength(1)
      expect(errorCalls[0]?.message).toBe("findPaginated 失败")
    })

    it("应使用 count:exact + range 查询", async () => {
      const { client, getCalls, fromCalls } = createMockClient({
        arrayResult: { data: [], error: null, count: 100 },
      })
      const repo = new BaseRepository<TestEntity>(client, TABLE)

      await repo.findPaginated({
        filters: [{ column: "status", operator: "eq", value: "active" }],
        sorts: [{ column: "createdAt", ascending: false }],
        pagination: { page: 2, pageSize: 15 },
      })

      expect(fromCalls).toEqual([TABLE])
      expect(getCalls("select")).toEqual([["*", { count: "exact" }]])
      expect(getCalls("eq")).toEqual([["status", "active"]])
      expect(getCalls("order")).toEqual([["createdAt", { ascending: false }]])
      expect(getCalls("range")).toEqual([[15, 29]])
    })
  })
})
