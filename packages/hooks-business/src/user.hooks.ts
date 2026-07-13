/**
 * 用户 CRUD Hooks（映射到 Person 实体）
 *
 * 本系统中「用户」与「人员」为同一实体，主数据来自外部系统。
 * 提供分页查询与单条查询，不提供新增/编辑/删除（遵循 db 层人员模块只读约束）。
 */


import type { PersonDTO, PersonQueryParams } from "@ps/contracts"
import { toQueryParams, useQuery, useRequestClient } from "@ps/hooks-core"
import type { PaginatedResponse } from "@ps/types-base"
import type { UseQueryResult } from "@tanstack/react-query"

const BASE_URL = "/api/persons"
const QUERY_KEY = ["users"] as const

/** 用户列表查询（映射到 /api/persons） */
export function useUserList(
  params: PersonQueryParams
): UseQueryResult<PaginatedResponse<PersonDTO>> {
  const client = useRequestClient()
  return useQuery<PaginatedResponse<PersonDTO>>({
    queryKey: [...QUERY_KEY, "list", params],
    queryFn: async () => {
      return client.get<PaginatedResponse<PersonDTO>>(BASE_URL, {
        params: toQueryParams(params as unknown as Record<string, unknown>),
      })
    },
  })
}

/** 用户详情查询（映射到 /api/persons/:id） */
export function useUserDetail(
  id: string
): UseQueryResult<PersonDTO> {
  const client = useRequestClient()
  return useQuery<PersonDTO>({
    queryKey: [...QUERY_KEY, id],
    queryFn: async () => {
      return client.get<PersonDTO>(`${BASE_URL}/${id}`)
    },
    enabled: !!id,
  })
}
