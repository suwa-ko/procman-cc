# 采购管理系统 — 项目规则文件

> 本文件为 Trae IDE 项目规则，AI agent 在执行任何编码任务前必须阅读并遵守。
> 详细架构参见 `.trae/documents/工程结构设计文档.md`，业务需求参见 `.trae/documents/产品需求文档.md`。

---

## 1. 项目定位

- **类型**：单人开发 + AI 协作的极简采购管理系统
- **架构**：pnpm workspace monorepo，前后端分离
- **四大原则**：精简、可控、防 AI 出错、快速落地
- **核心目的**：通过 monorepo 强制约束依赖方向，避免 AI 写出依赖反转、跨层引用、环境污染代码

---

## 2. 技术栈

| 层面   | 选型                                            |
| ------ | ----------------------------------------------- |
| 语言   | TypeScript（严格模式）                          |
| 包管理 | pnpm + workspace                                |
| 前端   | React + Vite                                    |
| 后端   | Hono（Node.js）                                 |
| 数据库 | Supabase（PostgreSQL）                          |
| PDF    | Puppeteer                                       |
| 模板   | Handlebars                                      |
| Mock   | MSW + Faker                                     |
| 构建   | Vite + vite-plugin-dts（库模式）                |
| 测试   | Vitest                                          |
| 校验   | Zod                                             |
| Lint   | ESLint + Prettier + eslint-plugin-import + dpdm |

---

## 3. 包结构与依赖方向（铁则）

### 3.1 包列表（13 个 packages + 2 个 apps）

```
packages/
├── types-base/    # 基础类型（universal，零内部依赖）
├── utils/         # 纯函数工具（universal，零内部依赖）
├── contracts/     # API 契约 / DTO / 枚举 / Zod schema（universal）
├── env-config/    # 环境配置（universal，零内部依赖）
├── log/           # 日志（universal，零内部依赖）
├── model/         # 纯 Zod Schema + 领域枚举（universal，仅依赖 zod + types-base）
├── model-core/    # 泛型仓储契约 / 注册表 / 实体映射（universal，依赖 model）
├── db/            # Supabase 数据访问层（node）
├── pdf/           # PDF 生成（node）
├── mock/          # Mock 数据工厂（universal）
├── web-kit/       # 前端能力包：请求 + Hooks + UI 组件（browser）
├── hooks-core/    # 前端 Hook 基础库（browser，依赖 web-kit）
└── hooks-business/ # 业务 CRUD Hooks（browser，依赖 hooks-core + contracts）

apps/
├── web/           # 前端应用（browser）
└── api/           # 后端服务（node）
```

### 3.2 分层依赖（自下而上，严格单向）

```
第一层（零内部依赖）：@ps/types-base  @ps/utils  @ps/env-config  @ps/log
第二层：@ps/model  @ps/contracts  @ps/model-core  @ps/mock
第三层：@ps/db  @ps/pdf
第四层：@ps/web-kit  @ps/hooks-core
第五层：@ps/hooks-business
业务层：apps/web  apps/api
```

### 3.3 依赖方向强制规则（违反即报错）

| 规则 | 内容                                                                                  |
| ---- | ------------------------------------------------------------------------------------- |
| R-01 | `@ps/types-base`、`@ps/utils`、`@ps/env-config`、`@ps/log` 禁止引用任何其他 `@ps/` 包 |
| R-02 | `@ps/contracts`、`@ps/mock` 禁止引用 `@ps/db`、`@ps/pdf`、`@ps/web-kit` 及 apps       |
| R-03 | `@ps/web-kit` 禁止引用 `@ps/db`、`@ps/pdf`（Node 专属包）                             |
| R-04 | `apps/web` 禁止引用 `@ps/db`、`@ps/pdf`                                               |
| R-05 | 所有包之间禁止循环依赖（dpdm 检测）                                                   |
| R-06 | 前端包禁止使用 Node.js 全局变量（`process`、`Buffer` 等）                             |
| R-07 | `@ps/log` 禁止引用 `@ps/env-config`（通过依赖注入连接）                               |

### 3.4 运行环境属性

| 包         | 环境      | 包       | 环境      |
| ---------- | --------- | -------- | --------- |
| types-base | universal | db       | node      |
| utils      | universal | pdf      | node      |
| contracts  | universal | mock     | universal |
| env-config | universal | web-kit  | browser   |
| log        | universal | apps/web | browser   |
|            |           | apps/api | node      |

> universal = 浏览器与 Node 均可；node = 服务端专用；browser = 前端专用

---

## 4. 依赖注入约定

### 4.1 env-config 与 log 的连接

`@ps/env-config` 与 `@ps/log` 之间**无直接引用**，通过 apps 层依赖注入连接：

```ts
// apps/api/src/index.ts 或 apps/web/src/main.tsx
import { loadConfig } from "@ps/env-config"
import { createLogger } from "@ps/log"

const config = loadConfig()
const logger = createLogger({ level: config.logLevel })
```

**禁止**：在 `@ps/log` 内部 import `@ps/env-config`，避免初始化死循环。

### 4.2 web-kit 的 baseURL 注入

`@ps/web-kit` 的 fetch 客户端 baseURL 由 apps 层注入，不自行读取 env-config：

```ts
// apps/web 启动时
import { loadConfig } from "@ps/env-config"
import { setupHttpClient } from "@ps/web-kit"

const config = loadConfig()
setupHttpClient({ baseURL: config.apiBaseUrl })
```

### 4.3 db client 的配置注入

```ts
// apps/api 启动时
import { loadConfig } from "@ps/env-config"
import { createLogger } from "@ps/log"
import { createDbClient } from "@ps/db"

const config = loadConfig()
const logger = createLogger({ level: config.logLevel })
const db = createDbClient(config, logger)
```

---

## 5. 三层职责边界（铁则）

| 层级               | 位置                       | 职责                     | 禁止行为                         |
| ------------------ | -------------------------- | ------------------------ | -------------------------------- |
| **db 层**          | `@ps/db` repositories      | 原子数据 CRUD + 查询封装 | 不含任何业务规则与判断           |
| **api service 层** | `apps/api` services        | 业务规则唯一承载层       | 不直接操作数据库细节，通过 db 层 |
| **前端层**         | `apps/web` + `@ps/web-kit` | 表单校验 + 交互逻辑      | 不实现核心业务规则，以后端为准   |

### 5.1 业务规则落地点

| 规则         | 位置                  | 说明                                 |
| ------------ | --------------------- | ------------------------------------ |
| 定价自动失效 | `price.service.ts`    | 数据库事务原子性将旧有效定价置为失效 |
| 合同数据锁定 | `contract.service.ts` | 生效时设置只读标记，后续修改接口拦截 |
| 编码生成规则 | `code.service.ts`     | 「前缀 + 年份 + 流水号」全局一致     |

### 5.2 db 层人员模块特殊约束

- `person.repo.ts` **仅提供查询 + 冗余同步**，不提供新增/编辑/删除
- 人员主数据来自外部系统，本系统仅存「人员唯一标识、姓名」冗余字段

---

## 6. 代码风格规范

### 6.1 命名规范

| 对象       | 规范               | 示例                     |
| ---------- | ------------------ | ------------------------ |
| package 名 | `@ps/kebab-case`   | `@ps/web-kit`            |
| 文件名     | `kebab-case.ts`    | `supplier.repo.ts`       |
| 组件文件名 | `PascalCase/`      | `SupplierForm/index.tsx` |
| 变量/函数  | `camelCase`        | `createSupplier`         |
| 类型/接口  | `PascalCase`       | `SupplierDTO`            |
| 枚举       | `PascalCase`       | `SupplierStatus`         |
| 常量       | `UPPER_SNAKE_CASE` | `CODE_PREFIX`            |
| Hook       | `useCamelCase`     | `useQuery`               |

### 6.2 DTO 命名后缀

| 后缀       | 用途         | 示例                    |
| ---------- | ------------ | ----------------------- |
| `DTO`      | 数据传输对象 | `SupplierDTO`           |
| `Request`  | 请求体       | `CreateSupplierRequest` |
| `Response` | 响应体       | `SupplierListResponse`  |
| `Params`   | 查询参数     | `SupplierQueryParams`   |

### 6.3 导入顺序（强制）

```ts
// 1. Node.js / 浏览器内置模块（node: 前缀）
import path from "node:path"

// 2. 外部依赖（npm 包）
import { createClient } from "@supabase/supabase-js"
import { z } from "zod"

// 3. 内部 @ps/ 包（按字母序）
import { SupplierStatus } from "@ps/contracts"
import { createLogger } from "@ps/log"
import { ApiResponse } from "@ps/types-base"

// 4. 相对路径
import { BaseRepository } from "./base-repository"
```

每组之间空一行，组内按字母序排列。

### 6.4 TypeScript 严格规则（ESLint 强制校验）

以下规则已通过 ESLint 强制校验，违反即报错：

**类型安全（铁则）**

- 开启 `strict: true`、`noUncheckedIndexedAccess: true`
- **禁止 `any`**：`@typescript-eslint/no-explicit-any` = error
- **禁止 any 赋值**：`@typescript-eslint/no-unsafe-assignment` = error
- **禁止 any 成员访问**：`@typescript-eslint/no-unsafe-member-access` = error
- **禁止 any 函数调用**：`@typescript-eslint/no-unsafe-call` = error
- **禁止 any 返回值**：`@typescript-eslint/no-unsafe-return` = error
- **禁止 any 参数**：`@typescript-eslint/no-unsafe-argument` = error
- **禁止非空断言 `!`**：`@typescript-eslint/no-non-null-assertion` = error（强制处理 null/undefined）
- **禁止 `@ts-ignore`**，必须修复类型错误；确需绕过时用 `@ts-expect-error` 并写明原因

**类型定义规范**

- 导出函数必须有显式返回类型：`@typescript-eslint/explicit-function-return-type` = error
- 导出函数参数必须显式类型：`@typescript-eslint/explicit-module-boundary-types` = error
- 优先用 `interface` 定义对象形状：`@typescript-eslint/consistent-type-definitions` = error
- `type` 仅用于联合/交叉/工具类型
- 数组必须用 `T[]` 而非 `Array<T>`：`@typescript-eslint/array-type` = error
- 类型导入与值导入分离：`@typescript-eslint/consistent-type-imports` = error
- 枚举优先用字符串值：`enum SupplierStatus { Active = 'active' }`
- 类成员必须按顺序排列：static > 实例字段 > constructor > 实例方法（`@typescript-eslint/member-ordering` = error）

**import 严格规则**

- 导入顺序强制：内置 > 外部 > 内部 > 父级 > 兄弟 > 索引，组间空行，组内字母序
- **禁止默认导出**：`import/no-default-export` = error（统一命名导出）
- **禁止循环引用**：`import/no-cycle` = error（maxDepth: 10）
- **禁止未声明的依赖**：`import/no-extraneous-dependencies` = error
- **禁止重复导入**：`import/no-duplicates` = error
- **禁止 require**：`import/no-commonjs` = error（统一 ESM）
- **禁止自引用**：`import/no-self-import` = error
- **禁止绝对路径**：`import/no-absolute-path` = error

**代码质量（严格）**

- **禁止 console**：`no-console` = error（仅允许 warn/error，调试日志用 `@ps/log`）
- **禁止 debugger**：`no-debugger` = error
- **禁止 eval**：`no-eval` = error
- **禁止 alert/confirm/prompt**：`no-alert` = error
- **强制 const**：`prefer-const` = error（let 仅用于重新赋值）
- **禁止 var**：`no-var` = error
- **强制严格相等**：`eqeqeq` = error
- **禁止空块**：`no-empty` = error（包括 catch）
- **禁止空函数**：`no-empty-function` = error
- **强制大括号**：`curly` = error（单行 if/else 也必须用大括号）
- **强制 switch default**：`default-case` = error
- **强制驼峰命名**：`camelcase` = error
- **禁止 Yoda 条件**：`yoda` = error
- **禁止不可达代码**：`no-unreachable` = error

> 完整规则列表见 [.eslintrc.cjs](file:///d:/files/UESTC/purchase-system/.eslintrc.cjs)

### 6.5 React 组件规范

- 函数组件 + Hooks，禁止 class 组件
- 组件 props 必须定义 `interface` 并以 `Props` 结尾：`interface SupplierFormProps`
- 副作用清晰划分：数据获取用 `useQuery`/`useMutation`，勿在 `useEffect` 中裸调 fetch
- 组件接收数据而非自行请求（关注点分离）
- 业务复合组件内置表单校验，引用 `@ps/contracts` 的 Zod schema

### 6.6 文件组织

- 单文件不超过 300 行，超过则按职责拆分
- 单函数不超过 50 行，超过则提取子函数
- 每个目录必须有 `index.ts` 统一导出，禁止深层路径导入：
  - ✅ `import { SupplierDTO } from '@ps/contracts'`
  - ❌ `import { SupplierDTO } from '@ps/contracts/src/dto/supplier'`

---

## 7. Zod 与类型同步

### 7.1 单一真相源

所有业务校验逻辑的单一真相源是 `@ps/contracts/schemas/` 中的 Zod schema：

```ts
// packages/contracts/schemas/supplier.ts
import { z } from "zod"

export const supplierSchema = z.object({
  name: z.string().min(1, "供应商名称不可为空"),
  creditCode: z.string().length(18, "统一社会信用代码为 18 位"),
  // ...
})

export type SupplierDTO = z.infer<typeof supplierSchema>
```

### 7.2 前后端复用

- **后端**：`apps/api` 的 validators 直接引用 schema 做请求校验
- **前端**：`@ps/web-kit` 的业务复合组件引用同一 schema 做表单校验
- **禁止**：在前端或后端重复定义校验规则

---

## 8. 错误处理规范

### 8.1 统一响应结构

所有 API 响应遵循 `ApiResponse<T>`：

```ts
// 成功
{ code: 0, data: T, message: 'ok' }

// 失败
{ code: <业务错误码>, data: null, message: '错误描述' }
```

### 8.2 错误分层

| 层级       | 处理方式                                            |
| ---------- | --------------------------------------------------- |
| db 层      | 抛出原始错误，不捕获                                |
| service 层 | 捕获 db 错误，转换为业务错误（如"供应商已被引用"）  |
| route 层   | 全局 error-handler 中间件统一捕获，返回 ApiResponse |
| 前端       | `useQuery`/`useMutation` 暴露 error，组件展示 Toast |

### 8.3 禁止行为

- 禁止 `try/catch` 后静默吞错（空 catch 块）
- 禁止在日志中输出密码、Token 等敏感数据（`@ps/log` 已内置脱敏）
- 不可逆操作（合同作废、定价失效、供应商淘汰）必须前端二次确认

---

## 9. 测试规范

### 9.1 测试文件位置

- 单元测试与源码同目录：`src/supplier.repo.ts` → `src/supplier.repo.test.ts`
- 或统一放 `tests/` 目录，二选一在包内保持一致

### 9.2 测试覆盖要求

- `@ps/utils`：每个纯函数必须有测试
- `@ps/contracts`：每个 Zod schema 必须有通过/失败用例
- `@ps/db`：每个 repository 的 CRUD 必须有测试
- `apps/api` services：业务规则（定价自动失效、合同锁定等）必须有测试
- 使用 `@ps/mock` 提供测试数据

### 9.3 测试命令

```bash
pnpm --filter <pkg> test          # 单包测试
pnpm test                         # 全量测试
```

---

## 10. AI 协作三铁则

### 铁则一：单包聚焦

每次开发仅聚焦一个 package，不跨包并行修改。如需修改多个包，按依赖顺序逐个完成：

```
types-base → utils/env-config/log → contracts → mock → db/pdf → web-kit → apps
```

### 铁则二：自下而上验证

底层包必须通过「构建 + 类型检查 + 测试 + lint + 循环依赖检测」全量验证后，再开发上层包：

```bash
pnpm --filter <pkg> build
pnpm --filter <pkg> typecheck
pnpm --filter <pkg> test
pnpm --filter <pkg> lint
pnpm check:circular
```

### 铁则三：影响范围声明

修改基础包（`@ps/types-base`、`@ps/utils`、`@ps/env-config`、`@ps/log`、`@ps/contracts`）时：

1. 必须说明影响范围（哪些上层包引用了被修改的符号）
2. 修改 `@ps/contracts` 的 DTO 时，必须同步检查 `@ps/db`、`@ps/pdf`、`@ps/mock`、`@ps/web-kit`、`apps/api`、`apps/web` 的类型一致性
3. 运行全量 `pnpm typecheck` 验证兼容性

---

## 11. 禁止事项清单

### 11.1 架构层

- ❌ 下层包引用上层包（如 `@ps/db` 引用 `apps/api`）
- ❌ `@ps/log` 引用 `@ps/env-config`
- ❌ 前端包（`@ps/web-kit`、`apps/web`）引用 Node 专属包（`@ps/db`、`@ps/pdf`）
- ❌ 前端包使用 `process`、`Buffer` 等 Node 全局变量
- ❌ 在 `@ps/db` repositories 中实现业务规则
- ❌ 在前端实现核心业务规则（以后端为准）
- ❌ 在 `@ps/pdf` 中直接调用 `@ps/db`

### 11.2 代码层

- ❌ 使用 `any` 类型
- ❌ 使用 `@ts-ignore`
- ❌ 空 catch 块
- ❌ 在日志中输出密码、Token
- ❌ 重复定义校验规则（前后端必须复用 `@ps/contracts` schema）
- ❌ 深层路径导入（必须通过包根 `index.ts` 导入）
- ❌ 单文件超过 300 行
- ❌ 单函数超过 50 行
- ❌ class 组件
- ❌ 在 `useEffect` 中裸调 fetch（必须用 `useQuery`/`useMutation`）

### 11.3 流程层

- ❌ 跨包并行修改
- ❌ 底层包未验证就开发上层包
- ❌ 修改基础包不验证上层兼容性
- ❌ 未通过单包交付四要素就进入下一阶段

---

## 12. 单包交付验收标准

每个 package 开发完成后，必须通过以下四要素（缺一不可）：

| 验收项   | 命令                            | 要求                         |
| -------- | ------------------------------- | ---------------------------- |
| 构建通过 | `pnpm --filter <pkg> build`     | Vite 产物 + `.d.ts` 正常生成 |
| 类型安全 | `pnpm --filter <pkg> typecheck` | 严格模式通过，无隐式 any     |
| 测试通过 | `pnpm --filter <pkg> test`      | 核心功能覆盖，全量用例通过   |
| 代码规范 | `pnpm --filter <pkg> lint`      | ESLint 无错误、无警告        |

补充：所有包必须通过 `pnpm check:circular` 循环依赖检测。

---

## 13. 常用命令速查

```bash
# 安装
pnpm install

# 开发
pnpm dev                              # 全部并行
pnpm --filter @ps/web dev             # 仅前端
pnpm --filter @ps/api dev             # 仅后端

# 构建
pnpm build                            # 全量
pnpm --filter @ps/web-kit build       # 单包

# 校验
pnpm typecheck                        # 全量类型检查
pnpm lint                             # 全量 lint（含依赖方向）
pnpm check:circular                   # 循环依赖检测
pnpm test                             # 全量测试

# 依赖管理
pnpm --filter @ps/pdf add puppeteer   # 给某包加依赖
```

---

## 14. 关键文件索引

| 文件                                  | 用途                             |
| ------------------------------------- | -------------------------------- |
| `.trae/documents/产品需求文档.md`     | 业务需求、数据模型、校验规则     |
| `.trae/documents/工程结构设计文档.md` | 完整架构设计、依赖矩阵、实施路径 |
| `.trae/rules/project_rules.md`        | 项目规则（本文件，AI 强制约束）  |
| `pnpm-workspace.yaml`                 | workspace 声明                   |
| `tsconfig.base.json`                  | 共享 TS 编译选项                 |
| `.eslintrc.cjs`                       | ESLint 配置（含依赖方向规则）    |
| `.env.example`                        | 环境变量示例                     |
| `AI_GUIDELINES.md`                    | AI 协作编码规则（如存在）        |

---

> AI agent 在执行编码任务前，必须先完整阅读本文件。如有冲突，以 `.trae/documents/工程结构设计文档.md` V1.2 为准。
