/**
 * 模板管理页面 — CRUD。
 */

import { PlusOutlined } from "@ant-design/icons"
import type {
  CreateTemplateRequest,
  TemplateDTO,
  TemplateQueryParams,
  UpdateTemplateRequest,
} from "@ps/contracts"
import {
  useCreateTemplate,
  useDeleteTemplate,
  useTemplateList,
  useUpdateTemplate,
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
  Switch,
  Table,
} from "antd"
import type { ColumnsType } from "antd/es/table"
import React, { useCallback, useMemo, useState } from "react"

export const TemplatePage: React.FC = () => {
  const [query, setQuery] = useState<TemplateQueryParams>({
    page: 1,
    pageSize: 10,
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<TemplateDTO | null>(null)
  const [keyword, setKeyword] = useState("")
  const [form] = Form.useForm<CreateTemplateRequest | UpdateTemplateRequest>()

  const listQuery = useMemo<TemplateQueryParams>(
    () => ({ ...query, keyword: keyword || undefined }),
    [query, keyword],
  )
  const { data, isLoading } = useTemplateList(listQuery)
  const createMutation = useCreateTemplate()
  const updateMutation = useUpdateTemplate()
  const deleteMutation = useDeleteTemplate()

  const templates = useMemo<TemplateDTO[]>(() => data?.data ?? [], [data])

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
    (record: TemplateDTO) => {
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
        message.success("模板更新成功").then(() => {}, () => {})
      } else {
        await createMutation.mutateAsync(values as CreateTemplateRequest)
        message.success("模板创建成功").then(() => {}, () => {})
      }
      setModalOpen(false)
    } catch {
      // eslint-disable-next-line no-empty
    }
  }, [editing, form, createMutation, updateMutation])

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteMutation.mutateAsync(id)
      message.success("模板已删除").then(() => {}, () => {})
    },
    [deleteMutation],
  )

  const columns = useMemo<ColumnsType<TemplateDTO>>(
    () => [
      { title: "编码", dataIndex: "code", key: "code", width: 120 },
      { title: "名称", dataIndex: "name", key: "name", width: 200 },
      {
        title: "合同类型",
        dataIndex: "contractType",
        key: "contractType",
        width: 100,
        render: (t: string) => t === "purchase" ? "采购" : t === "nda" ? "保密" : t,
      },
      {
        title: "启用",
        dataIndex: "enabled",
        key: "enabled",
        width: 70,
        align: "center",
        render: (v: boolean) => <Switch checked={v} disabled size="small" />,
      },
      { title: "创建时间", dataIndex: "createdAt", key: "createdAt", width: 160 },
      {
        title: "操作",
        key: "action",
        width: 140,
        fixed: "right",
        render: (_: unknown, record: TemplateDTO) => (
          <Space>
            <Button type="link" size="small" onClick={() => {
 openEdit(record)
}}>
              编辑
            </Button>
            <Popconfirm
              title="确定删除该模板？"
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
          placeholder="搜索模板名称"
          allowClear
          onSearch={setKeyword}
          style={{ width: 240 }}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新增模板
        </Button>
      </Space>

      <Table<TemplateDTO>
        columns={columns}
        dataSource={templates}
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

      <Modal
        title={editing !== null ? "编辑模板" : "新增模板"}
        open={modalOpen}
        onOk={() => {
  handleSubmit().catch(() => {})
}}
        onCancel={() => {
 setModalOpen(false)
}}
        destroyOnHidden
        width={560}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Form form={form} layout="vertical" initialValues={{ contractType: "purchase" }}>
          <Form.Item
            label="模板名称"
            name="name"
            rules={[{ required: true, message: "请输入模板名称" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="合同类型"
            name="contractType"
            rules={[{ required: true, message: "请选择合同类型" }]}
          >
            <Select
              options={[
                { label: "采购合同", value: "purchase" },
                { label: "保密协议", value: "nda" },
              ]}
            />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
