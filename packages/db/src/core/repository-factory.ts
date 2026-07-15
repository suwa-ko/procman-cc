/**
 * Repository 工厂。
 *
 * 基于 ModelRegistry 的模型定义，自动生成标准 CRUD 仓储。
 * 消除手写重复 Repository 类的需要，实现 Dimension 1 的"自动生成能力"。
 *
 * 使用示例：
 *   const factory = new RepositoryFactory(db)
 *   const supplierRepo = factory.create(supplierDefinition) // CRUD 即开即用
 */

import type { ModelDefinition } from "@ps/model-core"

import { BaseRepository } from "./base-repository"
import type { DbClient, QueryParams, PaginatedResult, BaseEntity } from "./types"

/** 表名映射：模型名 → 数据库表名 */
const TABLE_NAME_MAP: Record<string, string> = {
  supplier: "suppliers",
  material: "materials",
  category: "categories",
  pricing: "pricings",
  contract: "contracts",
  template: "templates",
  person: "persons",
}

/**
 * 根据模型名称推导数据库表名。
 * 优先使用预定义映射，否则按最简规则加 "s"。
 */
function tableName(modelName: string): string {
  return TABLE_NAME_MAP[modelName] ?? `${modelName}s`
}

/**
 * 工厂生成的仓储接口。
 * 覆盖标准 CRUD 五项操作，与手写仓储对齐。
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface GeneratedRepo<T extends BaseEntity = any> {
  tableName: string
  findById: (id: string) => Promise<T | null>
  findPaginated: (params: QueryParams) => Promise<PaginatedResult<T>>
  insert: (entity: Record<string, unknown>) => Promise<T>
  update: (id: string, data: Record<string, unknown>) => Promise<T | null>
  delete: (id: string) => Promise<boolean>
}

/**
 * Repository 工厂。
 *
 * 接收 DbClient，基于 ModelDefinition 动态创建仓储实例。
 * 相对于手写仓储的优势：
 * - 无需为每个模型单独写 Repository 类
 * - 表名、CRUD 操作方法统一由工厂派生
 * - 新增模型时只需注册 ModelDefinition，无需额外代码
 */
export class RepositoryFactory {
  private readonly client: DbClient

  public constructor(client: DbClient) {
    this.client = client
  }

  /**
   * 基于模型定义创建仓储。
   *
   * @param def - 来自 ModelRegistry 的模型定义
   * @returns GeneratedRepo<T> 提供标准 CRUD
   */
  public create<T extends BaseEntity>(
    def: ModelDefinition<unknown, unknown, unknown, unknown>
  ): GeneratedRepo<T> {
    const tbl = tableName(def.name)
    const repo = new BaseRepository<T>(this.client, tbl)

    return {
      tableName: tbl,
      findById: (id: string) => repo.findById(id),
      findPaginated: (params: QueryParams) => repo.findPaginated(params),
      insert: (entity: Record<string, unknown>) => repo.insert(entity as Omit<T, "id" | "createdAt" | "updatedAt">),
      update: (id: string, data: Record<string, unknown>) => repo.update(id, data as Partial<Omit<T, "id" | "createdAt" | "updatedAt">>),
      delete: (id: string) => repo.delete(id),
    }
  }
}
