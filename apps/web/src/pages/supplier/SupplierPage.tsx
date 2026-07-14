/**
 * 供应商管理页面 — CRUD + 搜索筛选。
 */

import { PlusOutlined } from "@ant-design/icons"
import type {
  CreateSupplierRequest,
  SupplierDTO,
  SupplierQueryParams,
  SupplierStatus,
  UpdateSupplierRequest,
} from "@ps/contracts"
import {
  useCreateSupplier,
  useDeleteSupplier,
  useSupplierList,
  useUpdateSupplier,
} from "@ps/hooks-business"
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
} from "antd"
import type { ColumnsType } from "antd/es/table"
import React, { useCallback, useMemo, useState } from "react"

const STATUS_OPTIONS: { label: string; value: SupplierStatus | "" }[] = [
  { label: "全部", value: "" },
  { label: "已准入", value: "active" as SupplierStatus },
  { label: "冻结", value: "frozen" as SupplierStatus },
  { label: "淘汰", value: "obsolete" as SupplierStatus },
]

const STATUS_LABEL_MAP: Record<string, string> = {
  active: "已准入",
  frozen: "冻结",
  obsolete: "淘汰",
}

const STATUS_COLOR_MAP: Record<string, string> = {
  active: "green",
  frozen: "orange",
  obsolete: "red",
}

export const SupplierPage: React.FC = () => {
  const [query, setQuery] = useState<SupplierQueryParams>({
    page: 1,
    pageSize: 10,
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<SupplierDTO | null>(null)
  const [form] = Form.useForm<CreateSupplierRequest | UpdateSupplierRequest>()

  const { data, isLoading } = useSupplierList(query)
  const createMutation = useCreateSupplier()
  const updateMutation = useUpdateSupplier()
  const deleteMutation = useDeleteSupplier()

  const suppliers = useMemo<SupplierDTO[]>(() => data?.data ?? [], [data])

  const handleSearch = useCallback((keyword: string) => {
    setQuery((prev) => ({ ...prev, keyword: keyword || undefined, page: 1 }))
  }, [])

  const handleStatusFilter = useCallback((status: SupplierStatus | "") => {
    setQuery((prev) => ({
      ...prev,
      status: status !== "" ? status : undefined,
      page: 1,
    }))
  }, [])

  const handlePageChange = useCallback(
    (page: number, pageSize: number) => {
      setQuery((prev) => ({ ...prev, page, pageSize }))
    },
    [],
  )

  const openCreate = useCallback(() => {
    form.resetFields()
    setEditing(null)
    setModalOpen(true)
  }, [form])

  const openEdit = useCallback(
    (record: SupplierDTO) => {
      form.setFieldsValue(record)
      setEditing(record)
      setModalOpen(true)
    },
    [form],
  )

  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields()
      if (editing !== null) {
        await updateMutation.mutateAsync({ id: editing.id, data: values })
        message.success("供应商更新成功").then(() => {}, () => {})
      } else {
        await createMutation.mutateAsync(values as CreateSupplierRequest)
        message.success("供应商创建成功").then(() => {}, () => {})
      }
      setModalOpen(false)
    } catch {
      // 表单校验失败时 form.validateFields 会抛出异常
    }
  }, [editing, form, createMutation, updateMutation])

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteMutation.mutateAsync(id)
      message.success("供应商已删除").then(() => {}, () => {})
    },
    [deleteMutation],
  )

  const columns = useMemo<ColumnsType<SupplierDTO>>(
    () => [
      { title: "编码", dataIndex: "code", key: "code", width: 120 },
      { title: "名称", dataIndex: "name", key: "name", width: 200 },
      { title: "联系人", dataIndex: "contactPerson", key: "contactPerson", width: 100 },
      { title: "联系电话", dataIndex: "contactPhone", key: "contactPhone", width: 120 },
      {
        title: "状态",
        dataIndex: "status",
        key: "status",
        width: 80,
        render: (s: SupplierStatus) =>
          <Tag color={STATUS_COLOR_MAP[s]}>{STATUS_LABEL_MAP[s]}</Tag>
        ,
      },
      { title: "创建时间", dataIndex: "createdAt", key: "createdAt", width: 160 },
      {
        title: "操作",
        key: "action",
        width: 140,
        fixed: "right",
        render: (_: unknown, record: SupplierDTO) => (
          <Space>
            <Button type="link" size="small" onClick={() => {
 openEdit(record)
}}>
              编辑
            </Button>
            <Popconfirm
              title="确定删除该供应商？"
              onConfirm={() => {
                handleDelete(record.id).catch(() => {})
              }}
            >
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [openEdit, handleDelete],
  )

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="搜索供应商名称"
          allowClear
          onSearch={handleSearch}
          style={{ width: 240 }}
        />
        <Select
          placeholder="状态"
          allowClear
          options={STATUS_OPTIONS}
          onChange={handleStatusFilter}
          style={{ width: 120 }}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新增供应商
        </Button>
      </Space>

      <Table<SupplierDTO>
        columns={columns}
        dataSource={suppliers}
        rowKey="id"
        loading={isLoading}
        scroll={{ x: 1000 }}
        pagination={{
          current: query.page,
          pageSize: query.pageSize,
          total: data?.total ?? 0,
          showSizeChanger: true,
          showTotal: (t: number) => `共 ${t} 条`,
          onChange: handlePageChange,
        }}
      />

      <Modal
        title={editing !== null ? "编辑供应商" : "新增供应商"}
        open={modalOpen}
        onOk={() => {
  handleSubmit().catch(() => {})
}}
        onCancel={() => {
 setModalOpen(false)
}}
        destroyOnHidden
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="名称"
            name="name"
            rules={[{ required: true, message: "请输入供应商名称" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="统一社会信用代码"
            name="creditCode"
            rules={[
              { required: true, message: "请输入信用代码" },
              { min: 18, max: 18, message: "信用代码为18位" },
            ]}
          >
            <Input maxLength={18} />
          </Form.Item>
          <Form.Item
            label="联系人"
            name="contactPerson"
            rules={[{ required: true, message: "请输入联系人" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="联系电话"
            name="contactPhone"
            rules={[{ required: true, message: "请输入联系电话" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="地址" name="address">
            <Input />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
