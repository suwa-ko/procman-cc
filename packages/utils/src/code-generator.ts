/**
 * 编码生成器
 * 规则：前缀-年份-4位流水号（如 SUP-2026-0001）
 * 对应 PRD 1.4 系统编码规则
 */

/** 编码前缀类型 */
export type CodePrefix = "SUP" | "MAT" | "PRC" | "CTT" | "TPL"

/** 所有合法的编码前缀 */
export const CODE_PREFIXES: readonly CodePrefix[] = [
  "SUP",
  "MAT",
  "PRC",
  "CTT",
  "TPL",
]

/** 流水号位数 */
const SEQ_LENGTH = 4

/**
 * 生成业务编码
 * @param prefix 前缀（SUP/MAT/PRC/CTT/TPL）
 * @param year 年份（如 2026）
 * @param seq 流水号（1 起始，自动补零到 4 位）
 * @returns 编码字符串，如 "SUP-2026-0001"
 *
 * @example
 * generateCode("SUP", 2026, 1)  // "SUP-2026-0001"
 * generateCode("CTT", 2026, 42) // "CTT-2026-0042"
 */
export function generateCode(
  prefix: CodePrefix,
  year: number,
  seq: number
): string {
  if (!CODE_PREFIXES.includes(prefix)) {
    throw new Error(`非法的编码前缀: ${prefix}`)
  }
  if (!Number.isInteger(year) || year < 2000 || year > 9999) {
    throw new Error(`非法的年份: ${year}，应为 2000-9999`)
  }
  if (!Number.isInteger(seq) || seq < 1) {
    throw new Error(`非法的流水号: ${seq}，应为正整数`)
  }
  if (seq > 9999) {
    throw new Error(`流水号超过上限: ${seq}，最大为 9999`)
  }
  return `${prefix}-${year}-${String(seq).padStart(SEQ_LENGTH, "0")}`
}

/**
 * 解析编码字符串
 * @param code 编码字符串，如 "SUP-2026-0001"
 * @returns 解析结果 { prefix, year, seq }
 */
export function parseCode(code: string): {
  prefix: CodePrefix
  year: number
  seq: number
} {
  const parts = code.split("-")
  if (parts.length !== 3) {
    throw new Error(`非法的编码格式: ${code}`)
  }
  const [prefixStr, yearStr, seqStr] = parts as [string, string, string]
  if (!CODE_PREFIXES.includes(prefixStr as CodePrefix)) {
    throw new Error(`非法的编码前缀: ${prefixStr}`)
  }
  const year = Number.parseInt(yearStr, 10)
  const seq = Number.parseInt(seqStr, 10)
  if (Number.isNaN(year) || year < 2000 || year > 9999) {
    throw new Error(`非法的年份: ${yearStr}`)
  }
  if (Number.isNaN(seq) || seq < 1 || seq > 9999) {
    throw new Error(`非法的流水号: ${seqStr}`)
  }
  return { prefix: prefixStr as CodePrefix, year, seq }
}

/**
 * 校验编码字符串是否合法
 */
export function isValidCode(code: string): boolean {
  try {
    parseCode(code)
    return true
  } catch {
    return false
  }
}
