/**
 * CRUD 工厂类型定义
 */

import type { PaginatedResponse } from "@ps/types-base"
import type { QueryKey, UseMutationResult, UseQueryResult } from "@tanstack/react-query"


/**
 * CRUD 工厂配置 — 描述一个标准 CRUD 实体的 API 端点。
 * 类型参数由 createCrudHooks 的调用方显式传入。
 */
export interface CrudModelConfig {
  /** API 基础路径（如 "/api/suppliers"） */
  readonly baseUrl: string

  /** TanStack Query 缓存键前缀（如 ["suppliers"]） */
  readonly queryKey: QueryKey

  /** 实体中文名（供错误提示使用） */
  readonly entityName: string
}

/** 标准分页列表响应 */
export type ListResponse<TEntity> = PaginatedResponse<TEntity>

/**
 * CRUD Hook 集合 — createCrudHooks 的返回值。
 */
export interface CrudHooks<
  TEntity,
  TCreate,
  TUpdate,
  TQueryParams,
> {
  /** 分页列表查询 */
  readonly useList: (params: TQueryParams) => UseQueryResult<ListResponse<TEntity>>

  /** 单条查询 */
  readonly useDetail: (id: string) => UseQueryResult<TEntity>

  /** 创建 */
  readonly useCreate: () => UseMutationResult<TEntity, Error, TCreate>

  /** 更新 */
  readonly useUpdate: () => UseMutationResult<
    TEntity,
    Error,
    { id: string; data: TUpdate }
  >

  /** 删除 */
  readonly useDelete: () => UseMutationResult<void, Error, string>
}
