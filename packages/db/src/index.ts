/**
 * @ps/db
 * Supabase 数据访问层 — 封装数据库读写操作（原子 CRUD + 查询）
 * 通过 createDbClient(config, logger) 注入配置与日志，不直接引用 env-config
 */

export { createDbClient } from "./core/client"
export { createMockDbClient } from "./core/mock-client"
export { MockQueryChain } from "./core/mock-query-chain"
export { BaseRepository } from "./core/base-repository"
export { RepositoryFactory } from "./core/repository-factory"
export type { GeneratedRepo } from "./core/repository-factory"

export {
  applyFilters,
  applySorts,
  paginationToRange,
} from "./core/query-builder"

// ---- 实体仓储 ----
export { CodeSequenceRepo } from "./code-sequence.repo"
export { PricingRepo } from "./pricing.repo"
export { ContractRepo } from "./contract.repo"
export { ContractEntryRepo } from "./contract-entry.repo"
export { SupplierRepo } from "./supplier.repo"
export { MaterialRepo } from "./material.repo"
export { CategoryRepo } from "./category.repo"
export { TemplateRepo } from "./template.repo"
export { PersonRepo } from "./person.repo"

export type { PricingRow } from "./pricing.repo"
export type { ContractRow } from "./contract.repo"
export type { ContractEntryRow } from "./contract-entry.repo"
export type { SupplierRow } from "./supplier.repo"
export type { MaterialRow } from "./material.repo"
export type { CategoryRow } from "./category.repo"
export type { TemplateRow } from "./template.repo"
export type { PersonRow } from "./person.repo"

// ---- 核心类型 ----
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
