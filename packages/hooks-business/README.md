# @ps/hooks-business

> 业务 Hook 库 — 为所有已有业务模型提供开箱即用的 CRUD Hooks，内部调用 hooks-core 工厂。

## 定位

- **层级**：第五层（业务应用层依赖）
- **运行环境**：browser（React 18+）
- **依赖**：`@ps/hooks-core`、`@ps/contracts`、`@tanstack/react-query`
- **被依赖**：apps/web

## 导出内容

每个模型提供完整的 **5 个 CRUD Hook**（Person 和 User 为只读，仅提供 2 个）：

| 模型     | useXxxList | useXxxDetail | useCreateXxx | useUpdateXxx | useDeleteXxx |
| -------- | :--------: | :----------: | :----------: | :----------: | :----------: |
| Supplier |     ✅     |      ✅      |      ✅      |      ✅      |      ✅      |
| Material |     ✅     |      ✅      |      ✅      |      ✅      |      ✅      |
| Category |     ✅     |      ✅      |      ✅      |      ✅      |      ✅      |
| Pricing  |     ✅     |      ✅      |      ✅      |      ✅      |      ✅      |
| Contract |     ✅     |      ✅      |      ✅      |      ✅      |      ✅      |
| Template |     ✅     |      ✅      |      ✅      |      ✅      |      ✅      |
| Person   |     ✅     |      ✅      |      —       |      —       |      —       |
| User     |     ✅     |      ✅      |      —       |      —       |      —       |

备注：

- **Person** 和 **User** 为只读（人员主数据来自外部系统）
- **User** Hook 内部映射到 Person 实体（`/api/persons`）
- 所有 Hooks 完全类型安全，零 `any`、零 `as never`

## 设计约束

- 不包含任何 faker 或硬编码数据（Mock 由 MSW 层独立管理）
- 不直接调用 `fetch` / `axios`（所有请求通过 hooks-core 的 `useRequestClient`）
- 不实现业务规则（校验依赖 `@ps/model` Schema，业务规则在 `apps/api` services）
- 依赖方向：`hooks-business → hooks-core → model`，无反向依赖

## 使用示例

```tsx
import {
  useSupplierList,
  useSupplierDetail,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
} from "@ps/hooks-business"
import { useDebounce, usePagination } from "@ps/hooks-core"

function SupplierPage() {
  const { page, pageSize, setPage } = usePagination()
  const [keyword, setKeyword] = useState("")
  const debouncedKeyword = useDebounce(keyword, 300)

  // 分页列表查询
  const { data, isLoading, error } = useSupplierList({
    page,
    pageSize,
    keyword: debouncedKeyword || undefined,
  })

  // 创建
  const createMutation = useCreateSupplier()
  const handleCreate = (values: CreateSupplierRequest) => {
    createMutation.mutate(values, {
      onSuccess: () => toast.success("供应商创建成功"),
    })
  }

  // 详情
  const { data: detail } = useSupplierDetail(selectedId)

  // 删除
  const deleteMutation = useDeleteSupplier()
  const handleDelete = (id: string) => {
    if (confirm("确认删除？")) deleteMutation.mutate(id)
  }

  return (
    <div>
      <input value={keyword} onChange={(e) => setKeyword(e.target.value)} />
      {isLoading ? (
        <Spinner />
      ) : (
        <Table
          data={data?.data ?? []}
          total={data?.total ?? 0}
          page={page}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}
```

## API 路径映射

| 模型     | API Base URL           |
| -------- | ---------------------- |
| Supplier | `/api/suppliers`       |
| Material | `/api/materials`       |
| Category | `/api/categories`      |
| Pricing  | `/api/pricings`        |
| Contract | `/api/contracts`       |
| Template | `/api/templates`       |
| Person   | `/api/persons`         |
| User     | `/api/persons`（映射） |

## 开发命令

```bash
pnpm --filter @ps/hooks-business build
pnpm --filter @ps/hooks-business typecheck
pnpm --filter @ps/hooks-business lint
```
