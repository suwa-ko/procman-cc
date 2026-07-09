import { describe, it, expect } from "vitest"

import {
  applyFilters,
  applySorts,
  paginationToRange,
} from "../core/query-builder"
import type { DbQueryChain, QueryFilter, SortField } from "../core/types"

// ============================================================
// 测试用 Mock 工具
// ============================================================

/** 记录链式方法调用的 mock 查询链 */
function createMockChain(): {
  chain: DbQueryChain
  getCalls: (method: string) => unknown[][]
} {
  const calls: Record<string, unknown[][]> = {}
  const ref: { current: DbQueryChain | null } = { current: null }

  const record =
    (method: string) =>
    (...args: unknown[]): DbQueryChain => {
      if (!(method in calls)) {
        calls[method] = []
      }
      calls[method].push(args)
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
    maybeSingle: record("maybeSingle"),
    single: record("single"),
    then: (resolve: (value: unknown) => unknown) =>
      Promise.resolve({ data: null, error: null }).then(resolve),
  }

  ref.current = chain as unknown as DbQueryChain

  return {
    chain: ref.current,
    getCalls: (method: string): unknown[][] => calls[method] ?? [],
  }
}

// ============================================================
// applyFilters 测试
// ============================================================

describe("applyFilters", () => {
  it("filters 为 undefined 时应原样返回 chain", () => {
    const { chain, getCalls } = createMockChain()
    const result = applyFilters(chain, undefined)
    expect(result).toBe(chain)
    expect(getCalls("eq")).toHaveLength(0)
  })

  it("filters 为空数组时应原样返回 chain", () => {
    const { chain, getCalls } = createMockChain()
    const result = applyFilters(chain, [])
    expect(result).toBe(chain)
    expect(getCalls("eq")).toHaveLength(0)
  })

  it("应按顺序应用所有过滤条件", () => {
    const { chain, getCalls } = createMockChain()
    const filters: QueryFilter[] = [
      { column: "status", operator: "eq", value: "active" },
      { column: "age", operator: "gte", value: 18 },
    ]
    const result = applyFilters(chain, filters)
    expect(result).toBe(chain)
    expect(getCalls("eq")).toEqual([["status", "active"]])
    expect(getCalls("gte")).toEqual([["age", 18]])
  })

  it("应正确调用所有 9 种操作符", () => {
    const { chain, getCalls } = createMockChain()
    const filters: QueryFilter[] = [
      { column: "a", operator: "eq", value: 1 },
      { column: "b", operator: "neq", value: 2 },
      { column: "c", operator: "gt", value: 3 },
      { column: "d", operator: "lt", value: 4 },
      { column: "e", operator: "gte", value: 5 },
      { column: "f", operator: "lte", value: 6 },
      { column: "g", operator: "like", value: "%foo%" },
      { column: "h", operator: "ilike", value: "%bar%" },
      { column: "i", operator: "in", value: [1, 2, 3] },
    ]
    const result = applyFilters(chain, filters)
    expect(result).toBe(chain)
    expect(getCalls("eq")).toEqual([["a", 1]])
    expect(getCalls("neq")).toEqual([["b", 2]])
    expect(getCalls("gt")).toEqual([["c", 3]])
    expect(getCalls("lt")).toEqual([["d", 4]])
    expect(getCalls("gte")).toEqual([["e", 5]])
    expect(getCalls("lte")).toEqual([["f", 6]])
    expect(getCalls("like")).toEqual([["g", "%foo%"]])
    expect(getCalls("ilike")).toEqual([["h", "%bar%"]])
    expect(getCalls("in")).toEqual([["i", [1, 2, 3]]])
  })
})

// ============================================================
// applySorts 测试
// ============================================================

describe("applySorts", () => {
  it("sorts 为 undefined 时应原样返回 chain", () => {
    const { chain, getCalls } = createMockChain()
    const result = applySorts(chain, undefined)
    expect(result).toBe(chain)
    expect(getCalls("order")).toHaveLength(0)
  })

  it("sorts 为空数组时应原样返回 chain", () => {
    const { chain, getCalls } = createMockChain()
    const result = applySorts(chain, [])
    expect(result).toBe(chain)
    expect(getCalls("order")).toHaveLength(0)
  })

  it("应按顺序应用排序字段", () => {
    const { chain, getCalls } = createMockChain()
    const sorts: SortField[] = [
      { column: "createdAt", ascending: false },
      { column: "name", ascending: true },
    ]
    const result = applySorts(chain, sorts)
    expect(result).toBe(chain)
    expect(getCalls("order")).toEqual([
      ["createdAt", { ascending: false }],
      ["name", { ascending: true }],
    ])
  })

  it("ascending 缺省时应默认 true（升序）", () => {
    const { chain, getCalls } = createMockChain()
    const result = applySorts(chain, [{ column: "name" }])
    expect(result).toBe(chain)
    expect(getCalls("order")).toEqual([["name", { ascending: true }]])
  })
})

// ============================================================
// paginationToRange 测试
// ============================================================

describe("paginationToRange", () => {
  it("第 1 页应返回 [0, pageSize-1]", () => {
    expect(paginationToRange({ page: 1, pageSize: 20 })).toEqual({
      from: 0,
      to: 19,
    })
  })

  it("第 2 页应返回 [pageSize, 2*pageSize-1]", () => {
    expect(paginationToRange({ page: 2, pageSize: 20 })).toEqual({
      from: 20,
      to: 39,
    })
  })

  it("第 3 页 pageSize=10 应返回 [20, 29]", () => {
    expect(paginationToRange({ page: 3, pageSize: 10 })).toEqual({
      from: 20,
      to: 29,
    })
  })

  it("pageSize=1 时每页仅一条", () => {
    expect(paginationToRange({ page: 5, pageSize: 1 })).toEqual({
      from: 4,
      to: 4,
    })
  })

  it("page=0 应抛出错误", () => {
    expect(() => paginationToRange({ page: 0, pageSize: 10 })).toThrow(
      "非法的页码"
    )
  })

  it("page 为负数应抛出错误", () => {
    expect(() => paginationToRange({ page: -1, pageSize: 10 })).toThrow(
      "非法的页码"
    )
  })

  it("page 为非整数应抛出错误", () => {
    expect(() => paginationToRange({ page: 1.5, pageSize: 10 })).toThrow(
      "非法的页码"
    )
  })

  it("pageSize=0 应抛出错误", () => {
    expect(() => paginationToRange({ page: 1, pageSize: 0 })).toThrow(
      "非法的每页条数"
    )
  })

  it("pageSize 为负数应抛出错误", () => {
    expect(() => paginationToRange({ page: 1, pageSize: -5 })).toThrow(
      "非法的每页条数"
    )
  })

  it("pageSize 为非整数应抛出错误", () => {
    expect(() => paginationToRange({ page: 1, pageSize: 2.5 })).toThrow(
      "非法的每页条数"
    )
  })
})
