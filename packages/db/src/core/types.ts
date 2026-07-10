import type { Logger } from "@ps/log"
import type { ID, TimestampedEntity } from "@ps/types-base"

/**
 * 基础实体类型（组合 ID + 时间戳）。
 * BaseRepository 约束 T extends BaseEntity，确保有主键与时间戳字段。
 */
export interface BaseEntity extends TimestampedEntity {
  id: ID
}

/** 查询结果（类型安全封装，避免直接暴露 supabase 的多字段响应） */
export interface QueryResult<T> {
  data: T | null
  error: Error | null
  /** 总记录数（仅 count 查询或分页查询时由 supabase 返回） */
  count?: number | null
}

/** select 选项（对齐 supabase-js 的 count/head 能力） */
export interface SelectOptions {
  count?: "exact" | "planned" | "estimated"
  head?: boolean
}

/**
 * 数据库查询链（简化接口）。
 * 绕过 supabase-js 的复杂泛型推断，用 unknown 保留类型安全。
 * - 过滤/排序/分页方法返回 DbQueryChain（链式）
 * - 终端方法（maybeSingle/single）返回 Promise<QueryResult<unknown>>
 * - 直接 await 链本身时，解析为 QueryResult<unknown[]>（多条记录场景）
 * 后续接入 `supabase gen types` 生成的真实 Database 类型时，可替换本接口。
 */
export interface DbQueryChain extends PromiseLike<QueryResult<unknown[]>> {
  select: (columns?: string, options?: SelectOptions) => DbQueryChain
  /** 过滤方法 */
  eq: (column: string, value: unknown) => DbQueryChain
  neq: (column: string, value: unknown) => DbQueryChain
  gt: (column: string, value: unknown) => DbQueryChain
  lt: (column: string, value: unknown) => DbQueryChain
  gte: (column: string, value: unknown) => DbQueryChain
  lte: (column: string, value: unknown) => DbQueryChain
  like: (column: string, value: string) => DbQueryChain
  ilike: (column: string, value: string) => DbQueryChain
  in: (column: string, value: unknown[]) => DbQueryChain
  /** 排序与分页 */
  order: (column: string, options?: { ascending?: boolean }) => DbQueryChain
  range: (from: number, to: number) => DbQueryChain
  limit: (count: number) => DbQueryChain
  /** 写操作 */
  insert: (data: unknown) => DbQueryChain
  update: (data: unknown) => DbQueryChain
  delete: () => DbQueryChain
  /** 终端方法 */
  maybeSingle: () => Promise<QueryResult<unknown>>
  single: () => Promise<QueryResult<unknown>>
}

/** 数据库表访问入口（from 方法） */
export interface DbSupabase {
  from: (table: string) => DbQueryChain
}

/** 数据库连接配置（由 apps 层从 env-config 注入） */
export interface DbConfig {
  url: string
  anonKey: string
}

/** 数据库客户端（封装 Supabase Client + Logger） */
export interface DbClient {
  supabase: DbSupabase
  logger: Logger
}

// ============================================================
// 查询参数类型
// ============================================================

/** 过滤操作符（对齐 supabase-js PostgREST 过滤器） */
export type FilterOperator =
  "eq" | "neq" | "gt" | "lt" | "gte" | "lte" | "like" | "ilike" | "in"

/** 单个过滤条件 */
export interface QueryFilter {
  column: string
  operator: FilterOperator
  value: unknown
}

/** 排序字段 */
export interface SortField {
  column: string
  /** 默认 true（升序） */
  ascending?: boolean
}

/** 分页参数 */
export interface PaginationParams {
  /** 页码，从 1 开始 */
  page: number
  /** 每页条数 */
  pageSize: number
}

/** 查询参数（过滤 + 排序 + 分页） */
export interface QueryParams {
  filters?: QueryFilter[]
  sorts?: SortField[]
  pagination?: PaginationParams
}

/** 分页查询结果 */
export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
