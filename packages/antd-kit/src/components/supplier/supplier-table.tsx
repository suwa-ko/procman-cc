import { SearchOutlined } from "@ant-design/icons"
import type { SupplierDTO, SupplierStatus } from "@ps/contracts"
import { useSupplierList } from "@ps/hooks-business"
import { Input, Select, Space, Table, Tag } from "antd"
import type { ColumnsType } from "antd/es/table"
import React, { useCallback, useState } from "react"

interface SupplierTableProps {
  readonly onRowClick?: (record: SupplierDTO) => void
}

const STATUS_OPTIONS: { label: string; value: SupplierStatus }[] = [
  { label: "已准入", value: "active" as SupplierStatus },
  { label: "冻结", value: "frozen" as SupplierStatus },
  { label: "淘汰", value: "obsolete" as SupplierStatus },
]

const STATUS_COLOR_MAP: Record<string, string> = {
  active: "green",
  frozen: "orange",
  obsolete: "red",
}

const STATUS_LABEL_MAP: Record<string, string> = {
  active: "已准入",
  frozen: "冻结",
  obsolete: "淘汰",
}

const COLUMNS: ColumnsType<SupplierDTO> = [
  {
    title: "编码",
    dataIndex: "code",
    key: "code",
    width: 140,
  },
  {
    title: "名称",
    dataIndex: "name",
    key: "name",
    width: 200,
  },
  {
    title: "联系人",
    dataIndex: "contactPerson",
    key: "contactPerson",
    width: 120,
  },
  {
    title: "联系电话",
    dataIndex: "contactPhone",
    key: "contactPhone",
    width: 140,
  },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
    width: 100,
    render: (status: SupplierStatus) =>
      <Tag color={STATUS_COLOR_MAP[status]}>
        {STATUS_LABEL_MAP[status]}
      </Tag>,
  },
  {
    title: "创建时间",
    dataIndex: "createdAt",
    key: "createdAt",
    width: 180,
  },
]

export function SupplierTable({
  onRowClick,
}: SupplierTableProps): React.ReactNode {
  const [keyword, setKeyword] = useState<string>("")
  const [status, setStatus] = useState<SupplierStatus | undefined>(undefined)
  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)

  const { data, isLoading } = useSupplierList({
    keyword: keyword || undefined,
    status,
    page,
    pageSize,
  })

  const suppliers = data?.data ?? []
  const total = data?.total ?? 0

  const handleSearch = useCallback((val: string) => {
    setKeyword(val)
    setPage(1)
  }, [])

  const handleStatusChange = useCallback((val: SupplierStatus | undefined) => {
    setStatus(val)
    setPage(1)
  }, [])

  const handleTableChange = useCallback(
    (pagination: { current?: number; pageSize?: number }) => {
      if (pagination.current !== undefined) {
        setPage(pagination.current)
      }
      if (pagination.pageSize !== undefined) {
        setPageSize(pagination.pageSize)
      }
    },
    [],
  )

  const handleRowClick = useCallback(
    (record: SupplierDTO) => {
      return {
        onClick: () => {
          onRowClick?.(record)
        },
        style: { cursor: "pointer" },
      }
    },
    [onRowClick],
  )

  return (
    <Space direction="vertical" style={{ width: "100%" }} size="middle">
      <Space>
        <Input
          placeholder="搜索供应商名称/编码"
          prefix={<SearchOutlined />}
          allowClear
          value={keyword}
          onChange={(e) => {
            handleSearch(e.target.value)
          }}
          style={{ width: 260 }}
        />
        <Select
          placeholder="状态筛选"
          allowClear
          value={status}
          onChange={handleStatusChange}
          options={STATUS_OPTIONS}
          style={{ width: 140 }}
        />
      </Space>

      <Table<SupplierDTO>
        columns={COLUMNS}
        dataSource={suppliers}
        rowKey="id"
        loading={isLoading}
        onRow={onRowClick ? handleRowClick : undefined}
        onChange={handleTableChange}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t: number) => `共 ${t} 条`,
        }}
      />
    </Space>
  )
}
