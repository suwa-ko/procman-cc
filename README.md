# 采购管理系统

> 单人开发 + AI 协作的极简采购管理系统。通过 pnpm workspace monorepo 强制约束依赖方向，避免跨层引用与环境污染，保证代码精简、可控、可快速落地。

## 技术栈

| 层面   | 选型                       |
| ------ | -------------------------- |
| 语言   | TypeScript（严格模式）     |
| 包管理 | pnpm + workspace + catalog |
| 前端   | React + Vite               |
| 后端   | Hono（Node.js）            |
| 数据库 | Supabase（PostgreSQL）     |
| PDF    | Puppeteer                  |
| 模板   | Handlebars                 |
| Mock   | MSW + Faker                |
| 校验   | Zod                        |
| 测试   | Vitest                     |
| Lint   | ESLint + Prettier + dpdm   |

## 包结构

```
packages/
├── types-base/    # 基础类型（universal，零内部依赖）
├── utils/         # 纯函数工具（universal，零内部依赖）
├── contracts/     # API 契约 / DTO / Zod schema（universal，规划中）
├── env-config/    # 环境配置（universal，规划中）
├── log/           # 日志（universal，零内部依赖）
├── db/            # Supabase 数据访问层（node）
├── pdf/           # PDF 生成（node，规划中）
├── mock/          # Mock 数据工厂（universal，规划中）
└── web-kit/       # 前端能力包：请求 + Hooks + UI（browser）

apps/
├── web/           # 前端应用（规划中）
└── api/           # 后端服务（规划中）
```

### 分层依赖（自下而上，严格单向）

```
第一层（零内部依赖）：@ps/types-base  @ps/utils  @ps/env-config  @ps/log
第二层：              @ps/contracts  @ps/mock
第三层：              @ps/db  @ps/pdf
第四层：              @ps/web-kit
业务层：              apps/web  apps/api
```

依赖方向通过 ESLint（`eslint-plugin-import`）与 `dpdm` 双重校验，下层包引用上层包即报错。

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 9.0.0

### 安装

```bash
pnpm install
```

### 开发

```bash
pnpm dev                  # 全部包并行开发
pnpm --filter @ps/web dev # 仅前端
pnpm --filter @ps/api dev # 仅后端
```

## 常用命令

```bash
# 构建
pnpm build                       # 全量构建
pnpm --filter <pkg> build        # 单包构建

# 校验
pnpm typecheck                   # 全量类型检查
pnpm lint                        # 全量 lint（含依赖方向）
pnpm check:circular              # 循环依赖检测
pnpm test                        # 全量测试

# 格式化
pnpm format                      # 格式化全部代码
pnpm format:check                # 检查格式（不修改）

# 单包操作
pnpm --filter <pkg> build
pnpm --filter <pkg> test
pnpm --filter <pkg> lint
pnpm --filter <pkg> typecheck
```

## 单包交付验收标准

每个 package 开发完成后，必须通过以下四要素（缺一不可）：

| 验收项   | 命令                            | 要求                         |
| -------- | ------------------------------- | ---------------------------- |
| 构建通过 | `pnpm --filter <pkg> build`     | Vite 产物 + `.d.ts` 正常生成 |
| 类型安全 | `pnpm --filter <pkg> typecheck` | 严格模式通过，无隐式 any     |
| 测试通过 | `pnpm --filter <pkg> test`      | 核心功能覆盖，全量用例通过   |
| 代码规范 | `pnpm --filter <pkg> lint`      | ESLint 无错误、无警告        |

补充：所有包必须通过 `pnpm check:circular` 循环依赖检测。

## 核心设计约定

### 依赖注入

`@ps/log` 与 `@ps/env-config` 之间无直接引用，通过 apps 层依赖注入连接，避免初始化死循环：

```ts
// apps/api 启动时
import { loadConfig } from "@ps/env-config"
import { createLogger } from "@ps/log"
import { createDbClient } from "@ps/db"

const config = loadConfig()
const logger = createLogger({ level: config.logLevel })
const db = createDbClient(config, logger)
```

`@ps/web-kit` 的 fetch 客户端 baseURL 同样由 apps 层注入，不自行读取 env-config。

### 三层职责边界

| 层级           | 位置                       | 职责                     | 禁止行为                         |
| -------------- | -------------------------- | ------------------------ | -------------------------------- |
| db 层          | `@ps/db` repositories      | 原子数据 CRUD + 查询封装 | 不含任何业务规则与判断           |
| api service 层 | `apps/api` services        | 业务规则唯一承载层       | 不直接操作数据库细节，通过 db 层 |
| 前端层         | `apps/web` + `@ps/web-kit` | 表单校验 + 交互逻辑      | 不实现核心业务规则，以后端为准   |

### 统一响应结构

所有 API 响应遵循 `ApiResponse<T>`：

```ts
// 成功
{ code: 0, data: T, message: "ok" }
// 失败
{ code: <业务错误码>, data: null, message: "错误描述" }
```

## 文档索引

| 文件                                  | 用途                             |
| ------------------------------------- | -------------------------------- |
| `.trae/documents/产品需求文档.md`     | 业务需求、数据模型、校验规则     |
| `.trae/documents/工程结构设计文档.md` | 完整架构设计、依赖矩阵、实施路径 |
| `.trae/rules/project_rules.md`        | 项目规则（AI 强制约束）          |
