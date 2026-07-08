import { describe, it, expect } from "vitest"

import {
  roundTo2,
  multiplyPrice,
  sumMoney,
  isValidMoney,
  MONEY_PRECISION,
} from "../money"

describe("money", () => {
  describe("roundTo2", () => {
    it("应四舍五入到两位小数", () => {
      expect(roundTo2(3.14159)).toBe(3.14)
      expect(roundTo2(3.145)).toBe(3.15)
      expect(roundTo2(3.144)).toBe(3.14)
    })

    it("应处理整数", () => {
      expect(roundTo2(100)).toBe(100)
    })

    it("应处理负数", () => {
      expect(roundTo2(-3.1)).toBe(-3.1)
      expect(roundTo2(-3.16)).toBe(-3.16)
    })

    it("应抛错：NaN", () => {
      expect(() => roundTo2(NaN)).toThrow("非法的金额数值")
    })

    it("应抛错：Infinity", () => {
      expect(() => roundTo2(Infinity)).toThrow("非法的金额数值")
    })
  })

  describe("multiplyPrice", () => {
    it("应正确计算单价 × 数量", () => {
      expect(multiplyPrice(12.34, 3)).toBe(37.02)
      expect(multiplyPrice(100, 1)).toBe(100)
      expect(multiplyPrice(0.1, 3)).toBe(0.3) // 浮点精度
    })

    it("单价为 0 应允许", () => {
      expect(multiplyPrice(0, 5)).toBe(0)
    })

    it("应抛错：负单价", () => {
      expect(() => multiplyPrice(-10, 3)).toThrow("非法的单价")
    })

    it("应抛错：负数量", () => {
      expect(() => multiplyPrice(10, -3)).toThrow("非法的数量")
    })

    it("应抛错：数量为 0", () => {
      expect(() => multiplyPrice(10, 0)).toThrow("非法的数量")
    })

    it("应抛错：NaN 单价", () => {
      expect(() => multiplyPrice(NaN, 3)).toThrow("非法的单价")
    })
  })

  describe("sumMoney", () => {
    it("应正确求和", () => {
      expect(sumMoney([1.1, 2.2, 3.3])).toBe(6.6)
      expect(sumMoney([100, 200, 300])).toBe(600)
    })

    it("空数组应返回 0", () => {
      expect(sumMoney([])).toBe(0)
    })

    it("单个元素应原样返回", () => {
      expect(sumMoney([42.5])).toBe(42.5)
    })

    it("应抛错：含负数", () => {
      expect(() => sumMoney([1, -2, 3])).toThrow("非法的金额")
    })

    it("应抛错：含 NaN", () => {
      expect(() => sumMoney([1, NaN, 3])).toThrow("非法的金额")
    })
  })

  describe("isValidMoney", () => {
    it("合法金额应返回 true", () => {
      expect(isValidMoney(0)).toBe(true)
      expect(isValidMoney(100)).toBe(true)
      expect(isValidMoney(100.5)).toBe(true)
      expect(isValidMoney(100.55)).toBe(true)
    })

    it("超过两位小数应返回 false", () => {
      expect(isValidMoney(100.555)).toBe(false)
      expect(isValidMoney(0.001)).toBe(false)
    })

    it("负数应返回 false", () => {
      expect(isValidMoney(-1)).toBe(false)
    })

    it("NaN 应返回 false", () => {
      expect(isValidMoney(NaN)).toBe(false)
    })

    it("Infinity 应返回 false", () => {
      expect(isValidMoney(Infinity)).toBe(false)
    })
  })

  it("MONEY_PRECISION 应为 2", () => {
    expect(MONEY_PRECISION).toBe(2)
  })
})
