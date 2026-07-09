/**
 * @ps/db
 * Supabase 数据访问层 — 封装数据库读写操作（原子 CRUD + 查询）
 * 通过 createDbClient(config, logger) 注入配置与日志，不直接引用 env-config
 */

export { createDbClient } from "./core/client"
export { BaseRepository } from "./core/base-repository"
export { applyFilters, applySorts, paginationToRange } from "./core/query-builder"
export type {
  BaseEntity,
  DbClient,
  DbConfig,
  DbQueryChain,
  DbSupabase,
  FilterOperator,
  PaginatedResult,
  PaginationParams,
  QueryFilter,
  QueryParams,
  QueryResult,
  SelectOptions,
  SortField,
} from "./core/types"
