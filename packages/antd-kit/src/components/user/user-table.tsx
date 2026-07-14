
import { SearchOutlined } from "@ant-design/icons"
import type { PersonDTO } from "@ps/contracts"
import { useUserList } from "@ps/hooks-business"
import { Input, Table } from "antd"
import type { ColumnsType } from "antd/es/table"
import React, { useState } from "react"

export interface UserTableProps {
  readonly onRowClick?: (record: PersonDTO) => void
}

export function UserTable({
  onRowClick,
}: UserTableProps): React.ReactNode {
  const [keyword, setKeyword] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { data, isLoading } = useUserList({
    keyword: keyword || undefined,
    page,
    pageSize,
  })

  const columns: ColumnsType<PersonDTO> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "姓名",
      dataIndex: "name",
      key: "name",
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="搜索用户姓名"
          prefix={<SearchOutlined />}
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value)
            setPage(1)
          }}
          allowClear
        />
      </div>
      <Table<PersonDTO>
        columns={columns}
        dataSource={data?.data ?? []}
        rowKey="id"
        loading={isLoading}
        onRow={(record) => ({
          style: { cursor: "pointer" },
          onClick: () => {
            onRowClick?.(record)
          },
        })}
        pagination={{
          current: page,
          pageSize,
          total: data?.total ?? 0,
          showSizeChanger: true,
          onChange: (p: number, ps: number) => {
            setPage(p)
            setPageSize(ps)
          },
        }}
      />
    </div>
  )
}
