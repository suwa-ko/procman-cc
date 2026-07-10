/**
 * Mock 数据库客户端。
 * 纯内存实现 DbClient，不依赖任何外部服务。
 * filters / sorts / range / limit 均在内存执行，用于开发体验与自动化测试。
 *
 * 用法：
 *   const db = createMockDbClient({ suppliers: [supplierA, supplierB] })
 *   const repo = new SupplierRepository(db)
 *   // repo 的所有 CRUD 方法零修改，自动走内存
 */

import type {
  DbClient,
  DbQueryChain,
  DbSupabase,
  QueryResult,
  SelectOptions,
} from "./types"

// ============================================================
// 内部类型
// ============================================================

type FilterOperator =
  "eq" | "neq" | "gt" | "lt" | "gte" | "lte" | "like" | "ilike" | "in"

interface FilterEntry {
  column: string
  operator: FilterOperator
  value: unknown
}

interface SortEntry {
  column: string
  ascending: boolean
}

type WriteType = "insert" | "update" | "delete"

// ============================================================
// 内存存储
// ============================================================

type InMemoryStore = Map<string, Map<string, Record<string, unknown>>>

function nowISO(): string {
  return new Date().toISOString()
}

function makeId(): string {
  return `mock-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

// ============================================================
// 过滤 / 排序 / 分页（纯内存）
// ============================================================

function likeMatch(value: string, pattern: string): boolean {
  // % → .* , _ → .
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&")
  const regex = new RegExp(
    `^${escaped.replace(/%/g, ".*").replace(/_/g, ".")}$`
  )
  return regex.test(value)
}

function matchFilter(
  record: Record<string, unknown>,
  filter: FilterEntry
): boolean {
  const val = record[filter.column]
  switch (filter.operator) {
    case "eq":
      return val === filter.value
    case "neq":
      return val !== filter.value
    case "gt":
      return Number(val) > Number(filter.value)
    case "lt":
      return Number(val) < Number(filter.value)
    case "gte":
      return Number(val) >= Number(filter.value)
    case "lte":
      return Number(val) <= Number(filter.value)
    case "like":
      return typeof val === "string" && likeMatch(val, filter.value as string)
    case "ilike":
      return (
        typeof val === "string" &&
        likeMatch(val.toLowerCase(), (filter.value as string).toLowerCase())
      )
    case "in":
      return Array.isArray(filter.value) && filter.value.includes(val)
    default: {
      const exhaustive: never = filter.operator
      throw new Error(`未知过滤操作符: ${String(exhaustive)}`)
    }
  }
}

function applyFilters(
  records: Record<string, unknown>[],
  filters: FilterEntry[]
): Record<string, unknown>[] {
  if (filters.length === 0) {
    return records
  }
  return records.filter((r) => filters.every((f) => matchFilter(r, f)))
}

function applySorts(
  records: Record<string, unknown>[],
  sorts: SortEntry[]
): Record<string, unknown>[] {
  if (sorts.length === 0) {
    return records
  }
  return [...records].sort((a, b) => {
    for (const sort of sorts) {
      const aVal = a[sort.column]
      const bVal = b[sort.column]
      const dir = sort.ascending ? 1 : -1
      if (aVal === null || aVal === undefined) {
        return 1 * dir
      }
      if (bVal === null || bVal === undefined) {
        return -1 * dir
      }
      if (aVal < bVal) {
        return -1 * dir
      }
      if (aVal > bVal) {
        return 1 * dir
      }
    }
    return 0
  })
}

function applyRange(
  records: Record<string, unknown>[],
  from: number,
  to: number
): Record<string, unknown>[] {
  // supabase range 是闭区间 [from, to]
  return records.slice(from, to + 1)
}

// ============================================================
// MockQueryChain — 内存查询链
// ============================================================

class MockQueryChain implements DbQueryChain {
  private readonly tableName: string
  private readonly store: InMemoryStore

  private filters: FilterEntry[] = []
  private sorts: SortEntry[] = []
  private rangeFrom: number | null = null
  private rangeTo: number | null = null
  private limitCount: number | null = null

  private writeType: WriteType | null = null
  private writeData: unknown = undefined
  private returnSelect: boolean = false
  private selectOptions: SelectOptions | null = null

  constructor(tableName: string, store: InMemoryStore) {
    this.tableName = tableName
    this.store = store
  }

  // ---- 查询方法 ----

  select(_columns?: string, options?: SelectOptions): DbQueryChain {
    this.returnSelect = true
    this.selectOptions = options ?? null
    return this as unknown as DbQueryChain
  }

  // ---- 过滤方法 ----

  eq(column: string, value: unknown): DbQueryChain {
    return this.addFilter(column, "eq", value)
  }

  neq(column: string, value: unknown): DbQueryChain {
    return this.addFilter(column, "neq", value)
  }

  gt(column: string, value: unknown): DbQueryChain {
    return this.addFilter(column, "gt", value)
  }

  lt(column: string, value: unknown): DbQueryChain {
    return this.addFilter(column, "lt", value)
  }

  gte(column: string, value: unknown): DbQueryChain {
    return this.addFilter(column, "gte", value)
  }

  lte(column: string, value: unknown): DbQueryChain {
    return this.addFilter(column, "lte", value)
  }

  like(column: string, value: string): DbQueryChain {
    return this.addFilter(column, "like", value)
  }

  ilike(column: string, value: string): DbQueryChain {
    return this.addFilter(column, "ilike", value)
  }

  // eslint-disable-next-line @typescript-eslint/method-signature-style -- 保留字 in 只能用引号方法名
  in(column: string, value: unknown[]): DbQueryChain {
    return this.addFilter(column, "in", value)
  }

  // ---- 排序与分页 ----

  order(column: string, options?: { ascending?: boolean }): DbQueryChain {
    this.sorts.push({ column, ascending: options?.ascending ?? true })
    return this as unknown as DbQueryChain
  }

  range(from: number, to: number): DbQueryChain {
    this.rangeFrom = from
    this.rangeTo = to
    return this as unknown as DbQueryChain
  }

  limit(count: number): DbQueryChain {
    this.limitCount = count
    return this as unknown as DbQueryChain
  }

  // ---- 写操作 ----

  insert(data: unknown): DbQueryChain {
    this.writeType = "insert"
    this.writeData = data
    return this as unknown as DbQueryChain
  }

  update(data: unknown): DbQueryChain {
    this.writeType = "update"
    this.writeData = data
    return this as unknown as DbQueryChain
  }

  delete(): DbQueryChain {
    this.writeType = "delete"
    return this as unknown as DbQueryChain
  }

  // ---- 终端方法 ----

  maybeSingle(): Promise<QueryResult<unknown>> {
    const result = this.executeQuery()
    const data = result.data
    if (data === null || data.length === 0) {
      return Promise.resolve({ data: null, error: null })
    }
    return Promise.resolve({ data: data[0] ?? null, error: null })
  }

  single(): Promise<QueryResult<unknown>> {
    const result = this.executeQuery()
    const data = result.data
    if (data === null || data.length === 0) {
      return Promise.resolve({ data: null, error: new Error("No rows found") })
    }
    return Promise.resolve({ data: data[0] ?? null, error: null })
  }

  // ---- PromiseLike 实现（await chain 返回 QueryResult<unknown[]>） ----

  then<TResult1 = QueryResult<unknown[]>, TResult2 = never>(
    onfulfilled?:
      | ((value: QueryResult<unknown[]>) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return Promise.resolve(this.executeQuery()).then(onfulfilled, onrejected)
  }

  // ---- 内部执行逻辑 ----

  private addFilter(
    column: string,
    operator: FilterOperator,
    value: unknown
  ): DbQueryChain {
    this.filters.push({ column, operator, value })
    return this as unknown as DbQueryChain
  }

  private getTable(): Map<string, Record<string, unknown>> {
    let table = this.store.get(this.tableName)
    if (!table) {
      table = new Map()
      this.store.set(this.tableName, table)
    }
    return table
  }

  private executeQuery(): QueryResult<unknown[]> {
    if (this.writeType !== null) {
      return this.executeWrite()
    }
    return this.executeRead()
  }

  private executeRead(): QueryResult<unknown[]> {
    const table = this.getTable()
    let records = Array.from(table.values())

    // 过滤
    records = applyFilters(records, this.filters)

    // 排序
    records = applySorts(records, this.sorts)

    // count 选项（在 range/limit 前统计，模拟 supabase count=exact 语义）
    const totalCount = this.selectOptions?.count ? records.length : undefined

    // 分页
    if (this.rangeFrom !== null && this.rangeTo !== null) {
      records = applyRange(records, this.rangeFrom, this.rangeTo)
    }

    // limit
    if (this.limitCount !== null) {
      records = records.slice(0, this.limitCount)
    }

    // head: true → 只返回 count，不返回 data
    if (this.selectOptions?.head) {
      return { data: [], error: null, count: totalCount }
    }

    return { data: records, error: null, count: totalCount }
  }

  private executeWrite(): QueryResult<unknown[]> {
    const table = this.getTable()

    switch (this.writeType) {
      case "insert": {
        const id = makeId()
        const now = nowISO()
        const record: Record<string, unknown> = {
          id,
          createdAt: now,
          updatedAt: now,
          ...(this.writeData as Record<string, unknown>),
        }
        table.set(id, record)
        return this.returnSelect
          ? { data: [record], error: null }
          : { data: null, error: null }
      }

      case "update": {
        let records = Array.from(table.values())
        records = applyFilters(records, this.filters)
        const updateData = this.writeData as Record<string, unknown>
        const updated: Record<string, unknown>[] = []
        const now = nowISO()
        for (const record of records) {
          const updatedRecord = {
            ...record,
            ...updateData,
            updatedAt: now,
          }
          table.set(record.id as string, updatedRecord)
          updated.push(updatedRecord)
        }
        return this.returnSelect
          ? { data: updated, error: null }
          : { data: null, error: null }
      }

      case "delete": {
        let records = Array.from(table.values())
        records = applyFilters(records, this.filters)
        for (const record of records) {
          table.delete(record.id as string)
        }
        return this.returnSelect
          ? { data: records, error: null }
          : { data: null, error: null }
      }

      default: {
        const exhaustive: never = this.writeType as never
        throw new Error(`未知写操作: ${String(exhaustive)}`)
      }
    }
  }
}

// ============================================================
// createMockDbClient — 工厂函数
// ============================================================

/**
 * 创建 Mock 数据库客户端。
 * 纯内存实现，不连接任何外部服务。
 *
 * @param seedData - 可选的预置数据，格式为 { tableName: [records] }
 * @returns 实现 DbClient 接口的 mock 客户端
 *
 * @example
 * const db = createMockDbClient({
 *   suppliers: [{ id: 's1', name: 'ACME', createdAt: '', updatedAt: '' }]
 * })
 * const repo = new SupplierRepository(db)  // BaseRepository 零修改
 */
export function createMockDbClient(
  seedData?: Record<string, Record<string, unknown>[]>
): DbClient {
  const store: InMemoryStore = new Map()

  // 注入预置数据
  if (seedData) {
    for (const [table, records] of Object.entries(seedData)) {
      const tableMap = new Map<string, Record<string, unknown>>()
      for (const record of records) {
        const id = (record.id as string) ?? makeId()
        tableMap.set(id, record)
      }
      store.set(table, tableMap)
    }
  }

  const supabase: DbSupabase = {
    from: (table: string): DbQueryChain =>
      new MockQueryChain(table, store) as unknown as DbQueryChain,
  }

  return {
    supabase,
    logger: {
      debug: () => undefined,
      info: () => undefined,
      warn: () => undefined,
      error: () => undefined,
    },
  } as unknown as DbClient
}
