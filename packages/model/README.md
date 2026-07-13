# @ps/model

> 业务模型包 — 纯 Zod Schema 定义 + 领域枚举。仅依赖 zod 和 @ps/types-base，零其他 @ps/ 包依赖。

## 定位

- **层级**：第二层（仅依赖 types-base）
- **运行环境**：universal（浏览器与 Node 均可）
- **依赖**：`zod`、`@ps/types-base`
- **被依赖**：@ps/contracts、@ps/model-core、@ps/mock

## 导出内容

### 领域枚举（`enums/`）

| 枚举             | 值                                          |
| ---------------- | ------------------------------------------- |
| `SupplierStatus` | `Active`, `Inactive`, `Disqualified`        |
| `MaterialStatus` | `Active`, `Inactive`                        |
| `PricingStatus`  | `Active`, `Inactive`                        |
| `ContractStatus` | `Draft`, `Active`, `Completed`, `Cancelled` |
| `ContractType`   | `Purchase`, `NDA`                           |

### Zod Schema（`schemas/`）

每个业务模型提供 3-4 层 Schema + 对应类型推断：

| 模型     | Schema                                            | 类型推断                      |
| -------- | ------------------------------------------------- | ----------------------------- |
| Supplier | `supplierSchema`                                  | `SupplierEntity`              |
|          | `createSupplierSchema`                            | `CreateSupplierInput`         |
|          | `updateSupplierSchema`                            | `UpdateSupplierInput`         |
|          | `supplierQuerySchema`                             | `SupplierQuery`               |
| Category | `categorySchema` / create / update / query        | 同上                          |
| Material | `materialSchema` / create / update / query        | 同上                          |
| Pricing  | `pricingSchema` / create / update / query         | 同上                          |
| Contract | `contractSchema` / create / update / query        | 同上                          |
|          | `contractEntrySchema` / createEntry / updateEntry | 同上                          |
| Template | `templateSchema` / create / update / query        | 同上                          |
|          | `templateVariableSchema`                          | `TemplateVariableEntity`      |
| Person   | `personSchema` / query（只读）                    | `PersonEntity`                |
| Auth     | `loginSchema`、`registerSchema`                   | `LoginInput`、`RegisterInput` |

### 设计原则

- **无副作用**：仅包含数据形状声明和校验规则，不涉及任何 I/O
- **前后端复用**：同一 Schema 可同时用于前端表单校验和后端请求校验
- **零业务逻辑**：不含任何业务判断、数据库操作、或状态管理

## 使用示例

```ts
import { supplierSchema, createSupplierSchema } from "@ps/model"

// 后端请求校验
const result = createSupplierSchema.safeParse(req.body)
if (!result.success) {
  return { code: 4000, message: result.error.message }
}

// 前端表单校验（直接复用同一 Schema）
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

const form = useForm({
  resolver: zodResolver(createSupplierSchema),
})

// 类型导出
import type { SupplierEntity, CreateSupplierInput } from "@ps/model"
const supplier: SupplierEntity = { id: "1", name: "xxx", ... }
```

## 开发命令

```bash
pnpm --filter @ps/model build       # 构建
pnpm --filter @ps/model typecheck   # 类型检查
pnpm --filter @ps/model test        # 测试
pnpm --filter @ps/model lint        # lint
```
