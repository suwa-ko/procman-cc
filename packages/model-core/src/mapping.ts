/**
 * 实体关系映射类型。
 * 用于描述存储层中实体间的关联关系，
 * 不依赖于具体 ORM 或数据库实现。
 */

/** 关联方向 */
export type RelationDirection = "parent" | "children"

/** 关联配置 */
export interface EntityMapping {
  /** 源模型名称 */
  sourceModel: string
  /** 目标模型名称 */
  targetModel: string
  /** 关联方向 */
  direction: RelationDirection
  /** 关联的外键字段 */
  foreignKey: string
  /** 是否级联删除 */
  cascade?: boolean
}

/** 实体映射注册表（纯数据结构） */
export interface EntityMappingRegistry {
  mappings: Map<string, EntityMapping[]>

  /** 注册关联 */
  add: (mapping: EntityMapping) => void

  /** 获取某模型的所有关联 */
  of: (modelName: string) => EntityMapping[]

  /** 获取从 source 到 target 的关联 */
  between: (sourceModel: string, targetModel: string) => EntityMapping | undefined
}

/**
 * 创建映射注册表工厂函数
 */
export function createEntityMappingRegistry(): EntityMappingRegistry {
  const mappings = new Map<string, EntityMapping[]>()

  return {
    mappings,

    add(mapping: EntityMapping): void {
      const existing = mappings.get(mapping.sourceModel) ?? []
      existing.push(mapping)
      mappings.set(mapping.sourceModel, existing)
    },

    of(modelName: string): EntityMapping[] {
      return mappings.get(modelName) ?? []
    },

    between(
      sourceModel: string,
      targetModel: string
    ): EntityMapping | undefined {
      const sourceMappings = mappings.get(sourceModel) ?? []
      return sourceMappings.find((m) => m.targetModel === targetModel)
    },
  }
}
