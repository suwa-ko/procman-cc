# apps/api

> 采购管理系统 — 后端服务（Hono）。

## 定位

- **层级**：应用层（业务服务）
- **运行环境**：Node.js
- **依赖**：`@ps/db`、`@ps/env-config`、`@ps/log`、`@ps/contracts`
- **框架**：Hono + `@hono/node-server`

## 当前状态

> ⚠️ **骨架阶段** — DI 接线完成，仅 `/health` 路由可用。业务功能尚未实现。

### 已实现

| 模块                   | 说明                                                                      |
| ---------------------- | ------------------------------------------------------------------------- |
| `src/index.ts`         | DI 接线层：loadConfig → createLogger → createDbClient → createApp → serve |
| `src/app.ts`           | Hono 应用工厂，全局请求日志中间件 + 路由注册                              |
| `src/routes/health.ts` | 健康检查路由（含 Supabase / Mock 双路径兼容）                             |
| `src/types.ts`         | `AppDependencies` 接口                                                    |
| `__tests__/`           | health 路由测试                                                           |

### 待实现

| 模块                           | 优先级                                     |
| ------------------------------ | ------------------------------------------ |
| `middleware/auth.ts`           | 高 — JWT 鉴权中间件                        |
| `middleware/error-handler.ts`  | 高 — 全局错误处理中间件                    |
| `validators/*`                 | 高 — 请求参数校验（复用 @ps/model Schema） |
| `routes/auth.routes.ts`        | 高 — 登录/注册路由                         |
| `routes/supplier.routes.ts`    | 高 — 供应商 CRUD 路由                      |
| `routes/material.routes.ts`    | 高 — 物料/品类 CRUD 路由                   |
| `routes/price.routes.ts`       | 高 — 定价 CRUD 路由 + 自动失效             |
| `routes/contract.routes.ts`    | 高 — 合同路由（含状态流转、PDF 导出触发）  |
| `routes/template.routes.ts`    | 中 — 模板 CRUD 路由                        |
| `services/price.service.ts`    | 高 — 定价自动失效业务规则                  |
| `services/contract.service.ts` | 高 — 合同数据锁定、状态流转                |
| `services/code.service.ts`     | 中 — 编码生成规则                          |
| `services/pdf.service.ts`      | 中 — PDF 生成调用编排                      |

## 依赖注入流程

```
loadConfig() → createLogger(level) → createDbClient(config) → createApp({ db }) → serve(port)
```

- `@ps/env-config` 与 `@ps/log` 之间无直接引用，通过 DI 解耦
- 数据库客户端根据 `config.env` 决定使用真实 Supabase 或 Mock 内存数据库

## 路由结构（规划）

```
/api
├── /health           ← GET   健康检查
├── /auth
│   ├── /login        ← POST  登录
│   └── /register     ← POST  注册
├── /suppliers        ← GET/POST  供应商列表/创建
│   └── /:id          ← GET/PUT/DELETE  供应商详情/更新/删除
├── /materials        ← GET/POST  物料列表/创建
│   └── /:id          ← GET/PUT/DELETE  物料详情/更新/删除
├── /categories       ← GET/POST  品类列表/创建
│   └── /:id          ← GET/PUT/DELETE  品类详情/更新/删除
├── /pricings         ← GET/POST  定价列表/创建
│   └── /:id          ← GET/PUT/DELETE  定价详情/更新/删除
├── /contracts        ← GET/POST  合同列表/创建
│   ├── /:id          ← GET/PUT/DELETE  合同详情/更新/删除
│   └── /:id/pdf      ← GET   合同 PDF 导出
├── /templates        ← GET/POST  模板列表/创建
│   └── /:id          ← GET/PUT/DELETE  模板详情/更新/删除
└── /persons          ← GET  人员列表/详情（只读）
```

## 启动命令

```bash
pnpm --filter apps/api dev              # 开发模式（默认 mock）
pnpm --filter apps/api dev -- --env dev # 开发模式（连接 Supabase）
pnpm --filter apps/api build            # 构建
pnpm --filter apps/api test             # 测试
pnpm --filter apps/api lint             # lint
```
