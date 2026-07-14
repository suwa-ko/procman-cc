import { SearchOutlined } from "@ant-design/icons"
import type { CategoryDTO, CategoryQueryParams } from "@ps/contracts"
import { useCategoryList } from "@ps/hooks-business"
import { Input, Table } from "antd"
import type { TablePaginationConfig } from "antd"
import React, { useCallback, useMemo, useState } from "react"

interface CategoryTableProps {
  onRowClick?: (record: CategoryDTO) => void
}

interface FilterState {
  keyword: string
  page: number
  pageSize: number
}

const DEFAULT_PAGE_SIZE = 10

export function CategoryTable({
  onRowClick,
}: CategoryTableProps): React.ReactNode {
  const [filter, setFilter] = useState<FilterState>({
    keyword: "",
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  })

  const queryParams: CategoryQueryParams = {
    keyword: filter.keyword || undefined,
    page: filter.page,
    pageSize: filter.pageSize,
  }

  const { data, isLoading } = useCategoryList(queryParams)

  const handleSearch = useCallback((value: string) => {
    setFilter((prev) => ({ ...prev, keyword: value, page: 1 }))
  }, [])

  const handleTableChange = useCallback((pag: TablePaginationConfig) => {
    setFilter((prev) => ({
      ...prev,
      page: pag.current ?? 1,
      pageSize: pag.pageSize ?? DEFAULT_PAGE_SIZE,
    }))
  }, [])

  const columns = useMemo(
    () => [
      {
        title: "编码",
        dataIndex: "code",
        key: "code",
      },
      {
        title: "名称",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "父级品类",
        dataIndex: "parentId",
        key: "parentId",
        render: (parentId: string | null | undefined) => {
          return parentId ?? "-"
        },
      },
      {
        title: "排序",
        dataIndex: "sortOrder",
        key: "sortOrder",
      },
    ],
    [],
  )

  const pagination: TablePaginationConfig = {
    current: data?.page ?? 1,
    pageSize: data?.pageSize ?? DEFAULT_PAGE_SIZE,
    total: data?.total ?? 0,
    showSizeChanger: true,
    showTotal: (total: number) => `共 ${total} 条`,
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="搜索品类名称"
          prefix={<SearchOutlined />}
          value={filter.keyword}
          onChange={(e) => {
            handleSearch(e.target.value)
          }}
          allowClear
          style={{ width: 240 }}
        />
      </div>
      <Table
        columns={columns}
        dataSource={data?.data ?? []}
        rowKey="id"
        loading={isLoading}
        pagination={pagination}
        onChange={handleTableChange}
        onRow={(record: CategoryDTO) => ({
          onClick: () => {
            onRowClick?.(record)
          },
          style: { cursor: "pointer" },
        })}
      />
    </div>
  )
}
