# apps/web

> 采购管理系统 — 前端应用（React + Vite）。

## 定位

- **层级**：应用层（用户界面）
- **运行环境**：browser（React 18+）
- **依赖**：`@ps/env-config`、`@ps/web-kit`、`@ps/hooks-core`、`@ps/hooks-business`
- **构建**：Vite

## 当前状态

> ⚠️ **骨架阶段** — DI 接线完成，MSW Mock 层完善，但无用户页面。

### 已实现

| 模块                                 | 说明                                                                                                            |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `src/main.tsx`                       | DI 接线层：loadConfig → logger → HttpClient → MSW → React 渲染                                                  |
| `src/App.tsx`                        | 静态占位组件                                                                                                    |
| **MSW Mock 层**                      |                                                                                                                 |
| `src/mocks/stores/`                  | 8 个 Store 类（Supplier / Material / Category / Pricing / Contract / Template / Person / Auth），完整 CRUD 实现 |
| `src/mocks/handlers/`                | 8 个 MSW handler + 通用 `crud-factory.ts` 工厂                                                                  |
| `src/mocks/handlers/crud-factory.ts` | 通用 CRUD handler 工厂（消除重复模式）                                                                          |
| `src/mocks/seed.ts`                  | 种子数据生成器（按依赖顺序创建关联数据）                                                                        |
| `src/mocks/browser.ts`               | MSW Service Worker 启动                                                                                         |
| `src/mocks/server.ts`                | MSW Node 测试模式                                                                                               |
| `__tests__/App.test.tsx`             | 基础渲染测试                                                                                                    |

### 待实现

| 模块                      | 优先级 | 说明                       |
| ------------------------- | ------ | -------------------------- |
| `src/routes/`             | 高     | React Router 页面路由      |
| `src/routes/login/`       | 高     | 登录页面                   |
| `src/routes/dashboard/`   | 高     | 首页仪表盘                 |
| `src/routes/suppliers/`   | 高     | 供应商列表/表单/详情页面   |
| `src/routes/materials/`   | 高     | 物料品类管理页面           |
| `src/routes/prices/`      | 高     | 定价管理页面               |
| `src/routes/contracts/`   | 高     | 合同管理页面（含条目编辑） |
| `src/routes/templates/`   | 中     | 模板管理页面               |
| `src/routes/pdf-preview/` | 中     | PDF 预览页面               |
| `src/stores/`             | 中     | 全局状态管理（Zustand）    |

## 依赖注入流程

```
loadConfig() → createLogger(level) → setupHttpClient(baseURL) → [mock] MSW → ReactDOM.render(<App/>)
```

- Mock 模式下自动启动 MSW 拦截所有 API 请求
- MSW 的 8 个 Store 内含完整 CRUD + 业务规则验证（如定价自动失效、合同 Draft 编辑锁定）

## MSW Mock 层亮点

| 特性                | 实现位置                                        |
| ------------------- | ----------------------------------------------- |
| 定价自动失效        | `PricingStore.createWithInvalidation()`         |
| 合同 Draft 编辑锁定 | `ContractHandler` 中的状态检查                  |
| 多条件列表筛选      | 每个 handler 支持 keyword / status / 日期范围等 |
| 合同 + 条目联创     | `ContractHandler` 创建时同时创建条目            |
| 通用 CRUD 工厂      | `crud-factory.ts` 消除约 200 行重复代码         |

## 页面规划

```
/                        ← 重定向到 /dashboard
/login                   ← 登录页
/dashboard               ← 首页仪表盘
/suppliers               ← 供应商列表
/suppliers/new           ← 供应商新增
/suppliers/:id           ← 供应商详情/编辑
/materials               ← 物料列表
/materials/new           ← 物料新增
/materials/:id           ← 物料详情/编辑
/categories              ← 品类管理
/prices                  ← 定价列表
/prices/new              ← 新增加价
/prices/:id              ← 定价详情/编辑
/contracts               ← 合同列表
/contracts/new           ← 合同新建（选模板 → 填条目 → 预览）
/contracts/:id           ← 合同详情/编辑/PDF 导出
/templates               ← 模板管理
/templates/new           ← 模板新建
/templates/:id           ← 模板编辑
/pdf-preview/:contractId ← PDF 在线预览
```

## 启动命令

```bash
pnpm --filter apps/web dev               # 开发模式（默认 mock）
pnpm --filter apps/web dev -- --env dev  # 开发模式（连接真实 API）
pnpm --filter apps/web build             # 构建
pnpm --filter apps/web test              # 测试
pnpm --filter apps/web lint              # lint
```
