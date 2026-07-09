import {
  applyFilters,
  applySorts,
  paginationToRange,
} from "./query-builder"
import type { BaseEntity, DbClient, PaginatedResult, QueryParams } from "./types"

/**
 * 基础 Repository：封装数据库表的原子 CRUD 操作。
 * - 不含任何业务规则（规则 5：db 层只做原子数据操作）
 * - 错误处理：记录日志后抛出原始错误（规则 8.2：db 层抛出原始错误）
 *
 * 用法：具体 Repository 继承本类并绑定实体类型 T
 *   class SupplierRepository extends BaseRepository<SupplierEntity> { ... }
 */
export class BaseRepository<T extends BaseEntity> {
  protected readonly client: DbClient
  protected readonly tableName: string

  constructor(client: DbClient, tableName: string) {
    this.client = client
    this.tableName = tableName
  }

  /** 按主键查询单条记录，不存在返回 null */
  async findById(id: string): Promise<T | null> {
    const { data, error } = await this.client.supabase
      .from(this.tableName)
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (error) {
      this.logAndThrow("findById", error, { id })
    }
    return data as T | null
  }

  /** 查询全表记录 */
  async findAll(): Promise<T[]> {
    const { data, error } = await this.client.supabase
      .from(this.tableName)
      .select("*")

    if (error) {
      this.logAndThrow("findAll", error)
    }
    return (data ?? []) as T[]
  }

  /** 按条件查询多条记录（支持过滤、排序、分页） */
  async findMany(params: QueryParams): Promise<T[]> {
    let chain = this.client.supabase.from(this.tableName).select("*")
    chain = applyFilters(chain, params.filters)
    chain = applySorts(chain, params.sorts)
    if (params.pagination) {
      const { from, to } = paginationToRange(params.pagination)
      chain = chain.range(from, to)
    }
    const { data, error } = await chain

    if (error) {
      this.logAndThrow("findMany", error)
    }
    return (data ?? []) as T[]
  }

  /** 按条件计数（仅 filters 生效，排序/分页忽略） */
  async count(filters?: QueryParams["filters"]): Promise<number> {
    let chain = this.client.supabase
      .from(this.tableName)
      .select("*", { count: "exact", head: true })
    chain = applyFilters(chain, filters)
    const { count, error } = await chain

    if (error) {
      this.logAndThrow("count", error)
    }
    return count ?? 0
  }

  /** 分页查询（一次请求同时返回数据与总数） */
  async findPaginated(params: QueryParams): Promise<PaginatedResult<T>> {
    const page = params.pagination?.page ?? 1
    const pageSize = params.pagination?.pageSize ?? 20
    const { from, to } = paginationToRange({ page, pageSize })

    let chain = this.client.supabase
      .from(this.tableName)
      .select("*", { count: "exact" })
    chain = applyFilters(chain, params.filters)
    chain = applySorts(chain, params.sorts)
    chain = chain.range(from, to)
    const { data, count, error } = await chain

    if (error) {
      this.logAndThrow("findPaginated", error)
    }
    const total = count ?? 0
    return {
      data: (data ?? []) as T[],
      total,
      page,
      pageSize,
      totalPages: pageSize > 0 ? Math.ceil(total / pageSize) : 0,
    }
  }

  /** 插入一条记录，返回完整实体 */
  async insert(entity: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T> {
    const { data, error } = await this.client.supabase
      .from(this.tableName)
      .insert(entity)
      .select()
      .single()

    if (error) {
      this.logAndThrow("insert", error)
    }
    if (data === null) {
      throw new Error(`insert 未返回数据: ${this.tableName}`)
    }
    return data as T
  }

  /** 按主键更新记录，不存在返回 null */
  async update(
    id: string,
    data: Partial<Omit<T, "id" | "createdAt" | "updatedAt">>
  ): Promise<T | null> {
    const { data: updated, error } = await this.client.supabase
      .from(this.tableName)
      .update(data)
      .eq("id", id)
      .select()
      .maybeSingle()

    if (error) {
      this.logAndThrow("update", error, { id })
    }
    return updated as T | null
  }

  /** 按主键硬删除，成功返回 true */
  async delete(id: string): Promise<boolean> {
    const { error } = await this.client.supabase
      .from(this.tableName)
      .delete()
      .eq("id", id)

    if (error) {
      this.logAndThrow("delete", error, { id })
    }
    return true
  }

  /**
   * 记录错误日志并抛出原始错误（统一错误上下文格式）。
   * 返回 never：调用后控制流终止，TypeScript 据此收窄后续分支。
   */
  private logAndThrow(
    operation: string,
    error: Error,
    extra?: Record<string, unknown>
  ): never {
    this.client.logger.error(`${operation} 失败`, {
      table: this.tableName,
      ...extra,
      error: error.message,
    })
    throw error
  }
}
