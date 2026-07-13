import type { PaginatedResponse } from "@ps/types-base"

/**
 * 通用仓储契约 — 定义标准 CRUD 操作接口。
 * 由 mock/db 等具体层实现。
 *
 * @template TEntity 实体类型
 * @template TCreate 创建输入类型
 * @template TUpdate 更新输入类型
 * @template TQuery 查询参数类型
 */
export interface Repository<TEntity, TCreate, TUpdate, TQuery> {
  /** 按 ID 查询 */
  getById: (id: string) => TEntity | undefined

  /** 创建 */
  create: (input: TCreate) => TEntity

  /** 更新 */
  update: (id: string, input: TUpdate) => TEntity | undefined

  /** 删除 */
  delete: (id: string) => boolean

  /** 分页列表 */
  list: (query: TQuery) => PaginatedResponse<TEntity>

  /** 获取全部 */
  getAll: () => TEntity[]
}
