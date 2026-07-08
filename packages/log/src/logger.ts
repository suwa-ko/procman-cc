/**
 * 日志核心实现
 */
import { maskSensitive } from "./sensitive"
import { ConsoleTransport } from "./transports/console"
import {
  LogLevel,
  LEVEL_NAMES,
  LEVEL_VALUES,
  type LoggerConfig,
  type LogEntry,
  type LogTransport,
  type LogLevelName,
} from "./types"

/**
 * 统一日志接口
 *
 * 设计原则：
 * - 零内部依赖（不引用 @ps/env-config）
 * - 日志级别通过 createLogger(config) 注入
 * - 一期仅支持控制台输出
 * - 自动脱敏敏感字段
 */
export class Logger {
  private readonly config: Required<LoggerConfig>
  private readonly transports: LogTransport[]

  constructor(config: LoggerConfig, transports?: LogTransport[]) {
    this.config = {
      level: config.level,
      enableMasking: config.enableMasking ?? true,
    }
    this.transports = transports ?? [new ConsoleTransport()]
  }

  /** Debug 级别日志 */
  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.Debug, message, context)
  }

  /** Info 级别日志 */
  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.Info, message, context)
  }

  /** Warn 级别日志 */
  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.Warn, message, context)
  }

  /** Error 级别日志 */
  error(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.Error, message, context)
  }

  /**
   * 获取当前日志级别
   */
  getLevel(): LogLevel {
    return this.config.level
  }

  /**
   * 添加自定义 transport（扩展点，一期通常不使用）
   */
  addTransport(transport: LogTransport): void {
    this.transports.push(transport)
  }

  /**
   * 判断指定级别是否可输出
   */
  private isLevelEnabled(level: LogLevel): boolean {
    return level >= this.config.level
  }

  /**
   * 构造日志条目并写入所有 transport
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>
  ): void {
    if (!this.isLevelEnabled(level)) {
      return
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      levelName: LEVEL_NAMES[level],
      message,
      context:
        context !== undefined && this.config.enableMasking
          ? maskSensitive(context)
          : context,
    }

    for (const transport of this.transports) {
      transport.write(entry)
    }
  }
}

/**
 * 创建 Logger 实例的工厂函数
 *
 * @param config 日志配置
 * @example
 * const logger = createLogger({ level: LogLevel.Info })
 * logger.info("服务启动", { port: 3000 })
 */
export function createLogger(config: LoggerConfig): Logger {
  return new Logger(config)
}

/**
 * 从级别名称创建 Logger
 *
 * @param levelName 日志级别名称（debug/info/warn/error）
 * @example
 * const logger = createLoggerByName("info")
 */
export function createLoggerByName(levelName: LogLevelName): Logger {
  return new Logger({ level: LEVEL_VALUES[levelName] })
}
