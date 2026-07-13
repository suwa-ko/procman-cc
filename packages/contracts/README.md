# @ps/contracts

> API 契约包 — 枚举 / DTO / Zod Schema / 业务常量。前后端校验的单一真相源，通过 @ps/model 引入 Schema。

## 定位

- **层级**：第二层（依赖 @ps/model + @ps/types-base）
- **运行环境**：universal（浏览器与 Node 均可）
- **依赖**：`@ps/model`、`@ps/types-base`、`zod`
- **被依赖**：@ps/mock、@ps/db、@ps/pdf、@ps/web-kit、apps/api、apps/web

## 导出内容

### 枚举 & Schema（从 @ps/model re-export）

所有领域枚举和 Zod Schema 定义在 `@ps/model` 中，`@ps/contracts` 通过 re-export 保持向后兼容。详见 [@ps/model README](../model/README.md)。

### 业务常量（`constants/`）

| 常量          | 说明               | 值                                          |
| ------------- | ------------------ | ------------------------------------------- |
| `CODE_PREFIX` | 各实体编码前缀映射 | `{ supplier: "SUP", material: "MAT", ... }` |

### DTO（`dto/`）

每个业务模型提供完整的请求/响应/查询参数类型：

| 模型     | DTO                | 创建/更新请求                                               | 查询参数              | 列表响应               |
| -------- | ------------------ | ----------------------------------------------------------- | --------------------- | ---------------------- |
| Supplier | `SupplierDTO`      | `CreateSupplierRequest` / `UpdateSupplierRequest`           | `SupplierQueryParams` | `SupplierListResponse` |
| Material | `MaterialDTO`      | `CreateMaterialRequest` / `UpdateMaterialRequest`           | `MaterialQueryParams` | `MaterialListResponse` |
| Category | `CategoryDTO`      | `CreateCategoryRequest` / `UpdateCategoryRequest`           | `CategoryQueryParams` | `CategoryListResponse` |
|          | `CategoryTreeNode` | —                                                           | —                     | —                      |
| Pricing  | `PricingDTO`       | `CreatePricingRequest` / `UpdatePricingRequest`             | `PricingQueryParams`  | `PricingListResponse`  |
| Contract | `ContractDTO`      | `CreateContractRequest` / `UpdateContractRequest`           | `ContractQueryParams` | `ContractListResponse` |
|          | `ContractEntryDTO` | `CreateContractEntryRequest` / `UpdateContractEntryRequest` | —                     | —                      |
| Template | `TemplateDTO`      | `CreateTemplateRequest` / `UpdateTemplateRequest`           | `TemplateQueryParams` | `TemplateListResponse` |
|          | `TemplateVariable` | —                                                           | —                     | —                      |
| Person   | `PersonDTO`        | —（只读）                                                   | `PersonQueryParams`   | `PersonListResponse`   |
| Auth     | —                  | `LoginRequest` / `RegisterRequest`                          | —                     | `LoginResponse`        |

> 所有 `*ListResponse` 统一为 `PaginatedResponse<T>`（来自 `@ps/types-base`）。

## 使用示例

```ts
import {
  SupplierDTO,
  CreateSupplierRequest,
  SupplierQueryParams,
  SupplierListResponse,
} from "@ps/contracts"

// API 调用参数
const params: SupplierQueryParams = { page: 1, pageSize: 20, keyword: "环球" }

// API 响应类型
type Response = SupplierListResponse // = PaginatedResponse<SupplierDTO>
```

## 与 @ps/model 的关系

`@ps/contracts` 是 `@ps/model` 的上层包，在 Schema 基础上增加了：

- **系统字段**：`id`、`code`、`version`、`createdAt`、`updatedAt`
- **API 专用类型**：Request / Response / QueryParams / ListResponse
- **业务常量**：`CODE_PREFIX`

`@ps/model` 保持纯净（仅 Schema + 枚举），`@ps/contracts` 添加传输层语义。

## 开发命令

```bash
pnpm --filter @ps/contracts build
pnpm --filter @ps/contracts typecheck
pnpm --filter @ps/contracts test
pnpm --filter @ps/contracts lint
```
