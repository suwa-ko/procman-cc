import { describe, it, expect } from "vitest"

import {
  mask,
  maskPhone,
  maskEmail,
  maskIdCard,
  maskCreditCode,
  truncate,
} from "../string"

describe("string", () => {
  describe("mask", () => {
    it("应保留首尾各 1 个字符", () => {
      expect(mask("hello")).toBe("h***o")
    })

    it("应支持自定义保留位数", () => {
      expect(mask("13800138000", 3, 4)).toBe("138****8000")
    })

    it("字符串过短时应全部脱敏", () => {
      expect(mask("ab")).toBe("**")
      // "abc" 长度 3 > keepStart+keepEnd=2，进入正常脱敏，返回 "a*c"
      expect(mask("abc", 1, 1)).toBe("a*c")
      // 长度等于 keepStart+keepEnd 时全部脱敏
      expect(mask("ab", 1, 1)).toBe("**")
    })

    it("空字符串应返回空", () => {
      expect(mask("")).toBe("")
    })

    it("keepStart=0 时只保留尾部", () => {
      expect(mask("hello", 0, 2)).toBe("***lo")
    })

    it("应抛错：负数参数", () => {
      expect(() => mask("hello", -1, 1)).toThrow("必须非负")
      expect(() => mask("hello", 1, -1)).toThrow("必须非负")
    })
  })

  describe("maskPhone", () => {
    it("应正确脱敏 11 位手机号", () => {
      expect(maskPhone("13800138000")).toBe("138****8000")
    })

    it("应抛错：非 11 位", () => {
      expect(() => maskPhone("1380013800")).toThrow("非法的手机号")
      expect(() => maskPhone("138001380001")).toThrow("非法的手机号")
    })

    it("应抛错：含非数字字符", () => {
      expect(() => maskPhone("1380013800a")).toThrow("非法的手机号")
    })
  })

  describe("maskEmail", () => {
    it("应正确脱敏邮箱用户名", () => {
      expect(maskEmail("admin@example.com")).toBe("a****@example.com")
      expect(maskEmail("user@test.org")).toBe("u***@test.org")
    })

    it("单字符用户名应全部脱敏", () => {
      expect(maskEmail("a@example.com")).toBe("*@example.com")
    })

    it("应抛错：非法邮箱格式", () => {
      expect(() => maskEmail("invalid")).toThrow("非法的邮箱")
      expect(() => maskEmail("a@")).toThrow("非法的邮箱")
      expect(() => maskEmail("@example.com")).toThrow("非法的邮箱")
    })
  })

  describe("maskIdCard", () => {
    it("应正确脱敏 18 位身份证", () => {
      expect(maskIdCard("110101199001011234")).toBe("110101********1234")
    })

    it("应支持末尾为 X", () => {
      expect(maskIdCard("11010119900101123X")).toBe("110101********123X")
    })

    it("应抛错：非 18 位", () => {
      expect(() => maskIdCard("11010119900101123")).toThrow("非法的身份证号")
    })

    it("应抛错：含非法字符", () => {
      expect(() => maskIdCard("11010119900101123Y")).toThrow("非法的身份证号")
    })
  })

  describe("maskCreditCode", () => {
    it("应正确脱敏 18 位统一社会信用代码", () => {
      expect(maskCreditCode("91110108MA01ABCDXX")).toBe("9111**********CDXX")
    })

    it("应抛错：非 18 位", () => {
      expect(() => maskCreditCode("91110108MA01ABCD")).toThrow(
        "非法的统一社会信用代码"
      )
    })

    it("应抛错：含非法字符（I/O/Z/S/V）", () => {
      expect(() => maskCreditCode("91110108MA01ABCDZI")).toThrow(
        "非法的统一社会信用代码"
      )
    })
  })

  describe("truncate", () => {
    it("超长字符串应添加省略号", () => {
      expect(truncate("这是一段很长的文本", 5)).toBe("这是一段很...")
    })

    it("未超长应原样返回", () => {
      expect(truncate("短文本", 10)).toBe("短文本")
    })

    it("刚好等于最大长度应原样返回", () => {
      expect(truncate("abcde", 5)).toBe("abcde")
    })

    it("空字符串应返回空", () => {
      expect(truncate("", 5)).toBe("")
    })

    it("应抛错：负数 maxLen", () => {
      expect(() => truncate("hello", -1)).toThrow("maxLen 必须非负")
    })

    it("maxLen=0 应只返回省略号", () => {
      expect(truncate("hello", 0)).toBe("...")
    })
  })
})
