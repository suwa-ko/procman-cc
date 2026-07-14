# @ps/antd-kit

Ant Design 业务组件包 — 为采购管理系统提供开箱即用的选择器、查询表格、详情悬浮组件。

## 安装

本包为 pnpm monorepo 内部包，无需单独安装。确保项目根目录已执行 `pnpm install`。

需要以下 peer dependencies：

```json
{
  "antd": ">=5.0.0",
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "@tanstack/react-query": "^5.0.0"
}
```

## 组件列表

每个业务实体提供三件套组件：

| 实体     | Selector（选择器） | Table（查询表格） | Popover（详情悬浮） |
| -------- | ------------------ | ----------------- | ------------------- |
| 供应商   | `SupplierSelector` | `SupplierTable`   | `SupplierPopover`   |
| 物料     | `MaterialSelector` | `MaterialTable`   | `MaterialPopover`   |
| 品类     | `CategorySelector` | `CategoryTable`   | `CategoryPopover`   |
| 定价     | `PricingSelector`  | `PricingTable`    | `PricingPopover`    |
| 用户     | `UserSelector`     | `UserTable`       | `UserPopover`       |
| 合同模板 | `TemplateSelector` | `TemplateTable`   | `TemplatePopover`   |

## 使用方式

### 前置条件

组件依赖 `@ps/hooks-core` 的 Provider 层级，使用前需在应用入口包裹 `AppProvider`（本包已导出）：

```tsx
import { AppProvider } from "@ps/antd-kit"
import { createHttpClient } from "@ps/web-kit"

const httpClient = createHttpClient({ baseURL: "/api" })

function App() {
  return (
    <AppProvider
      httpClient={httpClient}
      environment={{ mode: "dev", apiBaseUrl: "/api" }}
    >
      {/* 你的路由/页面 */}
    </AppProvider>
  )
}
```

### SupplierSelector — 供应商选择器

支持搜索、单选/多选，返回完整 `SupplierDTO` 对象。

```tsx
import { SupplierSelector } from "@ps/antd-kit"
import { useState } from "react"

function MyForm() {
  const [supplier, setSupplier] = useState<SupplierDTO>()

  return (
    <SupplierSelector
      value={supplier}
      onChange={setSupplier}
      placeholder="请选择供应商"
    />
  )
}
```

**Props：**

| 属性          | 类型                                            | 默认值           | 说明                |
| ------------- | ----------------------------------------------- | ---------------- | ------------------- |
| `value`       | `SupplierDTO \| SupplierDTO[]`                  | -                | 选中值（单选/多选） |
| `onChange`    | `(value: SupplierDTO \| SupplierDTO[]) => void` | -                | 值变更回调          |
| `multiple`    | `boolean`                                       | `false`          | 是否多选            |
| `placeholder` | `string`                                        | `"请选择供应商"` | 占位文本            |
| `disabled`    | `boolean`                                       | `false`          | 是否禁用            |

### SupplierTable — 供应商查询表格

内置搜索、状态下拉筛选、分页，支持行点击回调。

```tsx
import { SupplierTable } from "@ps/antd-kit"

function SupplierList() {
  return <SupplierTable onRowClick={(record) => console.log("选中:", record)} />
}
```

**Props：**

| 属性         | 类型                            | 默认值 | 说明       |
| ------------ | ------------------------------- | ------ | ---------- |
| `onRowClick` | `(record: SupplierDTO) => void` | -      | 行点击回调 |

### SupplierPopover — 供应商详情悬浮

鼠标悬停显示供应商完整详情。

```tsx
import { SupplierPopover } from "@ps/antd-kit"
import { Button } from "antd"

function SupplierLink({ id }: { id: string }) {
  return (
    <SupplierPopover id={id}>
      <Button type="link">查看详情</Button>
    </SupplierPopover>
  )
}
```

**Props：**

| 属性       | 类型              | 默认值   | 说明      |
| ---------- | ----------------- | -------- | --------- |
| `id`       | `string`          | **必填** | 供应商 ID |
| `children` | `React.ReactNode` | **必填** | 触发元素  |

---

其余实体组件的接口与 Supplier 完全一致，仅替换类型为对应 DTO：

- **MaterialSelector** / **MaterialTable** / **MaterialPopover** → `MaterialDTO`
- **CategorySelector** / **CategoryTable** / **CategoryPopover** → `CategoryDTO`
- **PricingSelector** / **PricingTable** / **PricingPopover** → `PricingDTO`
- **UserSelector** / **UserTable** / **UserPopover** → `PersonDTO`
- **TemplateSelector** / **TemplateTable** / **TemplatePopover** → `TemplateDTO`

MaterialSelector 额外支持 `categoryId` prop，按品类筛选物料。

## Storybook

```bash
# 启动 Storybook（端口 6006）
pnpm --filter @ps/antd-kit storybook

# 构建静态 Storybook
pnpm --filter @ps/antd-kit storybook:build
```

Storybook 已配置 mock 环境，所有组件使用 `@ps/mock` 工厂生成的假数据，无需连接后端。

## 数据获取

所有组件内部通过 `@ps/hooks-business` 提供的业务 Hook 获取数据，不直接调用 API。数据流：

```
组件 → useXxxList / useXxxDetail (@ps/hooks-business)
     → useRequestClient() (@ps/hooks-core)
     → HttpClient (@ps/web-kit)
     → API / MSW Mock
```

## 开发

```bash
# 构建
pnpm --filter @ps/antd-kit build

# 类型检查
pnpm --filter @ps/antd-kit typecheck

# Lint
pnpm --filter @ps/antd-kit lint
```
