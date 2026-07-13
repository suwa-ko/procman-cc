/**
 * Mock 查询引擎 — 内存过滤 / 排序 / 分页实现。
 * 为 MockQueryChain 提供纯函数的查询执行能力。
 */

// ============================================================
// 内部类型
// ============================================================

export type FilterOperator =
  | "eq" | "neq" | "gt" | "lt" | "gte" | "lte" | "like" | "ilike" | "in"

export interface FilterEntry {
  readonly column: string
  readonly operator: FilterOperator
  readonly value: unknown
}

export interface SortEntry {
  readonly column: string
  readonly ascending: boolean
}

// ============================================================
// 辅助函数
// ============================================================

export function nowISO(): string {
  return new Date().toISOString()
}

export function makeId(): string {
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

export function applyFilters(
  records: Record<string, unknown>[],
  filters: FilterEntry[]
): Record<string, unknown>[] {
  if (filters.length === 0) {
    return records
  }
  return records.filter((r) => filters.every((f) => matchFilter(r, f)))
}

export function applySorts(
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

export function applyRange(
  records: Record<string, unknown>[],
  from: number,
  to: number
): Record<string, unknown>[] {
  // supabase range 是闭区间 [from, to]
  return records.slice(from, to + 1)
}
