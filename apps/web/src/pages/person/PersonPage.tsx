/**
 * 用户/人员管理页面 — 只读列表。
 */

import type {
  PersonDTO,
  PersonQueryParams,
} from "@ps/contracts"
import { usePersonList } from "@ps/hooks-business"
import { Input, Space, Table } from "antd"
import type { ColumnsType } from "antd/es/table"
import React, { useCallback, useMemo, useState } from "react"

export const PersonPage: React.FC = () => {
  const [query, setQuery] = useState<PersonQueryParams>({
    page: 1,
    pageSize: 10,
  })
  const [keyword, setKeyword] = useState("")

  const listQuery = useMemo<PersonQueryParams>(
    () => ({ ...query, keyword: keyword || undefined }),
    [query, keyword],
  )
  const { data, isLoading } = usePersonList(listQuery)

  const persons = useMemo<PersonDTO[]>(() => data?.data ?? [], [data])

  const handlePageChange = useCallback(
    (page: number, pageSize: number) => {
      setQuery((prev) => ({ ...prev, page, pageSize }))
    },
    [],
  )

  const columns = useMemo<ColumnsType<PersonDTO>>(
    () => [
      { title: "姓名", dataIndex: "name", key: "name", width: 160 },
      { title: "邮箱", dataIndex: "email", key: "email", width: 220 },
      { title: "部门", dataIndex: "department", key: "department", width: 140 },
      { title: "职位", dataIndex: "title", key: "title", width: 140 },
      { title: "创建时间", dataIndex: "createdAt", key: "createdAt", width: 160 },
    ],
    [],
  )

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="搜索人员姓名"
          allowClear
          onSearch={setKeyword}
          style={{ width: 240 }}
        />
      </Space>

      <Table<PersonDTO>
        columns={columns}
        dataSource={persons}
        rowKey="id"
        loading={isLoading}
        scroll={{ x: 800 }}
        pagination={{
          current: query.page,
          pageSize: query.pageSize,
          total: data?.total ?? 0,
          showSizeChanger: true,
          showTotal: (t: number) => `共 ${t} 条`,
          onChange: handlePageChange,
        }}
      />
    </div>
  )
}
