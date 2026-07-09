# @ps/log

> 统一日志包 — 四级日志 + 控制台输出 + 敏感字段自动脱敏。

## 定位

- **层级**：第一层（零内部依赖）
- **运行环境**：universal（浏览器与 Node 均可）
- **依赖**：无任何 `@ps/` 包依赖
- **重要约束**：禁止引用 `@ps/env-config`，日志级别通过 `createLogger(config)` 注入，避免初始化死循环

## 导出内容

### 核心 API

| 导出                 | 说明                                                  |
| -------------------- | ----------------------------------------------------- |
| `createLogger`       | 工厂函数，通过 `LoggerConfig` 创建 Logger 实例        |
| `createLoggerByName` | 通过级别名称（debug/info/warn/error）创建 Logger      |
| `Logger`             | 日志类，提供 `debug` / `info` / `warn` / `error` 方法 |
| `ConsoleTransport`   | 控制台输出 Transport（默认）                          |
| `LogLevel`           | 日志级别枚举（Debug=10, Info=20, Warn=30, Error=40）  |

### 敏感字段脱敏

| 导出             | 说明                                     |
| ---------------- | ---------------------------------------- |
| `maskSensitive`  | 对对象中的敏感字段值替换为 `***`         |
| `isSensitiveKey` | 判断字段名是否为敏感字段（不区分大小写） |

默认脱敏字段：`password`、`passwd`、`token`、`secret`、`apikey`、`api_key`、`privatekey`、`private_key`、`authorization`、`cookie`。

### 扩展点

`LogTransport` 接口预留扩展，后续可接入文件、远程日志等 Transport：

```ts
export interface LogTransport {
  write: (entry: LogEntry) => void
}
```

## 使用示例

```ts
import { createLogger, LogLevel } from "@ps/log"

const logger = createLogger({ level: LogLevel.Info })

logger.info("服务启动", { port: 3000 })
logger.error("数据库连接失败", { host: "db.example.com", error: "timeout" })

// 敏感字段自动脱敏：context 输出为 { token: "***" }
logger.info("用户登录", { userId: "1", token: "abc-xyz-123" })
```

### 在 apps 层注入配置

```ts
// apps/api 启动时（依赖注入）
import { loadConfig } from "@ps/env-config"
import { createLogger, LogLevel } from "@ps/log"

const config = loadConfig()
const logger = createLogger({ level: config.logLevel })
```

## 日志输出格式

控制台输出格式：

```
[2026-07-09T08:00:00.000Z] [INFO] 服务启动 { port: 3000 }
[2026-07-09T08:00:01.000Z] [ERROR] 数据库连接失败 { host: 'db.example.com', error: 'timeout' }
```

## 开发命令

```bash
pnpm --filter @ps/log build       # 构建
pnpm --filter @ps/log typecheck   # 类型检查
pnpm --filter @ps/log test        # 测试
pnpm --filter @ps/log lint        # lint
```
