/**
 * 品类管理页面 — 树形 + CRUD。
 */

import { PlusOutlined } from "@ant-design/icons"
import type {
  CategoryDTO,
  CategoryQueryParams,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@ps/contracts"
import {
  useCategoryList,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@ps/hooks-business"
import {
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Space,
  Table,
} from "antd"
import type { ColumnsType } from "antd/es/table"
import React, { useCallback, useMemo, useState } from "react"

export const CategoryPage: React.FC = () => {
  const [query, setQuery] = useState<CategoryQueryParams>({
    page: 1,
    pageSize: 50,
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<CategoryDTO | null>(null)
  const [keyword, setKeyword] = useState("")
  const [form] = Form.useForm<CreateCategoryRequest | UpdateCategoryRequest>()

  const listQuery = useMemo<CategoryQueryParams>(
    () => ({ ...query, keyword: keyword || undefined }),
    [query, keyword],
  )
  const { data, isLoading } = useCategoryList(listQuery)
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()

  const categories = useMemo<CategoryDTO[]>(() => data?.data ?? [], [data])

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
    (record: CategoryDTO) => {
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
        message.success("品类更新成功").then(() => {}, () => {})
      } else {
        await createMutation.mutateAsync(values as CreateCategoryRequest)
        message.success("品类创建成功").then(() => {}, () => {})
      }
      setModalOpen(false)
    } catch {
      // eslint-disable-next-line no-empty
    }
  }, [editing, form, createMutation, updateMutation])

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteMutation.mutateAsync(id)
      message.success("品类已删除").then(() => {}, () => {})
    },
    [deleteMutation],
  )

  const columns = useMemo<ColumnsType<CategoryDTO>>(
    () => [
      { title: "编码", dataIndex: "code", key: "code", width: 120 },
      { title: "名称", dataIndex: "name", key: "name", width: 200 },
      {
        title: "排序",
        dataIndex: "sortOrder",
        key: "sortOrder",
        width: 80,
        align: "center",
      },
      { title: "描述", dataIndex: "description", key: "description" },
      {
        title: "操作",
        key: "action",
        width: 140,
        fixed: "right",
        render: (_: unknown, record: CategoryDTO) => (
          <Space>
            <Button type="link" size="small" onClick={() => {
 openEdit(record)
}}>
              编辑
            </Button>
            <Popconfirm
              title="确定删除该品类？"
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
          placeholder="搜索品类名称"
          allowClear
          onSearch={setKeyword}
          style={{ width: 240 }}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新增品类
        </Button>
      </Space>

      <Table<CategoryDTO>
        columns={columns}
        dataSource={categories}
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
        title={editing !== null ? "编辑品类" : "新增品类"}
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
            rules={[{ required: true, message: "请输入品类名称" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="编码" name="code">
            <Input />
          </Form.Item>
          <Form.Item label="排序" name="sortOrder">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
