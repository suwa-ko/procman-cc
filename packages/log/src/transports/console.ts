/**
 * 控制台 Transport
 * 一期唯一实现的 Transport
 */
import { LogLevel } from "../types"
import type { LogEntry, LogTransport } from "../types"

/**
 * 控制台日志输出
 * 根据日志级别调用对应的 console 方法
 */
export class ConsoleTransport implements LogTransport {
  write(entry: LogEntry): void {
    const { level, message, context, timestamp } = entry
    const prefix = `[${timestamp}] [${entry.levelName.toUpperCase()}]`
    const fullMessage =
      context !== undefined ? `${prefix} ${message}` : `${prefix} ${message}`

    switch (level) {
      case LogLevel.Debug:
        console.debug(fullMessage, context ?? "")
        break
      case LogLevel.Info:
        console.info(fullMessage, context ?? "")
        break
      case LogLevel.Warn:
        console.warn(fullMessage, context ?? "")
        break
      case LogLevel.Error:
        console.error(fullMessage, context ?? "")
        break
      default:
        console.log(fullMessage, context ?? "")
    }
  }
}
