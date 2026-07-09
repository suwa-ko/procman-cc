import type { DbQueryChain, QueryFilter, SortField } from "./types"

/**
 * 将过滤条件数组应用到查询链。
 * 每个条件根据 operator 调用对应的 supabase 过滤方法。
 */
export function applyFilters(
  chain: DbQueryChain,
  filters?: QueryFilter[]
): DbQueryChain {
  if (!filters || filters.length === 0) {
    return chain
  }
  let result = chain
  for (const filter of filters) {
    result = applyFilter(result, filter)
  }
  return result
}

/** 将单个过滤条件应用到查询链 */
function applyFilter(chain: DbQueryChain, filter: QueryFilter): DbQueryChain {
  const { column, operator, value } = filter
  switch (operator) {
    case "eq":
      return chain.eq(column, value)
    case "neq":
      return chain.neq(column, value)
    case "gt":
      return chain.gt(column, value)
    case "lt":
      return chain.lt(column, value)
    case "gte":
      return chain.gte(column, value)
    case "lte":
      return chain.lte(column, value)
    case "like":
      return chain.like(column, value as string)
    case "ilike":
      return chain.ilike(column, value as string)
    case "in":
      return chain.in(column, value as unknown[])
    default:
      return chain
  }
}

/**
 * 将排序字段数组应用到查询链。
 * 多个排序字段按顺序应用（supabase 支持多次 order 调用）。
 */
export function applySorts(
  chain: DbQueryChain,
  sorts?: SortField[]
): DbQueryChain {
  if (!sorts || sorts.length === 0) {
    return chain
  }
  let result = chain
  for (const sort of sorts) {
    result = result.order(sort.column, {
      ascending: sort.ascending ?? true,
    })
  }
  return result
}

/**
 * 将分页参数转换为 supabase range 的 from/to。
 * page 从 1 开始，range 的 from/to 是闭区间 [from, to]。
 * 非法参数（page < 1 或 pageSize < 1）直接抛错，避免产生负数 range。
 */
export function paginationToRange(pagination: {
  page: number
  pageSize: number
}): { from: number; to: number } {
  if (!Number.isInteger(pagination.page) || pagination.page < 1) {
    throw new Error(`非法的页码: ${pagination.page}，应 >= 1 的整数`)
  }
  if (!Number.isInteger(pagination.pageSize) || pagination.pageSize < 1) {
    throw new Error(`非法的每页条数: ${pagination.pageSize}，应 >= 1 的整数`)
  }
  const from = (pagination.page - 1) * pagination.pageSize
  const to = from + pagination.pageSize - 1
  return { from, to }
}
