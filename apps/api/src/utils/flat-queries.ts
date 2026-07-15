/**
 * 将 Hono `c.req.queries()` 返回的 `Record<string, string[]>` 扁平化为 `Record<string, string>`。
 * 每个 key 取第一个值，缺失的值使用空字符串。
 */
export function flatQueries(
  queries: Record<string, string[]>
): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, vals] of Object.entries(queries)) {
    result[key] = vals[0] ?? ""
  }
  return result
}
