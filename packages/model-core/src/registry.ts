import type { ZodSchema } from "zod"

/**
 * 模型定义描述符。
 * 注册一个业务模型时，声明其四类 Schema 及关联关系。
 */
export interface ModelDefinition<TEntity, TCreate, TUpdate, TQuery> {
  /** 模型名称（如 "supplier"） */
  name: string

  /** 实体 schema */
  entitySchema: ZodSchema<TEntity>

  /** 创建校验 schema */
  createSchema: ZodSchema<TCreate>

  /** 更新校验 schema */
  updateSchema: ZodSchema<TUpdate>

  /** 列表查询校验 schema */
  querySchema: ZodSchema<TQuery>

  /** 关联定义 */
  relations?: RelationDefinition[]
}

/**
 * 实体关联定义
 */
export interface RelationDefinition {
  /** 关联类型 */
  type: "one-to-many" | "many-to-one" | "many-to-many"

  /** 目标模型名称 */
  targetModel: string

  /** 本模型的外键字段名 */
  foreignKey: string

  /** 目标模型的引用键（默认 "id"） */
  targetKey?: string
}

/**
 * 模型注册表。
 * 不依赖具体存储实现，仅维护模型的 schema 声明与关联映射。
 */
export class ModelRegistry {
  private definitions: Map<
    string,
    ModelDefinition<unknown, unknown, unknown, unknown>
  > = new Map()

  /** 注册一个模型 */
  register<TEntity, TCreate, TUpdate, TQuery>(
    def: ModelDefinition<TEntity, TCreate, TUpdate, TQuery>
  ): void {
    this.definitions.set(
      def.name,
      def as ModelDefinition<unknown, unknown, unknown, unknown>
    )
  }

  /** 获取已注册模型 */
  get(
    name: string
  ): ModelDefinition<unknown, unknown, unknown, unknown> | undefined {
    return this.definitions.get(name)
  }

  /** 获取所有已注册模型的名称 */
  names(): string[] {
    return Array.from(this.definitions.keys())
  }

  /** 清除所有注册 */
  clear(): void {
    this.definitions.clear()
  }
}
