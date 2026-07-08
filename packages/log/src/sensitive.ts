/**
 * 敏感字段脱敏
 * 默认对 password、token、secret、key 等字段进行脱敏
 */

/** 默认需要脱敏的字段名（不区分大小写匹配） */
const SENSITIVE_KEYS = [
  "password",
  "passwd",
  "token",
  "secret",
  "apikey",
  "api_key",
  "privatekey",
  "private_key",
  "authorization",
  "cookie",
] as const

/** 脱敏占位符 */
const MASKED_VALUE = "***"

/**
 * 判断字段名是否为敏感字段（不区分大小写）
 */
export function isSensitiveKey(key: string): boolean {
  const lower = key.toLowerCase()
  return SENSITIVE_KEYS.some((sensitive) => lower.includes(sensitive))
}

/**
 * 对对象中的敏感字段进行脱敏
 * 仅处理一层，不递归处理嵌套对象
 */
export function maskSensitive(
  data: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    if (isSensitiveKey(key)) {
      result[key] = MASKED_VALUE
    } else {
      result[key] = value
    }
  }
  return result
}
