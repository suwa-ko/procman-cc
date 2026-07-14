import { SearchOutlined } from "@ant-design/icons"
import type { MaterialDTO, MaterialStatus } from "@ps/contracts"
import { useMaterialList } from "@ps/hooks-business"
import { Input, Select, Space, Table, Tag } from "antd"
import type { ColumnsType } from "antd/es/table"
import React, { useCallback, useMemo, useState } from "react"

export interface MaterialTableProps {
  readonly onRowClick?: (record: MaterialDTO) => void
}

const STATUS_OPTIONS: { label: string; value: MaterialStatus }[] = [
  { label: "启用", value: "active" as MaterialStatus },
  { label: "停用", value: "inactive" as MaterialStatus },
]

const STATUS_COLOR_MAP: Record<string, string> = {
  active: "green",
  inactive: "red",
}

const STATUS_LABEL_MAP: Record<string, string> = {
  active: "启用",
  inactive: "停用",
}

function renderStatusTag(status: MaterialStatus): React.ReactNode {
  return <Tag color={STATUS_COLOR_MAP[status]}>{STATUS_LABEL_MAP[status]}</Tag>
}

const columns: ColumnsType<MaterialDTO> = [
  { title: "编码", dataIndex: "code", key: "code" },
  { title: "名称", dataIndex: "name", key: "name" },
  { title: "规格", dataIndex: "spec", key: "spec" },
  { title: "单位", dataIndex: "unit", key: "unit" },
  { title: "品类", dataIndex: "categoryId", key: "categoryId" },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
    render: (_: unknown, record: MaterialDTO) => renderStatusTag(record.status),
  },
  { title: "创建时间", dataIndex: "createdAt", key: "createdAt" },
]

export function MaterialTable({
  onRowClick,
}: MaterialTableProps): React.ReactNode {
  const [keyword, setKeyword] = useState("")
  const [status, setStatus] = useState<MaterialStatus | undefined>(undefined)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const queryParams = useMemo(
    () => ({
      keyword: keyword.length > 0 ? keyword : undefined,
      status,
      page,
      pageSize,
    }),
    [keyword, status, page, pageSize]
  )

  const { data, isLoading } = useMaterialList(queryParams)

  const handleKeywordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setKeyword(e.target.value)
      setPage(1)
    },
    []
  )

  const handleStatusChange = useCallback((value: MaterialStatus) => {
    setStatus(value)
    setPage(1)
  }, [])

  const handlePageChange = useCallback(
    (newPage: number, newPageSize: number) => {
      setPage(newPage)
      setPageSize(newPageSize)
    },
    []
  )

  const handleRowClick = useCallback(
    (record: MaterialDTO) => {
      if (onRowClick !== undefined) {
        onRowClick(record)
      }
    },
    [onRowClick]
  )

  const dataSource = data?.data ?? []
  const total = data?.total ?? 0

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <Space>
        <Input
          placeholder="搜索物料名称或编码"
          prefix={<SearchOutlined />}
          value={keyword}
          onChange={handleKeywordChange}
          allowClear
        />
        <Select
          placeholder="状态"
          value={status}
          onChange={handleStatusChange}
          options={STATUS_OPTIONS}
          allowClear
          style={{ width: 120 }}
        />
      </Space>
      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          onChange: handlePageChange,
        }}
        onRow={(record: MaterialDTO) => ({
          onClick: () => {
            handleRowClick(record)
          },
          style: { cursor: "pointer" },
        })}
      />
    </Space>
  )
}
