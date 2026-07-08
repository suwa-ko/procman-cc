import { describe, it, expect } from "vitest"

import {
  generateCode,
  parseCode,
  isValidCode,
  CODE_PREFIXES,
  type CodePrefix,
} from "../code-generator"

describe("code-generator", () => {
  describe("generateCode", () => {
    it("应正确生成 SUP-2026-0001", () => {
      expect(generateCode("SUP", 2026, 1)).toBe("SUP-2026-0001")
    })

    it("应正确补零到 4 位", () => {
      expect(generateCode("MAT", 2026, 1)).toBe("MAT-2026-0001")
      expect(generateCode("MAT", 2026, 10)).toBe("MAT-2026-0010")
      expect(generateCode("MAT", 2026, 100)).toBe("MAT-2026-0100")
      expect(generateCode("MAT", 2026, 1000)).toBe("MAT-2026-1000")
    })

    it("应支持所有合法前缀", () => {
      CODE_PREFIXES.forEach((prefix: CodePrefix) => {
        const code = generateCode(prefix, 2026, 1)
        expect(code).toBe(`${prefix}-2026-0001`)
      })
    })

    it("应支持最大流水号 9999", () => {
      expect(generateCode("CTT", 2026, 9999)).toBe("CTT-2026-9999")
    })

    it("应抛错：非法前缀", () => {
      expect(() => generateCode("XXX" as CodePrefix, 2026, 1)).toThrow(
        "非法的编码前缀"
      )
    })

    it("应抛错：年份小于 2000", () => {
      expect(() => generateCode("SUP", 1999, 1)).toThrow("非法的年份")
    })

    it("应抛错：年份大于 9999", () => {
      expect(() => generateCode("SUP", 10000, 1)).toThrow("非法的年份")
    })

    it("应抛错：流水号为 0", () => {
      expect(() => generateCode("SUP", 2026, 0)).toThrow("非法的流水号")
    })

    it("应抛错：流水号超过 9999", () => {
      expect(() => generateCode("SUP", 2026, 10000)).toThrow("超过上限")
    })

    it("应抛错：负流水号", () => {
      expect(() => generateCode("SUP", 2026, -1)).toThrow("非法的流水号")
    })
  })

  describe("parseCode", () => {
    it("应正确解析 SUP-2026-0001", () => {
      expect(parseCode("SUP-2026-0001")).toEqual({
        prefix: "SUP",
        year: 2026,
        seq: 1,
      })
    })

    it("应正确解析 CTT-2026-0042", () => {
      expect(parseCode("CTT-2026-0042")).toEqual({
        prefix: "CTT",
        year: 2026,
        seq: 42,
      })
    })

    it("应抛错：格式错误（只有 2 段）", () => {
      expect(() => parseCode("SUP-2026")).toThrow("非法的编码格式")
    })

    it("应抛错：非法前缀", () => {
      expect(() => parseCode("XXX-2026-0001")).toThrow("非法的编码前缀")
    })

    it("应抛错：非法年份", () => {
      expect(() => parseCode("SUP-ABCD-0001")).toThrow("非法的年份")
    })

    it("应抛错：非法流水号", () => {
      expect(() => parseCode("SUP-2026-00XX")).toThrow("非法的流水号")
    })
  })

  describe("isValidCode", () => {
    it("合法编码应返回 true", () => {
      expect(isValidCode("SUP-2026-0001")).toBe(true)
      expect(isValidCode("CTT-2026-9999")).toBe(true)
    })

    it("非法编码应返回 false", () => {
      expect(isValidCode("SUP-2026")).toBe(false)
      expect(isValidCode("XXX-2026-0001")).toBe(false)
      expect(isValidCode("SUP-ABCD-0001")).toBe(false)
      expect(isValidCode("")).toBe(false)
      expect(isValidCode("SUP-2026-10000")).toBe(false)
    })
  })

  describe("generateCode 与 parseCode 互逆", () => {
    it("生成的编码应能被正确解析", () => {
      const prefix: CodePrefix = "PRC"
      const year = 2026
      const seq = 123
      const code = generateCode(prefix, year, seq)
      const parsed = parseCode(code)
      expect(parsed).toEqual({ prefix, year, seq })
    })
  })
})
