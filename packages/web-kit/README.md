# @ps/web-kit

> 前端能力包 — 网络请求封装 + React Hooks + UI 组件。当前迭代：`request` 模块（通用底层网络库）。

## 定位

- **层级**：第四层
- **运行环境**：browser（前端专用）
- **依赖**：`@ps/types-base`
- **重要约束**：
  - 禁止引用 `@ps/db`、`@ps/pdf`（Node 专属包）
  - 禁止使用 `process`、`Buffer` 等 Node 全局变量
  - 不含业务代码，是通用底层库
  - `baseURL` 由 apps 层从 `@ps/env-config` 注入（依赖注入），不自行读取 env-config

## 模块结构

```
src/
├── request/       # 网络请求模块（当前迭代）
│   ├── client.ts  # createHttpClient 核心实现
│   ├── error.ts   # HttpClientError 统一错误
│   ├── types.ts   # 类型定义
│   └── index.ts
├── hooks/         # React Hooks（规划中：useQuery / useMutation）
└── components/    # UI 组件（规划中）
```

## request 模块

基于 `fetch` 封装的通用 HTTP 客户端，与业务解耦。

### 核心 API

| 导出                  | 说明                                                                     |
| --------------------- | ------------------------------------------------------------------------ |
| `createHttpClient`    | 工厂函数，通过 `HttpClientOptions` 创建 `HttpClient` 实例                |
| `HttpClient`          | 客户端接口，提供 `get` / `post` / `put` / `patch` / `delete` / `request` |
| `HttpClientError`     | 统一错误类，涵盖网络错误、超时、HTTP 状态错误、业务错误码                |
| `RequestInterceptor`  | 请求拦截器类型（链式执行，可修改配置）                                   |
| `ResponseInterceptor` | 响应拦截器类型（链式执行，仅 HTTP 2xx 时触发）                           |

### 能力一览

- 5 种 HTTP 方法（GET / POST / PUT / PATCH / DELETE）
- 请求 / 响应拦截器链（按顺序执行）
- 超时控制（`AbortController`，`timeout <= 0` 表示不启用超时）
- 外部取消信号支持
- `ApiResponse` 自动解包：成功返回 `data`，失败抛出 `HttpClientError`
- 非 `ApiResponse` 响应原样透传
- URL 拼接：绝对 URL（`http://` / `https://`）直用，相对路径归一化斜杠
- 错误明细透传：响应体中的 `details` 字段透传到 `HttpClientError.details`

### HttpClientError 字段

| 字段      | 说明                                          |
| --------- | --------------------------------------------- |
| `status`  | `0` = 网络错误/超时；`>= 400` = HTTP 状态错误 |
| `code`    | 业务错误码（来自 `ApiResponse.code`）         |
| `details` | 错误明细（来自响应体 `details` 字段）         |
| `config`  | 触发错误的请求配置                            |

## 使用示例

### 创建客户端

```ts
// apps/web 启动时（依赖注入）
import { loadConfig } from "@ps/env-config"
import { createHttpClient } from "@ps/web-kit"

const config = loadConfig()
const client = createHttpClient({
  baseURL: config.apiBaseUrl,
  defaultHeaders: { "X-App": "purchase" },
  timeout: 30000,
})
```

### 基础请求

```ts
// 自动解包 ApiResponse，返回 data
const user = await client.get<UserDTO>("/users/1")

// POST 发送 JSON body
const created = await client.post<UserDTO>("/users", { name: "Alice" })

// 带查询参数（自动过滤 null/undefined）
const list = await client.get<UserDTO[]>("/users", {
  params: { page: 1, keyword: "a", empty: null },
})
```

### 拦截器

```ts
const client = createHttpClient({
  baseURL: "http://api.test",
  requestInterceptors: [
    (config) => ({
      ...config,
      headers: { ...config.headers, Authorization: `Bearer ${token}` },
    }),
  ],
  responseInterceptors: [
    (response) => {
      // 统一响应处理
      return response
    },
  ],
})
```

### 错误处理

```ts
import { HttpClientError } from "@ps/web-kit"

try {
  const data = await client.get("/users/999")
} catch (err) {
  if (err instanceof HttpClientError) {
    if (err.status === 0) {
      // 网络错误或超时
    } else if (err.code !== undefined) {
      // 业务错误码
      console.log(err.code, err.message, err.details)
    } else {
      // HTTP 状态错误
    }
  }
}
```

### 超时与取消

```ts
// 单次请求超时
await client.get("/slow", { timeout: 5000 })

// 外部取消
const controller = new AbortController()
const promise = client.get("/users", { signal: controller.signal })
controller.abort() // 取消请求，抛出 status=0 的 HttpClientError

// timeout <= 0 表示不启用超时（仅监听外部 signal）
await client.get("/long-poll", { timeout: 0 })
```

## 开发命令

```bash
pnpm --filter @ps/web-kit build       # 构建
pnpm --filter @ps/web-kit typecheck   # 类型检查
pnpm --filter @ps/web-kit test        # 测试
pnpm --filter @ps/web-kit lint        # lint
```
