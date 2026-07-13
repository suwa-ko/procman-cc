/**
 * createCrudHooks — 通用 CRUD Hook 工厂
 *
 * 传入模型配置，自动生成 useList / useDetail / useCreate / useUpdate / useDelete。
 * 内部使用 useRequestClient 获取 HttpClient，通过 TanStack Query 管理缓存。
 *
 * 用法：
 * ```ts
 * const supplierHooks = createCrudHooks<SupplierDTO, CreateSupplierRequest, UpdateSupplierRequest, SupplierQueryParams>({
 *   baseUrl: "/api/suppliers",
 *   queryKey: ["suppliers"],
 *   entityName: "供应商",
 * })
 * export const { useList, useDetail, useCreate, useUpdate, useDelete } = supplierHooks
 * ```
 */

import type {
  QueryKey,
  UseMutationResult,
  UseQueryResult,
} from "@tanstack/react-query"
import { useQueryClient } from "@tanstack/react-query"

import { useMutation, useQuery } from "../query"
import { useRequestClient , toQueryParams } from "../request"

import type { CrudHooks, CrudModelConfig, ListResponse } from "./types"

/**
 * 将 params 中的 undefined 值过滤，生成稳定的序列化键。
 * 避免因 params 引用变化导致不必要的重新查询。
 */
function buildQueryKey(baseKey: QueryKey, params: object): QueryKey {
  const filtered: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      filtered[key] = value
    }
  }
  return [...baseKey, filtered]
}

/** 缓存失效的 onSuccess 回调 — 静默忽略失效失败 */
function invalidateCache(
  qc: ReturnType<typeof useQueryClient>,
  keys: QueryKey
): void {
  qc.invalidateQueries({ queryKey: keys }).catch(() => {
    // 缓存失效失败不影响用户操作，忽略
  })
}

/**
 * 创建标准 CRUD Hook 集合。
 *
 * @param config - 模型配置（baseUrl、queryKey、entityName）
 * @returns CRUD Hook 对象
 */
export function createCrudHooks<TEntity, TCreate, TUpdate, TQueryParams>(
  config: CrudModelConfig
): CrudHooks<TEntity, TCreate, TUpdate, TQueryParams> {
  const { baseUrl, queryKey } = config

  /** 分页列表查询 */
  function useList(
    params: TQueryParams
  ): UseQueryResult<ListResponse<TEntity>> {
    const client = useRequestClient()
    return useQuery<ListResponse<TEntity>>({
      queryKey: buildQueryKey(queryKey, params as Record<string, unknown>),
      queryFn: async () => {
        return client.get<ListResponse<TEntity>>(baseUrl, {
          params: toQueryParams(params as Record<string, unknown>),
        })
      },
    })
  }

  /** 单条查询 */
  function useDetail(id: string): UseQueryResult<TEntity> {
    const client = useRequestClient()
    return useQuery<TEntity>({
      queryKey: [...queryKey, id],
      queryFn: async () => {
        return client.get<TEntity>(`${baseUrl}/${id}`)
      },
      enabled: !!id,
    })
  }

  /** 创建 */
  function useCreate(): UseMutationResult<TEntity, Error, TCreate> {
    const client = useRequestClient()
    const qc = useQueryClient()
    return useMutation<TEntity, Error, TCreate>({
      mutationFn: async (body) => {
        return client.post<TEntity>(baseUrl, body)
      },
      onSuccess: () => {
        invalidateCache(qc, queryKey)
      },
    })
  }

  /** 更新 */
  function useUpdate(): UseMutationResult<
    TEntity,
    Error,
    { id: string; data: TUpdate }
  > {
    const client = useRequestClient()
    const qc = useQueryClient()
    return useMutation<TEntity, Error, { id: string; data: TUpdate }>({
      mutationFn: async ({ id, data }) => {
        return client.put<TEntity>(`${baseUrl}/${id}`, data)
      },
      onSuccess: () => {
        invalidateCache(qc, queryKey)
      },
    })
  }

  /** 删除 */
  function useDelete(): UseMutationResult<void, Error, string> {
    const client = useRequestClient()
    const qc = useQueryClient()
    return useMutation<void, Error, string>({
      mutationFn: async (id) => {
        await client.delete<void>(`${baseUrl}/${id}`)
      },
      onSuccess: () => {
        invalidateCache(qc, queryKey)
      },
    })
  }

  return { useList, useDetail, useCreate, useUpdate, useDelete }
}
