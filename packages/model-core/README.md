# @ps/model-core

> 模型核心包 — 泛型仓储契约、模型注册表、实体关联映射。仅依赖 @ps/model，不包含任何具体业务。

## 定位

- **层级**：第二层（依赖 @ps/model + @ps/types-base）
- **运行环境**：universal（浏览器与 Node 均可）
- **依赖**：`zod`、`@ps/types-base`、`@ps/model`
- **被依赖**：@ps/mock、@ps/hooks-core

## 导出内容

### 仓储契约（`types`）

泛型 `Repository<TEntity, TCreate, TUpdate, TQuery>` 接口，定义标准 CRUD 契约：

| 方法      | 签名                                                   | 说明       |
| --------- | ------------------------------------------------------ | ---------- |
| `getById` | `(id: string) => TEntity \| undefined`                 | 按 ID 查询 |
| `create`  | `(input: TCreate) => TEntity`                          | 创建实体   |
| `update`  | `(id: string, input: TUpdate) => TEntity \| undefined` | 更新实体   |
| `delete`  | `(id: string) => boolean`                              | 删除实体   |
| `list`    | `(query: TQuery) => PaginatedResponse<TEntity>`        | 分页列表   |
| `getAll`  | `() => TEntity[]`                                      | 获取全部   |

Mock Store 和未来的 DB Repository 均实现此契约，保证代码层可互换。

### 模型注册表（`registry`）

`ModelRegistry` 类 — 业务模型声明与关联关系的集中注册：

```ts
const registry = new ModelRegistry()

registry.register({
  name: "supplier",
  entitySchema: supplierSchema,
  createSchema: createSupplierSchema,
  updateSchema: updateSupplierSchema,
  querySchema: supplierQuerySchema,
  relations: [
    { type: "one-to-many", targetModel: "pricing", foreignKey: "supplierId" },
  ],
})
```

| 类型 / 类            | 说明                            |
| -------------------- | ------------------------------- |
| `ModelDefinition`    | 模型定义描述符                  |
| `RelationDefinition` | 实体关联定义（1:N / N:1 / M:N） |
| `ModelRegistry`      | 注册表实例（增/删/查）          |

### 实体映射（`mapping`）

| 类型 / 函数                   | 说明                           |
| ----------------------------- | ------------------------------ |
| `EntityMapping<T>`            | 实体字段映射描述符             |
| `EntityMappingRegistry`       | 映射注册表                     |
| `createEntityMappingRegistry` | 工厂函数                       |
| `RelationDirection`           | `"forward"` / `"reverse"` 方向 |

## 使用示例

```ts
import { Repository } from "@ps/model-core"
import type {
  SupplierEntity,
  CreateSupplierInput,
  UpdateSupplierInput,
  SupplierQuery,
} from "@ps/model"

// 任意存储层实现此契约即可与上层代码无缝对接
class MockSupplierStore implements Repository<
  SupplierEntity,
  CreateSupplierInput,
  UpdateSupplierInput,
  SupplierQuery
> {
  getById(id: string) {
    /* ... */
  }
  create(input: CreateSupplierInput) {
    /* ... */
  }
  // ...
}
```

## 开发命令

```bash
pnpm --filter @ps/model-core build
pnpm --filter @ps/model-core typecheck
pnpm --filter @ps/model-core lint
```
