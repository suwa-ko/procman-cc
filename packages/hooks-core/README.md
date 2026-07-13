# @ps/hooks-core

> 前端 Hook 基础能力库 — 环境管理、认证管理、请求客户端、TanStack Query 封装、CRUD 工厂与通用工具。

## 定位

- **层级**：第四层（依赖 @ps/types-base + @ps/web-kit）
- **运行环境**：browser（React 18+）
- **外部依赖**：`react`、`@tanstack/react-query`、`@ps/web-kit`
- **被依赖**：@ps/hooks-business、apps/web

## 导出内容

### 环境管理（`environment/`）

| 导出                  | 类型      | 说明                              |
| --------------------- | --------- | --------------------------------- |
| `EnvironmentProvider` | Component | 环境配置 Context Provider         |
| `useEnvironment`      | Hook      | 读取环境配置（mode + apiBaseUrl） |
| `EnvironmentConfig`   | Type      | `{ mode, apiBaseUrl }`            |
| `EnvironmentMode`     | Type      | `"dev"` / `"mock"` / `"prod"`     |

### 认证管理（`auth/`）

| 导出                             | 类型      | 说明                                          |
| -------------------------------- | --------- | --------------------------------------------- |
| `AuthProvider`                   | Component | JWT Token 生命周期管理 Provider               |
| `useAuth`                        | Hook      | 获取当前用户信息与认证状态                    |
| `useLogin`                       | Hook      | 登录 mutation（自动写 Token + 清缓存）        |
| `useLogout`                      | Hook      | 登出（清 Token + 清缓存）                     |
| `usePermission`                  | Hook      | 基于角色列表的权限检查                        |
| `AuthConfig`                     | Type      | `{ loginUrl, meUrl, tokenStorageKey }`        |
| `AuthState`                      | Type      | `{ token, user, isAuthenticated, isLoading }` |
| `UserInfo`                       | Type      | `{ id, email, name, roles }`                  |
| `LoginRequest` / `LoginResponse` | Type      | 登录/响应类型                                 |

### 请求客户端（`request/`）

| 导出                 | 类型      | 说明                                |
| -------------------- | --------- | ----------------------------------- |
| `RequestProvider`    | Component | 注入已附加 Token 的 HttpClient      |
| `useRequestClient`   | Hook      | 获取当前请求客户端实例              |
| `wrapClientWithAuth` | Function  | 为 HttpClient 注入 Authorization 头 |
| `toQueryParams`      | Function  | 类型安全的查询参数转换工具          |

`RequestProvider` 必须在 `<AuthProvider>` 内部使用，自动从 AuthContext 读取 Token 并在每次请求时附加 `Authorization: Bearer <token>` 头。

### TanStack Query 封装（`query/`）

| 导出          | 说明                                     |
| ------------- | ---------------------------------------- |
| `useQuery`    | React Query `useQuery` 的类型安全透传    |
| `useMutation` | React Query `useMutation` 的类型安全透传 |

### CRUD 工厂（`crud/`）

核心工厂函数 `createCrudHooks<TEntity, TCreate, TUpdate, TQueryParams>(config)`，传入模型配置后自动生成 5 个 Hook：

| 生成的 Hook | 说明                         |
| ----------- | ---------------------------- |
| `useList`   | 分页列表查询（GET）          |
| `useDetail` | 按 ID 详情查询（GET /:id）   |
| `useCreate` | 创建 mutation（POST）        |
| `useUpdate` | 更新 mutation（PUT /:id）    |
| `useDelete` | 删除 mutation（DELETE /:id） |

Mutation 成功后自动 `invalidateQueries`，确保列表/详情缓存同步刷新。

| 类型导出          | 说明               |
| ----------------- | ------------------ |
| `CrudHooks`       | CRUD Hook 集合类型 |
| `CrudModelConfig` | 工厂配置项类型     |

### 通用工具（`utils/`）

| 导出            | 说明                           |
| --------------- | ------------------------------ |
| `useDebounce`   | 防抖 Hook（默认 300ms）        |
| `usePagination` | 分页状态 Hook（page/pageSize） |

## 使用示例

```tsx
// === 接入层（apps/web/src/main.tsx） ===
import {
  EnvironmentProvider,
  AuthProvider,
  RequestProvider,
} from "@ps/hooks-core"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { setupHttpClient } from "@ps/web-kit"

const queryClient = new QueryClient()
const httpClient = setupHttpClient({ baseURL: config.apiBaseUrl })

function App() {
  return (
    <EnvironmentProvider
      config={{ mode: "dev", apiBaseUrl: "http://localhost:3000" }}
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider
          config={{
            loginUrl: "/api/auth/login",
            meUrl: "/api/auth/me",
            tokenStorageKey: "token",
          }}
        >
          <RequestProvider client={httpClient}>
            <Routes />
          </RequestProvider>
        </AuthProvider>
      </QueryClientProvider>
    </EnvironmentProvider>
  )
}

// === 业务组件 ===
import { useAuth, usePermission } from "@ps/hooks-core"

function Dashboard() {
  const { user } = useAuth()
  const { hasPermission } = usePermission(["admin", "buyer"])
  if (!hasPermission) return <Forbidden />
  return <div>欢迎, {user?.name}</div>
}
```

## Provider 嵌套顺序（必须遵守）

```
<EnvironmentProvider>    —— 最外层，提供环境配置
  <QueryClientProvider>  —— TanStack Query 缓存
    <AuthProvider>       —— 认证状态 + Token 管理
      <RequestProvider>  —— 读取 AuthProvider 的 Token 注入请求头
        <App />
      </RequestProvider>
    </AuthProvider>
  </QueryClientProvider>
</EnvironmentProvider>
```

## 开发命令

```bash
pnpm --filter @ps/hooks-core build
pnpm --filter @ps/hooks-core typecheck
pnpm --filter @ps/hooks-core lint
```
