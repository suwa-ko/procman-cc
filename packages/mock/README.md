# @ps/mock

> Mock 数据工厂 — 基于 Faker 生成测试数据，为 MSW 和 Vitest 提供可复用的工厂函数与 fixture 数据。

## 定位

- **层级**：第二层（依赖 @ps/contracts + @ps/model）
- **运行环境**：universal（浏览器测试 + Node 测试均可）
- **依赖**：`@ps/contracts`、`@ps/model`、`@faker-js/faker`
- **被依赖**：apps/web（MSW mock 层）、测试套件

## 导出内容

### 工厂函数（`factories/`）

每个实体一个工厂，内置 Faker 逻辑：

| 工厂                  | 说明               |
| --------------------- | ------------------ |
| `createSupplier`      | 供应商工厂         |
| `createCategory`      | 品类工厂           |
| `createMaterial`      | 物料工厂           |
| `createPricing`       | 定价工厂           |
| `createContract`      | 合同工厂（含条目） |
| `createContractEntry` | 采购条目工厂       |
| `createTemplate`      | 模板工厂           |
| `createPerson`        | 人员工厂           |
| `createLoginPayload`  | 登录载荷工厂       |

### Fixture 数据（`fixtures/`）

| 文件                     | 说明                |
| ------------------------ | ------------------- |
| `nda-contract.json`      | NDA 保密协议示例    |
| `purchase-contract.json` | 采购合同示例        |
| `supplier-list.json`     | 供应商列表示例      |
| `fixture.schema.json`    | Fixture 校验 Schema |

## 使用示例

```ts
import { createSupplier, createMaterial, createPricing } from "@ps/mock"

// 生成单个实体
const supplier = createSupplier()
// { id: "cuid-xxx", name: "环球科技", creditCode: "...", status: "active", ... }

// 覆盖特定字段
const inactive = createSupplier({ status: SupplierStatus.Inactive })

// 批量生成
const materials = Array.from({ length: 5 }, () => createMaterial())
```

## 设计约束

- Faker 仅在此包内使用，不泄漏到其他包
- 工厂函数不模拟业务规则（如定价自动失效 — 这由 MSW Store 层实现）
- 所有工厂输出符合 `@ps/model` Schema 校验

## 开发命令

```bash
pnpm --filter @ps/mock build
pnpm --filter @ps/mock typecheck
pnpm --filter @ps/mock test
pnpm --filter @ps/mock lint
```
