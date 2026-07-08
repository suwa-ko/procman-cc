import { describe, it, expect } from "vitest"

import {
  LogLevel,
  LEVEL_NAMES,
  LEVEL_VALUES,
  type LogLevelName,
} from "../types"

describe("types", () => {
  describe("LogLevel", () => {
    it("Debug 应为 10", () => {
      expect(LogLevel.Debug).toBe(10)
    })

    it("Info 应为 20", () => {
      expect(LogLevel.Info).toBe(20)
    })

    it("Warn 应为 30", () => {
      expect(LogLevel.Warn).toBe(30)
    })

    it("Error 应为 40", () => {
      expect(LogLevel.Error).toBe(40)
    })

    it("级别应有正确顺序：Debug < Info < Warn < Error", () => {
      expect(LogLevel.Debug).toBeLessThan(LogLevel.Info)
      expect(LogLevel.Info).toBeLessThan(LogLevel.Warn)
      expect(LogLevel.Warn).toBeLessThan(LogLevel.Error)
    })
  })

  describe("LEVEL_NAMES", () => {
    it("应正确映射 Debug", () => {
      expect(LEVEL_NAMES[LogLevel.Debug]).toBe("debug")
    })

    it("应正确映射 Info", () => {
      expect(LEVEL_NAMES[LogLevel.Info]).toBe("info")
    })

    it("应正确映射 Warn", () => {
      expect(LEVEL_NAMES[LogLevel.Warn]).toBe("warn")
    })

    it("应正确映射 Error", () => {
      expect(LEVEL_NAMES[LogLevel.Error]).toBe("error")
    })
  })

  describe("LEVEL_VALUES", () => {
    it("应正确反向映射 debug", () => {
      expect(LEVEL_VALUES.debug).toBe(LogLevel.Debug)
    })

    it("应正确反向映射 info", () => {
      expect(LEVEL_VALUES.info).toBe(LogLevel.Info)
    })

    it("应正确反向映射 warn", () => {
      expect(LEVEL_VALUES.warn).toBe(LogLevel.Warn)
    })

    it("应正确反向映射 error", () => {
      expect(LEVEL_VALUES.error).toBe(LogLevel.Error)
    })

    it("LEVEL_NAMES 与 LEVEL_VALUES 应互逆", () => {
      const names: LogLevelName[] = ["debug", "info", "warn", "error"]
      for (const name of names) {
        const level = LEVEL_VALUES[name]
        expect(LEVEL_NAMES[level]).toBe(name)
      }
    })
  })
})
