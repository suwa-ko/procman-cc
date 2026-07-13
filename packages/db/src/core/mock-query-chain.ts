/**
 * MockQueryChain — 内存查询链实现。
 * 模拟 supabase-js 的链式查询 API（.eq / .order / .range / .single 等）。
 */


import {
  applyFilters,
  applyRange,
  applySorts,
  makeId,
  nowISO,
} from "./mock-query-engine"
import type {
  FilterEntry,
  SortEntry,
} from "./mock-query-engine"
import type { DbQueryChain, QueryResult, SelectOptions } from "./types"

// ============================================================
// 内部类型
// ============================================================

type WriteType = "insert" | "update" | "delete"

type InMemoryStore = Map<string, Map<string, Record<string, unknown>>>

// ============================================================
// MockQueryChain
// ============================================================

export class MockQueryChain implements DbQueryChain {
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
    operator: FilterEntry["operator"],
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
