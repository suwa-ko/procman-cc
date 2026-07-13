/**
 * usePagination — 分页状态管理 Hook
 *
 * 管理页码与每页条数状态，提供标准分页操作。
 */

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "@ps/types-base"
import { useCallback, useMemo, useState } from "react"


/**
 * 分页状态与操作。
 */
export interface UsePaginationReturn {
  /** 当前页码（从 1 开始） */
  readonly page: number
  /** 每页条数 */
  readonly pageSize: number
  /** 跳转到指定页 */
  readonly goToPage: (p: number) => void
  /** 下一页 */
  readonly nextPage: () => void
  /** 上一页 */
  readonly prevPage: () => void
  /** 修改每页条数并重置到第 1 页 */
  readonly setPageSize: (size: number) => void
  /** 重置到第 1 页 */
  readonly reset: () => void
}

/**
 * 分页状态管理。
 *
 * @param initialPage - 初始页码（默认 1）
 * @param initialPageSize - 初始每页条数（默认 20）
 * @returns 分页状态对象
 *
 * 用法：
 * ```ts
 * const { page, pageSize, goToPage, nextPage, prevPage } = usePagination()
 * ```
 */
export function usePagination(
  initialPage = DEFAULT_PAGE,
  initialPageSize = DEFAULT_PAGE_SIZE
): UsePaginationReturn {
  const [page, setPageState] = useState(initialPage)
  const [pageSize, setPageSizeState] = useState(initialPageSize)

  const goToPage = useCallback((p: number) => {
    setPageState(Math.max(1, p))
  }, [])

  const nextPage = useCallback(() => {
    setPageState((prev) => prev + 1)
  }, [])

  const prevPage = useCallback(() => {
    setPageState((prev) => Math.max(1, prev - 1))
  }, [])

  const setPageSize = useCallback(
    (size: number) => {
      const clamped = Math.min(Math.max(1, size), MAX_PAGE_SIZE)
      setPageSizeState(clamped)
      setPageState(1)
    },
    []
  )

  const reset = useCallback(() => {
    setPageState(1)
    setPageSizeState(DEFAULT_PAGE_SIZE)
  }, [])

  return useMemo<UsePaginationReturn>(
    () => ({ page, pageSize, goToPage, nextPage, prevPage, setPageSize, reset }),
    [page, pageSize, goToPage, nextPage, prevPage, setPageSize, reset]
  )
}
