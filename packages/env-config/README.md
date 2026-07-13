# @ps/env-config

> 环境配置包 — 环境变量加载、校验、预设管理。零内部依赖，通过 DI 注入与其他包解耦。

## 定位

- **层级**：第一层（零内部依赖）
- **运行环境**：universal（浏览器与 Node 均可）
- **依赖**：无任何 `@ps/` 包依赖
- **被依赖**：apps/api、apps/web（通过 DI 注入）

## 导出内容

### 配置加载（`loader`）

| 函数         | 说明                                                      |
| ------------ | --------------------------------------------------------- |
| `loadConfig` | 从环境变量加载配置，自动选择对应环境预设（mock/dev/prod） |

### 配置校验（`validator`）

| 函数             | 说明                               |
| ---------------- | ---------------------------------- |
| `validateConfig` | 校验配置对象完整性                 |
| `assertConfig`   | 断言必填字段存在，否则抛出详细错误 |

### 环境预设（`presets/`）

| 导出         | 说明              | 环境变量                 |
| ------------ | ----------------- | ------------------------ |
| `mockPreset` | Mock 开发环境预设 | `VITE_ENV=mock` 或不设置 |
| `devPreset`  | 连接本地开发 API  | `VITE_ENV=dev`           |
| `prodPreset` | 生产环境预设      | `VITE_ENV=prod`          |

### 类型定义（`types`）

| 导出                | 说明                                        |
| ------------------- | ------------------------------------------- |
| `AppConfig`         | 完整配置接口                                |
| `AppEnv`            | `"mock"` / `"dev"` / `"prod"`               |
| `LoadConfigOptions` | loadConfig 选项                             |
| `LogLevel`          | `"debug"` / `"info"` / `"warn"` / `"error"` |
| `ENV_KEY_MAP`       | 环境变量名 → 配置字段映射常量               |

## 使用示例

```ts
import { loadConfig } from "@ps/env-config"

// 自动读取环境变量，选择对应预设
const config = loadConfig()
// config = { env: "mock", appName: "采购管理系统", logLevel: "dev", supabaseUrl: "...", ... }
```

## 设计要点

- **不依赖 @ps/log**：配置加载在前，日志初始化在后。`@ps/log` 通过 DI 注入方式接收 `config.logLevel`
- **不依赖 @ps/db**：数据库客户端由 `apps/api` 根据 `config.env` 选择真实或 Mock
- **预设分层**：mock/dev/prod 三种环境，各自维护独立的默认值

## 环境变量

| 变量                | 必填     | 说明                                 |
| ------------------- | -------- | ------------------------------------ |
| `VITE_ENV`          | 否       | `mock` / `dev` / `prod`（默认 mock） |
| `VITE_API_BASE`     | dev/prod | API 基础 URL                         |
| `SUPABASE_URL`      | dev/prod | Supabase 实例 URL                    |
| `SUPABASE_ANON_KEY` | dev/prod | Supabase 匿名 Key                    |

## 开发命令

```bash
pnpm --filter @ps/env-config build
pnpm --filter @ps/env-config typecheck
pnpm --filter @ps/env-config test
pnpm --filter @ps/env-config lint
```
