/**
 * 内存 Mock 存储基类。
 * 为每个业务实体提供统一的 CRUD + 分页 + 筛选能力，
 * 在 MSW handler 中作为主数据源。
 *
 * create() 自动添加 id/createdAt/updatedAt，但排除 code（由编码服务生成）。
 */

import type { PaginatedResponse } from "@ps/types-base"
import { MAX_PAGE_SIZE } from "@ps/types-base"

/** 可存于 Map 中的实体必须含 id */
interface Identifiable {
  id: string
}

/**
 * 列表查询参数（泛型，外部可扩展实体特定筛选字段）
 */
export interface ListParams<TFilters = Record<string, unknown>> {
  page: number
  pageSize: number
  filters?: TFilters
}

/**
 * 内存 Mock 存储基类
 * @template T 实体类型（必须含 id）
 * @template TFilters 列表筛选字段类型
 */
export class BaseMockStore<
  T extends Identifiable,
  TFilters = Record<string, unknown>,
> {
  private readonly items: Map<string, T> = new Map()

  /** 存储名称（仅用于日志/调试） */
  private readonly storeName: string

  /** ID 生成器 */
  private readonly idGenerator: () => string

  constructor(name: string, idGen: () => string) {
    this.storeName = name
    this.idGenerator = idGen
  }

  // ========== 公开 API ==========

  /** 获取全部数据（不分页） */
  getAll(): T[] {
    return Array.from(this.items.values())
  }

  /** 按 ID 查询单条 */
  getById(id: string): T | undefined {
    return this.items.get(id)
  }

  /**
   * 创建实体。
   * 自动生成 id、createdAt、updatedAt。
   * code 由外部编码服务生成，不在 create 时注入。
   */
  create(
    data: Omit<T, "id" | "code" | "version" | "createdAt" | "updatedAt">
  ): T {
    const now = new Date().toISOString()
    const id = this.idGenerator()
    const item = {
      ...data,
      id,
      code: "",
      createdAt: now,
      updatedAt: now,
    } as unknown as T
    this.items.set(id, item)
    return item
  }

  /** 更新实体（partial patch） */
  update(id: string, patch: Partial<T>): T | undefined {
    const existing = this.items.get(id)
    if (existing === undefined) {
      return undefined
    }
    const updated: Record<string, unknown> = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString(),
    }
    this.items.set(id, updated as T)
    return updated as T
  }

  /** 删除实体 */
  delete(id: string): boolean {
    return this.items.delete(id)
  }

  /**
   * 分页列表查询，含自定义筛选
   */
  list(params: ListParams<TFilters>): PaginatedResponse<T> {
    const page = Math.max(1, params.page)
    const pageSize = Math.min(Math.max(1, params.pageSize), MAX_PAGE_SIZE)
    let items = this.getAll()

    // 应用自定义筛选
    if (params.filters) {
      items = items.filter((item) =>
        this.customFilter(item, params.filters as TFilters)
      )
    }

    const total = items.length
    const start = (page - 1) * pageSize
    const data = items.slice(start, start + pageSize)

    return { data, total, page, pageSize }
  }

  /** 设置自定义筛选函数 */
  setFilter(fn: (item: T, filters: TFilters) => boolean): void {
    this.customFilter = fn
  }

  /** 清空所有数据 */
  clear(): void {
    this.items.clear()
  }

  /** 批量导入初始数据 */
  seed(entities: T[]): void {
    for (const entity of entities) {
      this.items.set(entity.id, entity)
    }
  }

  /** 当前数据量 */
  get size(): number {
    return this.items.size
  }

  /** 存储名称 */
  get name(): string {
    return this.storeName
  }

  /** 自定义筛选逻辑（子类通过 setFilter 注入特定筛选规则） */
  protected customFilter(_item: T, _filters: TFilters): boolean {
    return true
  }
}
