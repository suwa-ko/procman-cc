import { describe, it, expect, vi, beforeEach } from "vitest"

import { Logger, createLogger, createLoggerByName } from "../logger"
import { LogLevel, type LogEntry, type LogTransport } from "../types"

/**
 * 模拟 Transport，用于测试日志条目内容
 */
class MockTransport implements LogTransport {
  public entries: LogEntry[] = []

  write(entry: LogEntry): void {
    this.entries.push(entry)
  }
}

describe("logger", () => {
  describe("Logger", () => {
    it("应能创建实例并记录日志", () => {
      const transport = new MockTransport()
      const logger = new Logger({ level: LogLevel.Debug }, [transport])
      logger.info("测试消息")
      expect(transport.entries).toHaveLength(1)
      expect(transport.entries[0]?.message).toBe("测试消息")
    })

    it("getLevel 应返回当前级别", () => {
      const logger = new Logger({ level: LogLevel.Warn })
      expect(logger.getLevel()).toBe(LogLevel.Warn)
    })
  })

  describe("日志级别过滤", () => {
    it("level=Debug 时应记录所有级别", () => {
      const transport = new MockTransport()
      const logger = new Logger({ level: LogLevel.Debug }, [transport])
      logger.debug("d")
      logger.info("i")
      logger.warn("w")
      logger.error("e")
      expect(transport.entries).toHaveLength(4)
    })

    it("level=Info 时应过滤 Debug", () => {
      const transport = new MockTransport()
      const logger = new Logger({ level: LogLevel.Info }, [transport])
      logger.debug("d")
      logger.info("i")
      logger.warn("w")
      logger.error("e")
      expect(transport.entries).toHaveLength(3)
      expect(transport.entries.map((e) => e.levelName)).toEqual([
        "info",
        "warn",
        "error",
      ])
    })

    it("level=Warn 时应过滤 Debug 和 Info", () => {
      const transport = new MockTransport()
      const logger = new Logger({ level: LogLevel.Warn }, [transport])
      logger.debug("d")
      logger.info("i")
      logger.warn("w")
      logger.error("e")
      expect(transport.entries).toHaveLength(2)
      expect(transport.entries.map((e) => e.levelName)).toEqual([
        "warn",
        "error",
      ])
    })

    it("level=Error 时应只记录 Error", () => {
      const transport = new MockTransport()
      const logger = new Logger({ level: LogLevel.Error }, [transport])
      logger.debug("d")
      logger.info("i")
      logger.warn("w")
      logger.error("e")
      expect(transport.entries).toHaveLength(1)
      expect(transport.entries[0]?.levelName).toBe("error")
    })
  })

  describe("日志条目内容", () => {
    it("应包含时间戳、级别、消息", () => {
      const transport = new MockTransport()
      const logger = new Logger({ level: LogLevel.Info }, [transport])
      const before = Date.now()
      logger.info("测试", { key: "value" })
      const after = Date.now()
      expect(transport.entries[0]).toBeDefined()
      const entry = transport.entries[0] as LogEntry
      expect(entry.message).toBe("测试")
      expect(entry.level).toBe(LogLevel.Info)
      expect(entry.levelName).toBe("info")
      const ts = new Date(entry.timestamp).getTime()
      expect(ts).toBeGreaterThanOrEqual(before)
      expect(ts).toBeLessThanOrEqual(after)
    })

    it("应携带 context", () => {
      const transport = new MockTransport()
      const logger = new Logger({ level: LogLevel.Info }, [transport])
      logger.info("带上下文", { userId: 123, action: "login" })
      expect(transport.entries[0]).toBeDefined()
      const entry = transport.entries[0] as LogEntry
      expect(entry.context).toEqual({ userId: 123, action: "login" })
    })

    it("无 context 时 entry.context 应为 undefined", () => {
      const transport = new MockTransport()
      const logger = new Logger({ level: LogLevel.Info }, [transport])
      logger.info("无上下文")
      expect(transport.entries[0]).toBeDefined()
      const entry = transport.entries[0] as LogEntry
      expect(entry.context).toBeUndefined()
    })
  })

  describe("敏感字段脱敏", () => {
    it("应自动脱敏 password", () => {
      const transport = new MockTransport()
      const logger = new Logger({ level: LogLevel.Info }, [transport])
      logger.info("登录", { username: "admin", password: "123456" })
      expect(transport.entries[0]).toBeDefined()
      const entry = transport.entries[0] as LogEntry
      expect(entry.context?.password).toBe("***")
      expect(entry.context?.username).toBe("admin")
    })

    it("应自动脱敏 token", () => {
      const transport = new MockTransport()
      const logger = new Logger({ level: LogLevel.Info }, [transport])
      logger.info("认证", { token: "abc123", userId: 1 })
      expect(transport.entries[0]).toBeDefined()
      const entry = transport.entries[0] as LogEntry
      expect(entry.context?.token).toBe("***")
      expect(entry.context?.userId).toBe(1)
    })

    it("enableMasking=false 时不应脱敏", () => {
      const transport = new MockTransport()
      const logger = new Logger(
        { level: LogLevel.Info, enableMasking: false },
        [transport]
      )
      logger.info("登录", { password: "123456" })
      expect(transport.entries[0]).toBeDefined()
      const entry = transport.entries[0] as LogEntry
      expect(entry.context?.password).toBe("123456")
    })
  })

  describe("多 Transport", () => {
    it("应同时写入多个 transport", () => {
      const t1 = new MockTransport()
      const t2 = new MockTransport()
      const logger = new Logger({ level: LogLevel.Info }, [t1, t2])
      logger.info("广播")
      expect(t1.entries).toHaveLength(1)
      expect(t2.entries).toHaveLength(1)
      expect(t1.entries[0]?.message).toBe("广播")
      expect(t2.entries[0]?.message).toBe("广播")
    })

    it("addTransport 应动态添加 transport", () => {
      const transport = new MockTransport()
      const logger = new Logger({ level: LogLevel.Info })
      logger.info("第一条")
      logger.addTransport(transport)
      logger.info("第二条")
      expect(transport.entries).toHaveLength(1)
      expect(transport.entries[0]?.message).toBe("第二条")
    })
  })

  describe("createLogger", () => {
    it("应创建 Logger 实例", () => {
      const logger = createLogger({ level: LogLevel.Info })
      expect(logger).toBeInstanceOf(Logger)
      expect(logger.getLevel()).toBe(LogLevel.Info)
    })
  })

  describe("createLoggerByName", () => {
    it("应从 'debug' 创建", () => {
      const logger = createLoggerByName("debug")
      expect(logger.getLevel()).toBe(LogLevel.Debug)
    })

    it("应从 'info' 创建", () => {
      const logger = createLoggerByName("info")
      expect(logger.getLevel()).toBe(LogLevel.Info)
    })

    it("应从 'warn' 创建", () => {
      const logger = createLoggerByName("warn")
      expect(logger.getLevel()).toBe(LogLevel.Warn)
    })

    it("应从 'error' 创建", () => {
      const logger = createLoggerByName("error")
      expect(logger.getLevel()).toBe(LogLevel.Error)
    })
  })

  describe("ConsoleTransport 集成", () => {
    beforeEach(() => {
      vi.restoreAllMocks()
    })

    it("默认使用 ConsoleTransport 输出", () => {
      const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {})
      const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {})
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {})

      const logger = createLogger({ level: LogLevel.Debug })
      logger.debug("d")
      logger.info("i")
      logger.warn("w")
      logger.error("e")

      expect(debugSpy).toHaveBeenCalledOnce()
      expect(infoSpy).toHaveBeenCalledOnce()
      expect(warnSpy).toHaveBeenCalledOnce()
      expect(errorSpy).toHaveBeenCalledOnce()
    })

    it("info 级别应调用 console.info 而非 console.debug", () => {
      const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {})
      const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {})

      const logger = createLogger({ level: LogLevel.Info })
      logger.debug("不应输出")
      logger.info("应输出")

      expect(debugSpy).not.toHaveBeenCalled()
      expect(infoSpy).toHaveBeenCalledOnce()
    })
  })
})
