/**
 * 物料管理页面 — CRUD + 搜索筛选。
 */

import { PlusOutlined } from "@ant-design/icons"
import { MaterialStatus } from "@ps/contracts"
import type {
  CreateMaterialRequest,
  MaterialDTO,
  MaterialQueryParams,
  UpdateMaterialRequest,
} from "@ps/contracts"
import {
  useCreateMaterial,
  useDeleteMaterial,
  useMaterialList,
  useUpdateMaterial,
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

const STATUS_OPTIONS: { label: string; value: MaterialStatus | "" }[] = [
  { label: "全部", value: "" },
  { label: "启用", value: "active" as MaterialStatus },
  { label: "停用", value: "inactive" as MaterialStatus },
]

const STATUS_LABEL_MAP: Record<string, string> = {
  active: "启用",
  inactive: "停用",
}

export const MaterialPage: React.FC = () => {
  const [query, setQuery] = useState<MaterialQueryParams>({
    page: 1,
    pageSize: 10,
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<MaterialDTO | null>(null)
  const [form] = Form.useForm<CreateMaterialRequest | UpdateMaterialRequest>()

  const { data, isLoading } = useMaterialList(query)
  const createMutation = useCreateMaterial()
  const updateMutation = useUpdateMaterial()
  const deleteMutation = useDeleteMaterial()

  const materials = useMemo<MaterialDTO[]>(() => data?.data ?? [], [data])

  const handleSearch = useCallback((keyword: string) => {
    setQuery((prev) => ({ ...prev, keyword: keyword || undefined, page: 1 }))
  }, [])

  const handleStatusFilter = useCallback((status: MaterialStatus | "") => {
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
    (record: MaterialDTO) => {
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
        message.success("物料更新成功").then(() => {}, () => {})
      } else {
        await createMutation.mutateAsync(values as CreateMaterialRequest)
        message.success("物料创建成功").then(() => {}, () => {})
      }
      setModalOpen(false)
    } catch {
      // eslint-disable-next-line no-empty
    }
  }, [editing, form, createMutation, updateMutation])

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteMutation.mutateAsync(id)
      message.success("物料已删除").then(() => {}, () => {})
    },
    [deleteMutation],
  )

  const columns = useMemo<ColumnsType<MaterialDTO>>(
    () => [
      { title: "编码", dataIndex: "code", key: "code", width: 120 },
      { title: "名称", dataIndex: "name", key: "name", width: 180 },
      { title: "规格型号", dataIndex: "spec", key: "spec", width: 140 },
      { title: "单位", dataIndex: "unit", key: "unit", width: 70 },
      {
        title: "状态",
        dataIndex: "status",
        key: "status",
        width: 80,
        render: (s: MaterialStatus) => (
          <Tag color={s === MaterialStatus.Active ? "green" : "default"}>
            {STATUS_LABEL_MAP[s]}
          </Tag>
        ),
      },
      {
        title: "操作",
        key: "action",
        width: 140,
        fixed: "right",
        render: (_: unknown, record: MaterialDTO) => (
          <Space>
            <Button type="link" size="small" onClick={() => {
 openEdit(record)
}}>
              编辑
            </Button>
            <Popconfirm
              title="确定删除该物料？"
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
          placeholder="搜索物料名称"
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
          新增物料
        </Button>
      </Space>

      <Table<MaterialDTO>
        columns={columns}
        dataSource={materials}
        rowKey="id"
        loading={isLoading}
        scroll={{ x: 700 }}
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
        title={editing !== null ? "编辑物料" : "新增物料"}
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
            rules={[{ required: true, message: "请输入物料名称" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="规格型号" name="spec">
            <Input />
          </Form.Item>
          <Form.Item
            label="单位"
            name="unit"
            rules={[{ required: true, message: "请输入单位" }]}
          >
            <Input placeholder="如：个、米、千克" />
          </Form.Item>
          <Form.Item
            label="品类ID"
            name="categoryId"
            rules={[{ required: true, message: "请输入品类ID" }]}
          >
            <Input placeholder="品类ID" />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
