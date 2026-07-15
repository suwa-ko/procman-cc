/**
 * 定价管理页面 — CRUD + 创建时供应商选择器。
 */

import { PlusOutlined } from "@ant-design/icons"
import { SupplierSelector } from "@ps/antd-kit"
import { PricingStatus } from "@ps/contracts"
import type {
  CreatePricingRequest,
  PricingDTO,
  PricingQueryParams,
  UpdatePricingRequest,
} from "@ps/contracts"
import {
  useCreatePricing,
  useDeletePricing,
  usePricingList,
  useUpdatePricing,
} from "@ps/hooks-business"
import {
  Button,
  Form,
  Input,
  InputNumber,
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

const STATUS_OPTIONS: { label: string; value: PricingStatus | "" }[] = [
  { label: "全部", value: "" },
  { label: "有效", value: "active" as PricingStatus },
  { label: "失效", value: "inactive" as PricingStatus },
]

const STATUS_LABEL_MAP: Record<string, string> = {
  active: "有效",
  inactive: "失效",
}

export const PricingPage: React.FC = () => {
  const [query, setQuery] = useState<PricingQueryParams>({
    page: 1,
    pageSize: 10,
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<PricingDTO | null>(null)
  const [form] = Form.useForm<CreatePricingRequest | UpdatePricingRequest>()

  const { data, isLoading } = usePricingList(query)
  const createMutation = useCreatePricing()
  const updateMutation = useUpdatePricing()
  const deleteMutation = useDeletePricing()

  const pricings = useMemo<PricingDTO[]>(() => data?.data ?? [], [data])

  const handleStatusFilter = useCallback((status: PricingStatus | "") => {
    setQuery((prev) => ({
      ...prev,
      status: status !== "" ? status : undefined,
      page: 1,
    }))
  }, [])

  const handlePageChange = useCallback((page: number, pageSize: number) => {
    setQuery((prev) => ({ ...prev, page, pageSize }))
  }, [])

  const openCreate = useCallback(() => {
    form.resetFields()
    setEditing(null)
    setModalOpen(true)
  }, [form])

  const openEdit = useCallback(
    (record: PricingDTO) => {
      form.setFieldsValue({
        supplierId: record.supplierId,
        materialId: record.materialId,
        unitPrice: record.unitPrice,
        currency: record.currency,
        remark: record.remark,
      })
      setEditing(record)
      setModalOpen(true)
    },
    [form]
  )

  const handleSubmit = useCallback(async () => {
    const values = await form.validateFields().catch(() => undefined)
    if (values === undefined) {
      return
    }
    if (editing !== null) {
      await updateMutation.mutateAsync({ id: editing.id, data: values })
      message.success("定价更新成功").then(() => {}, () => {})
    } else {
      await createMutation.mutateAsync(values as CreatePricingRequest)
      message.success("定价创建成功").then(() => {}, () => {})
    }
    setModalOpen(false)
  }, [editing, form, createMutation, updateMutation])

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteMutation.mutateAsync(id)
      message.success("定价已删除").then(() => {}, () => {})
    },
    [deleteMutation]
  )

  const columns = useMemo<ColumnsType<PricingDTO>>(
    () => [
      { title: "编码", dataIndex: "code", key: "code", width: 120 },
      {
        title: "供应商",
        dataIndex: "supplierName",
        key: "supplierName",
        width: 180,
      },
      {
        title: "物料",
        dataIndex: "materialName",
        key: "materialName",
        width: 160,
      },
      {
        title: "含税单价",
        dataIndex: "unitPrice",
        key: "unitPrice",
        width: 100,
        align: "right",
        render: (v: number) => `¥${v?.toFixed(2)}`,
      },
      { title: "币种", dataIndex: "currency", key: "currency", width: 70 },
      {
        title: "备注",
        dataIndex: "remark",
        key: "remark",
        width: 200,
        ellipsis: true,
      },
      {
        title: "状态",
        dataIndex: "status",
        key: "status",
        width: 80,
        render: (s: PricingStatus) => (
          <Tag color={s === PricingStatus.Active ? "green" : "default"}>
            {STATUS_LABEL_MAP[s]}
          </Tag>
        ),
      },
      {
        title: "操作",
        key: "action",
        width: 140,
        fixed: "right",
        render: (_: unknown, record: PricingDTO) => (
          <Space>
            <Button
              type="link"
              size="small"
              onClick={() => {
                openEdit(record)
              }}
            >
              编辑
            </Button>
            <Popconfirm
              title="确定删除该定价？"
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
    [handleDelete, openEdit]
  )

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Select
          placeholder="状态"
          allowClear
          options={STATUS_OPTIONS}
          onChange={handleStatusFilter}
          style={{ width: 120 }}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新增定价
        </Button>
      </Space>

      <Table<PricingDTO>
        columns={columns}
        dataSource={pricings}
        rowKey="id"
        loading={isLoading}
        scroll={{ x: 1100 }}
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
        title={editing !== null ? "编辑定价" : "新增定价"}
        open={modalOpen}
        onOk={() => {
          handleSubmit().catch(() => {})
        }}
        onCancel={() => {
          setModalOpen(false)
        }}
        destroyOnHidden
        width={520}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="供应商"
            name="supplierId"
            rules={[{ required: true, message: "请选择供应商" }]}
          >
            <SupplierSelector placeholder="搜索供应商" />
          </Form.Item>
          <Form.Item
            label="物料ID"
            name="materialId"
            rules={[{ required: true, message: "请输入物料ID" }]}
          >
            <InputNumber style={{ width: "100%" }} min={0} step={1} />
          </Form.Item>
          <Form.Item
            label="含税单价"
            name="unitPrice"
            rules={[{ required: true, message: "请输入单价" }]}
          >
            <InputNumber style={{ width: "100%" }} min={0.01} precision={4} />
          </Form.Item>
          <Form.Item label="币种" name="currency" initialValue="CNY">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <Input placeholder="备注" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
