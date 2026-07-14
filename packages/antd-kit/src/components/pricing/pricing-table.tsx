import { SearchOutlined } from "@ant-design/icons"
import type { PricingDTO, PricingStatus } from "@ps/contracts"
import { usePricingList } from "@ps/hooks-business"
import { Input, Select, Space, Table, Tag } from "antd"
import type { ColumnsType } from "antd/es/table"
import React, { useCallback, useMemo, useState } from "react"

export interface PricingTableProps {
  readonly onRowClick?: (record: PricingDTO) => void
}

const STATUS_OPTIONS: { label: string; value: PricingStatus }[] = [
  { label: "有效", value: "active" as PricingStatus },
  { label: "失效", value: "inactive" as PricingStatus },
]

const STATUS_TAG_COLOR: Record<string, string> = {
  active: "green",
  inactive: "red",
}

function formatUnitPrice(price: number): string {
  return `¥${price.toFixed(2)}`
}

const COLUMNS: ColumnsType<PricingDTO> = [
  {
    title: "定价编码",
    dataIndex: "code",
    key: "code",
  },
  {
    title: "供应商 ID",
    dataIndex: "supplierId",
    key: "supplierId",
  },
  {
    title: "物料 ID",
    dataIndex: "materialId",
    key: "materialId",
  },
  {
    title: "单价",
    dataIndex: "unitPrice",
    key: "unitPrice",
    render: (price: number) => formatUnitPrice(price),
  },
  {
    title: "币种",
    dataIndex: "currency",
    key: "currency",
  },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
    render: (status: PricingStatus) =>
      <Tag color={STATUS_TAG_COLOR[status] ?? "default"}>{status}</Tag>,
  },
  {
    title: "创建时间",
    dataIndex: "createdAt",
    key: "createdAt",
  },
]

export function PricingTable({
  onRowClick,
}: PricingTableProps): React.ReactNode {
  const [keyword, setKeyword] = useState("")
  const [status, setStatus] = useState<PricingStatus | undefined>(undefined)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const queryParams = useMemo(
    () => ({
      status,
      page,
      pageSize,
    }),
    [status, page, pageSize]
  )

  const { data, isLoading } = usePricingList(queryParams)

  const filteredData = useMemo(() => {
    const list = data?.data ?? []
    if (!keyword) {
      return list
    }
    const lower = keyword.toLowerCase()
    return list.filter(
      (item) =>
        item.supplierId.toLowerCase().includes(lower) ||
        item.materialId.toLowerCase().includes(lower) ||
        item.code.toLowerCase().includes(lower)
    )
  }, [data, keyword])

  const handleKeywordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setKeyword(e.target.value)
      setPage(1)
    },
    []
  )

  const handleStatusChange = useCallback(
    (value: PricingStatus | undefined) => {
      setStatus(value)
      setPage(1)
    },
    []
  )

  const handleTableChange = useCallback(
    (pagination: { current?: number; pageSize?: number }) => {
      if (pagination.current !== undefined) {
        setPage(pagination.current)
      }
      if (pagination.pageSize !== undefined) {
        setPageSize(pagination.pageSize)
      }
    },
    []
  )

  const handleRowClick = useCallback(
    (record: PricingDTO) => {
      return {
        onClick: () => {
          onRowClick?.(record)
        },
        style: { cursor: "pointer" },
      }
    },
    [onRowClick]
  )

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <Space>
        <Input
          placeholder="搜索供应商/物料/编码"
          prefix={<SearchOutlined />}
          value={keyword}
          onChange={handleKeywordChange}
          allowClear
        />
        <Select
          placeholder="状态筛选"
          value={status}
          onChange={handleStatusChange}
          options={STATUS_OPTIONS}
          allowClear
          style={{ width: 120 }}
        />
      </Space>
      <Table<PricingDTO>
        columns={COLUMNS}
        dataSource={filteredData}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: page,
          pageSize,
          total: data?.total ?? 0,
          showSizeChanger: true,
          showTotal: (t: number) => `共 ${t} 条`,
        }}
        onRow={onRowClick ? handleRowClick : undefined}
        onChange={handleTableChange}
      />
    </Space>
  )
}
