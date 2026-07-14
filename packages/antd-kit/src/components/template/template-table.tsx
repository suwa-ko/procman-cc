import { SearchOutlined } from "@ant-design/icons"
import { ContractType } from "@ps/contracts"
import type { TemplateDTO } from "@ps/contracts"
import { useTemplateList } from "@ps/hooks-business"
import { Input, Select, Space, Table, Tag } from "antd"
import type { ColumnsType } from "antd/es/table"
import { useState } from "react"
import type React from "react"

const CONTRACT_TYPE_OPTIONS: { label: string; value: ContractType | undefined }[] = [
  { label: "全部类型", value: undefined },
  { label: "NDA", value: ContractType.NDA },
  { label: "采购合同", value: ContractType.PurchaseContract },
]

const ENABLED_OPTIONS: { label: string; value: boolean | undefined }[] = [
  { label: "全部状态", value: undefined },
  { label: "启用", value: true },
  { label: "停用", value: false },
]

function contractTypeLabel(t: ContractType): string {
  return t === ContractType.NDA ? "NDA" : "采购合同"
}

export interface TemplateTableProps {
  readonly onRowClick?: (record: TemplateDTO) => void
}

export function TemplateTable({
  onRowClick,
}: TemplateTableProps): React.ReactNode {
  const [keyword, setKeyword] = useState("")
  const [contractType, setContractType] = useState<ContractType | undefined>(undefined)
  const [enabled, setEnabled] = useState<boolean | undefined>(undefined)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { data, isLoading } = useTemplateList({
    keyword: keyword || undefined,
    contractType,
    enabled,
    page,
    pageSize,
  })

  const columns: ColumnsType<TemplateDTO> = [
    {
      title: "模板编码",
      dataIndex: "code",
      key: "code",
      width: 160,
    },
    {
      title: "模板名称",
      dataIndex: "name",
      key: "name",
      width: 200,
    },
    {
      title: "合同类型",
      dataIndex: "contractType",
      key: "contractType",
      width: 120,
      render: (_: unknown, record: TemplateDTO) => {
        return <Tag>{contractTypeLabel(record.contractType)}</Tag>
      },
    },
    {
      title: "状态",
      dataIndex: "enabled",
      key: "enabled",
      width: 80,
      render: (_: unknown, record: TemplateDTO) => {
        return record.enabled ? <Tag color="green">启用</Tag> : <Tag color="red">停用</Tag>
      },
    },
    {
      title: "版本",
      dataIndex: "version",
      key: "version",
      width: 80,
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
    },
  ]

  return (
    <Space direction="vertical" style={{ width: "100%" }} size="middle">
      <Space wrap>
        <Input
          placeholder="搜索模板名称"
          prefix={<SearchOutlined />}
          allowClear
          style={{ width: 240 }}
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value)
            setPage(1)
          }}
        />
        <Select
          style={{ width: 140 }}
          value={contractType}
          options={CONTRACT_TYPE_OPTIONS}
          onChange={(val) => {
            setContractType(val)
            setPage(1)
          }}
        />
        <Select
          style={{ width: 120 }}
          value={enabled}
          options={ENABLED_OPTIONS}
          onChange={(val) => {
            setEnabled(val)
            setPage(1)
          }}
        />
      </Space>

      <Table<TemplateDTO>
        columns={columns}
        dataSource={data?.data ?? []}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: page,
          pageSize,
          total: data?.total ?? 0,
          showSizeChanger: true,
          showTotal: (total: number) => {
            return `共 ${total} 条`
          },
          onChange: (p, ps) => {
            setPage(p)
            setPageSize(ps)
          },
        }}
        onRow={(record: TemplateDTO) => {
          return {
            style: { cursor: "pointer" },
            onClick: () => {
              onRowClick?.(record)
            },
          }
        }}
      />
    </Space>
  )
}
