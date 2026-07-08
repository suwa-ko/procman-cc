/**
 * 日志类型定义
 */

/** 日志级别（数值越大，优先级越高） */
export enum LogLevel {
  Debug = 10,
  Info = 20,
  Warn = 30,
  Error = 40,
}

/** 日志级别名称 */
export type LogLevelName = "debug" | "info" | "warn" | "error"

/** 日志配置 */
export interface LoggerConfig {
  /** 最低日志级别，低于此级别的日志被丢弃 */
  level: LogLevel
  /** 是否启用敏感字段脱敏（默认 true） */
  enableMasking?: boolean
}

/** 日志条目 */
export interface LogEntry {
  /** 时间戳（ISO 8601） */
  timestamp: string
  /** 日志级别 */
  level: LogLevel
  /** 级别名称 */
  levelName: LogLevelName
  /** 消息 */
  message: string
  /** 附加上下文 */
  context?: Record<string, unknown>
}

/**
 * Transport 接口（扩展点）
 * 一期仅实现 ConsoleTransport，预留接口供后续扩展
 */
export interface LogTransport {
  /** 写入日志条目 */
  write: (entry: LogEntry) => void
}

/** 日志级别与名称的映射 */
export const LEVEL_NAMES: Record<LogLevel, LogLevelName> = {
  [LogLevel.Debug]: "debug",
  [LogLevel.Info]: "info",
  [LogLevel.Warn]: "warn",
  [LogLevel.Error]: "error",
}

/** 日志名称与级别的映射 */
export const LEVEL_VALUES: Record<LogLevelName, LogLevel> = {
  debug: LogLevel.Debug,
  info: LogLevel.Info,
  warn: LogLevel.Warn,
  error: LogLevel.Error,
}
