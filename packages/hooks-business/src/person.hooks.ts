/**
 * 人员查询 Hook（仅查询，人员主数据来自外部系统）
 *
 * 根据项目规则，人员模块仅提供查询能力，不提供新增/编辑/删除。
 */

import type { PersonDTO, PersonQueryParams } from "@ps/contracts"
import type { PaginatedResponse } from "@ps/types-base"
import type { UseQueryResult } from "@tanstack/react-query"
import {
  toQueryParams,
  useQuery,
  useRequestClient,
} from "@vibe-purchase/hooks-core"

const BASE_URL = "/api/persons"
const QUERY_KEY = ["persons"] as const

/** 人员分页列表查询 */
export function usePersonList(
  params: PersonQueryParams
): UseQueryResult<PaginatedResponse<PersonDTO>> {
  const client = useRequestClient()
  return useQuery<PaginatedResponse<PersonDTO>>({
    queryKey: [...QUERY_KEY, params],
    queryFn: async () => {
      return client.get<PaginatedResponse<PersonDTO>>(BASE_URL, {
        params: toQueryParams(params as unknown as Record<string, unknown>),
      })
    },
  })
}

/** 人员单条查询 */
export function usePersonDetail(id: string): UseQueryResult<PersonDTO> {
  const client = useRequestClient()
  return useQuery<PersonDTO>({
    queryKey: [...QUERY_KEY, id],
    queryFn: async () => {
      return client.get<PersonDTO>(`${BASE_URL}/${id}`)
    },
    enabled: !!id,
  })
}
