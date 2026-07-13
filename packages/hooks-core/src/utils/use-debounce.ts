/**
 * useDebounce — 防抖 Hook
 *
 * 常用于搜索输入等场景，在用户停止输入后延迟更新值。
 */

import { useEffect, useState } from "react"

/**
 * 对值进行防抖处理。
 *
 * @param value - 需要防抖的原始值
 * @param delay - 延迟毫秒数（默认 300）
 * @returns 防抖后的值
 *
 * 用法：
 * ```ts
 * const [keyword, setKeyword] = useState("")
 * const debouncedKeyword = useDebounce(keyword, 500)
 * ```
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
