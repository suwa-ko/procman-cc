import type { CodeSequenceRepo } from "@ps/db"

/**
 * 根据前缀、年份、流水号，生成全局唯一编码。
 *
 * 格式：PREFIX-YYYY-0001
 *
 * @example
 *   formatCode("CTT", 2026, 1) // "CTT-2026-0001"
 *   formatCode("PRC", 2026, 42) // "PRC-2026-0042"
 */
export function formatCode(prefix: string, year: number, sequence: number): string {
  const padded = String(sequence).padStart(4, "0")
  return `${prefix}-${year}-${padded}`
}

/**
 * 获取下一个可用编码。
 *
 * 业务规则：
 * - 编码格式为「前缀 + 年份 + 4 位流水号」
 * - 流水号按年份独立计数，每年从 0001 起始
 * - 编码由系统自动生成，用户不可编辑
 *
 * @param repo - 编码流水号仓储
 * @param table - 数据库表名（如 "pricings"）
 * @param prefix - 编码前缀（如 "PRC"）
 */
export async function nextCode(
  repo: CodeSequenceRepo,
  table: string,
  prefix: string
): Promise<string> {
  const year = new Date().getFullYear()
  const seq = await repo.getNextSequence(table, prefix, year)
  return formatCode(prefix, year, seq)
}
