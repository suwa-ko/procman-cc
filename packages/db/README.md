# @ps/db

> Supabase 数据访问层 — 封装数据库读写操作（原子 CRUD + 条件查询 + 分页 + 计数）。

## 定位

- **层级**：第三层
- **运行环境**：node（服务端专用）
- **依赖**：`@ps/log`、`@ps/types-base`、`@supabase/supabase-js`
- **重要约束**：
  - 仅做原子数据操作，**不含任何业务规则**（业务规则由 `apps/api` service 层承载）
  - 通过 `createDbClient(config, logger)` 注入配置与日志，不直接引用 `@ps/env-config`

## 导出内容

### 客户端

| 导出             | 说明                                                              |
| ---------------- | ----------------------------------------------------------------- |
| `createDbClient` | 创建数据库客户端，注入 `DbConfig` 与 `Logger`，显式关闭会话持久化 |
| `DbClient`       | 客户端接口（`supabase` + `logger`）                               |
| `DbConfig`       | 连接配置（`url` + `anonKey`）                                     |

### 基础 Repository

| 导出             | 说明                                                         |
| ---------------- | ------------------------------------------------------------ |
| `BaseRepository` | 泛型基类，绑定实体类型 `T extends BaseEntity`，封装原子 CRUD |

`BaseRepository<T>` 方法：

| 方法            | 说明                                   |
| --------------- | -------------------------------------- |
| `findById`      | 按主键查单条，不存在返回 `null`        |
| `findAll`       | 查询全表                               |
| `findMany`      | 条件查询（过滤 + 排序 + 分页）         |
| `count`         | 按条件计数                             |
| `findPaginated` | 分页查询，一次返回数据 + 总数 + 总页数 |
| `insert`        | 插入并返回完整实体                     |
| `update`        | 按主键更新，不存在返回 `null`          |
| `delete`        | 按主键硬删除                           |

### 查询构建

| 导出                | 说明                                             |
| ------------------- | ------------------------------------------------ |
| `applyFilters`      | 将 `QueryFilter[]` 应用到查询链                  |
| `applySorts`        | 将 `SortField[]` 应用到查询链                    |
| `paginationToRange` | 1-based 分页参数转 PostgREST `[from, to]` 闭区间 |

### 类型

`BaseEntity`、`QueryResult`、`DbQueryChain`、`QueryFilter`、`FilterOperator`、`SortField`、`PaginationParams`、`QueryParams`、`PaginatedResult`、`SelectOptions`。

过滤操作符：`eq` / `neq` / `gt` / `lt` / `gte` / `lte` / `like` / `ilike` / `in`。

## 使用示例

### 创建客户端

```ts
import { loadConfig } from "@ps/env-config"
import { createLogger, LogLevel } from "@ps/log"
import { createDbClient } from "@ps/db"

const config = loadConfig()
const logger = createLogger({ level: LogLevel.Info })
const db = createDbClient(config, logger)
```

### 继承 BaseRepository

```ts
import { BaseRepository } from "@ps/db"
import type { BaseEntity } from "@ps/types-base"

interface SupplierEntity extends BaseEntity {
  name: string
  creditCode: string
  status: string
}

class SupplierRepository extends BaseRepository<SupplierEntity> {
  constructor(client: DbClient) {
    super(client, "suppliers")
  }
}
```

### CRUD 与查询

```ts
// 按主键查询
const supplier = await repo.findById("uuid-1")

// 条件查询：过滤 + 排序 + 分页
const list = await repo.findMany({
  filters: [
    { column: "status", operator: "eq", value: "active" },
    { column: "name", operator: "ilike", value: "%科技%" },
  ],
  sorts: [{ column: "createdAt", ascending: false }],
  pagination: { page: 1, pageSize: 20 },
})

// 分页查询（含总数）
const page = await repo.findPaginated({
  filters: [{ column: "status", operator: "eq", value: "active" }],
  pagination: { page: 1, pageSize: 20 },
})
// page: { data, total, page, pageSize, totalPages }

// 插入
const created = await repo.insert({
  name: "供应商A",
  creditCode: "...",
  status: "active",
})

// 更新
const updated = await repo.update("uuid-1", { status: "inactive" })
```

## 错误处理

- db 层抛出原始错误，不捕获业务语义（规则 8.2）
- `BaseRepository` 内部通过私有 `logAndThrow` 方法记录错误日志后抛出，统一上下文格式：`{ table, id?, error }`

## 开发命令

```bash
pnpm --filter @ps/db build       # 构建
pnpm --filter @ps/db typecheck   # 类型检查
pnpm --filter @ps/db test        # 测试
pnpm --filter @ps/db lint        # lint
```
