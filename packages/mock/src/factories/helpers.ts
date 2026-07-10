import { faker } from "@faker-js/faker"

/**
 * 生成 UUID 格式的模拟 ID
 */
export function fakeId(): string {
  return faker.string.uuid()
}

/**
 * 生成业务编码：前缀 + 年份 + 4 位流水号
 * @param prefix 编码前缀
 */
export function fakeCode(prefix: string): string {
  const year = new Date().getFullYear().toString()
  const seq = faker.string.numeric(4)
  return `${prefix}-${year}-${seq}`
}

/**
 * 生成 ISO 时间戳
 */
export function fakeTimestamp(): string {
  return faker.date.recent({ days: 30 }).toISOString()
}

/**
 * 从枚举中随机选取一个值
 */
export function pickEnum<T extends Record<string, string>>(e: T): T[keyof T] {
  const values = Object.values(e)
  const idx = faker.number.int({ min: 0, max: values.length - 1 })
  const value = values[idx]
  if (value === undefined) {
    return values[0] as T[keyof T]
  }
  return value as T[keyof T]
}
