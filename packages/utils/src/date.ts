/**
 * 日期格式化工具
 * 不依赖第三方库，仅使用原生 Date
 */

/**
 * 将日期格式化为指定模式
 * 支持的占位符：
 * - YYYY：4位年份
 * - MM：2位月份（01-12）
 * - DD：2位日期（01-31）
 * - HH：2位小时（00-23）
 * - mm：2位分钟（00-59）
 * - ss：2位秒（00-59）
 *
 * @example formatDate(new Date("2026-07-08"), "YYYY-MM-DD") // "2026-07-08"
 * @example formatDate(new Date("2026-07-08T14:30:00"), "YYYY-MM-DD HH:mm:ss") // "2026-07-08 14:30:00"
 */
export function formatDate(
  date: Date | string | number,
  pattern: string
): string {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) {
    throw new Error(`非法的日期: ${String(date)}`)
  }
  const pad = (n: number): string => String(n).padStart(2, "0")
  return pattern
    .replace("YYYY", String(d.getFullYear()))
    .replace("MM", pad(d.getMonth() + 1))
    .replace("DD", pad(d.getDate()))
    .replace("HH", pad(d.getHours()))
    .replace("mm", pad(d.getMinutes()))
    .replace("ss", pad(d.getSeconds()))
}

/**
 * 获取当前时间的 ISO 8601 字符串（用于数据库时间戳）
 * @example toISO(new Date()) // "2026-07-08T14:30:00.000Z"
 */
export function toISO(date: Date | string | number = new Date()): string {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) {
    throw new Error(`非法的日期: ${String(date)}`)
  }
  return d.toISOString()
}

/**
 * 从 ISO 8601 字符串解析为 Date 对象
 */
export function fromISO(iso: string): Date {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) {
    throw new Error(`非法的 ISO 8601 字符串: ${iso}`)
  }
  return d
}

/** 常用格式常量 */
export const DATE_FORMAT = "YYYY-MM-DD"
export const DATETIME_FORMAT = "YYYY-MM-DD HH:mm:ss"
