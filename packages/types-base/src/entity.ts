/**
 * 实体唯一标识类型
 * 数据库主键统一使用字符串（Supabase UUID 或业务编码）
 */
export type ID = string

/**
 * 带版本号的实体（用于乐观锁）
 */
export interface VersionedEntity {
  /** 乐观锁版本号，每次更新自增 */
  version: number
}

/**
 * 带时间戳的实体
 */
export interface TimestampedEntity {
  /** 创建时间（ISO 8601） */
  createdAt: string
  /** 更新时间（ISO 8601） */
  updatedAt: string
}

/**
 * 软删除实体
 */
export interface SoftDeletableEntity {
  /** 是否已删除 */
  deletedAt: string | null
}
