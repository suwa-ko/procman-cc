import { describe, it, expect } from "vitest"

import {
  formatDate,
  toISO,
  fromISO,
  DATE_FORMAT,
  DATETIME_FORMAT,
} from "../date"

describe("date", () => {
  describe("formatDate", () => {
    it("应格式化为 YYYY-MM-DD", () => {
      const d = new Date("2026-07-08T00:00:00Z")
      expect(formatDate(d, "YYYY-MM-DD")).toBe("2026-07-08")
    })

    it("应格式化为完整日期时间", () => {
      const d = new Date("2026-07-08T14:30:00Z")
      // 注意：时区差异可能影响结果，使用 UTC 构造
      const local = new Date(d.getTime() + d.getTimezoneOffset() * 60000)
      expect(formatDate(local, "YYYY-MM-DD HH:mm:ss")).toBe(
        "2026-07-08 14:30:00"
      )
    })

    it("应支持字符串输入", () => {
      expect(formatDate("2026-01-15", "YYYY-MM-DD")).toBe("2026-01-15")
    })

    it("应支持时间戳输入", () => {
      const ts = new Date("2026-07-08").getTime()
      expect(formatDate(ts, "YYYY-MM-DD")).toBe("2026-07-08")
    })

    it("应正确补零", () => {
      const d = new Date(2026, 0, 5, 1, 2, 3) // 2026-01-05 01:02:03
      expect(formatDate(d, "YYYY-MM-DD HH:mm:ss")).toBe("2026-01-05 01:02:03")
    })

    it("应抛错：非法日期", () => {
      expect(() => formatDate("invalid", "YYYY-MM-DD")).toThrow("非法的日期")
    })

    it("应抛错：NaN 时间戳", () => {
      expect(() => formatDate(NaN, "YYYY-MM-DD")).toThrow("非法的日期")
    })
  })

  describe("toISO", () => {
    it("应返回 ISO 8601 字符串", () => {
      const iso = toISO(new Date("2026-07-08T14:30:00Z"))
      expect(iso).toBe("2026-07-08T14:30:00.000Z")
    })

    it("默认使用当前时间", () => {
      const before = Date.now()
      const iso = toISO()
      const after = Date.now()
      const ts = new Date(iso).getTime()
      expect(ts).toBeGreaterThanOrEqual(before)
      expect(ts).toBeLessThanOrEqual(after)
    })

    it("应抛错：非法日期", () => {
      expect(() => toISO("invalid")).toThrow("非法的日期")
    })
  })

  describe("fromISO", () => {
    it("应解析 ISO 字符串", () => {
      const d = fromISO("2026-07-08T14:30:00.000Z")
      expect(d instanceof Date).toBe(true)
      expect(d.toISOString()).toBe("2026-07-08T14:30:00.000Z")
    })

    it("应抛错：非法 ISO 字符串", () => {
      expect(() => fromISO("invalid")).toThrow("非法的 ISO 8601")
    })
  })

  it("DATE_FORMAT 应为 YYYY-MM-DD", () => {
    expect(DATE_FORMAT).toBe("YYYY-MM-DD")
  })

  it("DATETIME_FORMAT 应为 YYYY-MM-DD HH:mm:ss", () => {
    expect(DATETIME_FORMAT).toBe("YYYY-MM-DD HH:mm:ss")
  })
})
