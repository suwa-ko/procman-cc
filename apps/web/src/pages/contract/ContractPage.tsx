/**
 * 合同管理页面 — CRUD + 状态流转 + PDF 导出。
 */

import { DownloadOutlined, PlusOutlined } from "@ant-design/icons"
import { SupplierSelector, TemplateSelector } from "@ps/antd-kit"
import { ContractStatus } from "@ps/contracts"
import type {
  ContractDTO,
  ContractQueryParams,
  CreateContractRequest,
  UpdateContractRequest,
} from "@ps/contracts"
import {
  useContractList,
  useCreateContract,
  useDeleteContract,
  useUpdateContract,
} from "@ps/hooks-business"
import {
  Button,
  DatePicker,
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
  Typography,
} from "antd"
import type { ColumnsType } from "antd/es/table"
import dayjs from "dayjs"
import React, { useCallback, useMemo, useState } from "react"


const { Text } = Typography

const STATUS_LABEL_MAP: Record<string, string> = {
  draft: "草稿",
  effective: "已生效",
  archived: "已归档",
  voided: "已作废",
}

const STATUS_COLOR_MAP: Record<string, string> = {
  draft: "default",
  effective: "green",
  archived: "blue",
  voided: "red",
}

const TYPE_LABEL_MAP: Record<string, string> = {
  purchase: "采购合同",
  nda: "保密协议",
}

export const ContractPage: React.FC = () => {
  const [query, setQuery] = useState<ContractQueryParams>({
    page: 1,
    pageSize: 10,
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ContractDTO | null>(null)
  const [form] = Form.useForm<CreateContractRequest | UpdateContractRequest>()

  const { data, isLoading } = useContractList(query)
  const createMutation = useCreateContract()
  const updateMutation = useUpdateContract()
  const deleteMutation = useDeleteContract()

  const contracts = useMemo<ContractDTO[]>(() => data?.data ?? [], [data])

  const handleSearch = useCallback((keyword: string) => {
    setQuery((prev) => ({ ...prev, keyword: keyword || undefined, page: 1 }))
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

  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields()
      const payload = {
        ...values,
        effectiveDate: values.effectiveDate
          ? dayjs(values.effectiveDate).format("YYYY-MM-DD")
          : undefined,
        expirationDate: values.expirationDate
          ? dayjs(values.expirationDate).format("YYYY-MM-DD")
          : undefined,
      }
      if (editing !== null) {
        await updateMutation.mutateAsync({ id: editing.id, data: payload })
        message.success("合同更新成功").then(() => {}, () => {})
      } else {
        await createMutation.mutateAsync(payload as CreateContractRequest)
        message.success("合同创建成功").then(() => {}, () => {})
      }
      setModalOpen(false)
    } catch {
      // eslint-disable-next-line no-empty
    }
  }, [editing, form, createMutation, updateMutation])

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteMutation.mutateAsync(id)
      message.success("合同已删除").then(() => {}, () => {})
    },
    [deleteMutation],
  )

  const handleStatusAction = useCallback(
    async (id: string, action: string) => {
      try {
        const resp = await fetch(`/api/contracts/${id}/${action}`, {
          method: "PATCH",
        })
        const data = (await resp.json()) as { code: number; message: string }
        if (data.code === 0) {
          message.success("操作成功").then(() => {}, () => {})
        } else {
          message.error(data.message || "操作失败").then(() => {}, () => {})
        }
      } catch {
        message.error("网络错误").then(() => {}, () => {})
      }
    },
    [],
  )

  const handleExportPdf = useCallback(
    async (id: string) => {
      try {
        const pdfResp = await fetch(`/api/contracts/${id}/pdf`)
        if (!pdfResp.ok) {
          message.error("PDF 导出失败").then(() => {}, () => {})
          return
        }
        const blob = await pdfResp.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        // 从响应头或默认命名
        const disposition = pdfResp.headers.get("Content-Disposition") ?? ""
        const match = disposition.match(/filename="(.+)"/)
        a.download = match?.[1] ?? "contract.pdf"
        a.click()
        URL.revokeObjectURL(url)
      } catch {
        message.error("PDF 导出失败").then(() => {}, () => {})
      }
    },
    [],
  )

  const columns = useMemo<ColumnsType<ContractDTO>>(
    () => [
      { title: "合同编号", dataIndex: "code", key: "code", width: 140 },
      { title: "名称", dataIndex: "name", key: "name", width: 200 },
      {
        title: "类型",
        dataIndex: "type",
        key: "type",
        width: 100,
        render: (t: string) => TYPE_LABEL_MAP[t] ?? t,
      },
      { title: "供应商", dataIndex: "supplierName", key: "supplierName", width: 160 },
      {
        title: "金额",
        dataIndex: "totalAmount",
        key: "totalAmount",
        width: 110,
        align: "right",
        render: (v: number) => v !== null ? `¥${v.toFixed(2)}` : "—",
      },
      {
        title: "有效期",
        key: "period",
        width: 200,
        render: (_: unknown, record: ContractDTO) => (
          <Text>
            {record.effectiveDate ?? "—"} ~ {record.expirationDate ?? "—"}
          </Text>
        ),
      },
      {
        title: "状态",
        dataIndex: "status",
        key: "status",
        width: 80,
        render: (s: ContractStatus) =>
          <Tag color={STATUS_COLOR_MAP[s]}>{STATUS_LABEL_MAP[s]}</Tag>
        ,
      },
      {
        title: "操作",
        key: "action",
        width: 280,
        fixed: "right",
        render: (_: unknown, record: ContractDTO) => (
          <Space wrap size="small">
            {record.status === ContractStatus.Draft && (
              <Popconfirm
                title="确定生效该合同？生效后不可编辑"
                onConfirm={() => {
                  handleStatusAction(record.id, "activate").catch(() => {})
                }}
              >
                <Button type="link" size="small">
                  生效
                </Button>
              </Popconfirm>
            )}
            {record.status === ContractStatus.Effective && (
              <Popconfirm
                title="确定退回草稿？"
                onConfirm={() => {
                  handleStatusAction(record.id, "return-to-draft").catch(() => {})
                }}
              >
                <Button type="link" size="small">
                  退回
                </Button>
              </Popconfirm>
            )}
            {(record.status === ContractStatus.Draft || record.status === ContractStatus.Effective) && (
              <Popconfirm
                title="确定作废该合同？此操作不可逆"
                onConfirm={() => {
                  handleStatusAction(record.id, "void").catch(() => {})
                }}
              >
                <Button type="link" size="small" danger>
                  作废
                </Button>
              </Popconfirm>
            )}
            <Button
              type="link"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => {
                handleExportPdf(record.id).catch(() => {})
              }}
            >
              PDF
            </Button>
            <Popconfirm
              title="确定删除该合同？"
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
    [handleDelete, handleStatusAction, handleExportPdf],
  )

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="搜索合同名称/编号"
          allowClear
          onSearch={handleSearch}
          style={{ width: 260 }}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新增合同
        </Button>
      </Space>

      <Table<ContractDTO>
        columns={columns}
        dataSource={contracts}
        rowKey="id"
        loading={isLoading}
        scroll={{ x: 1300 }}
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
        title="新增合同"
        open={modalOpen}
        onOk={() => {
  handleSubmit().catch(() => {})
}}
        onCancel={() => {
 setModalOpen(false)
}}
        destroyOnHidden
        width={560}
        confirmLoading={createMutation.isPending}
      >
        <Form form={form} layout="vertical" initialValues={{ type: "purchase" }}>
          <Form.Item
            label="合同名称"
            name="name"
            rules={[{ required: true, message: "请输入合同名称" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="合同类型"
            name="type"
            rules={[{ required: true, message: "请选择合同类型" }]}
          >
            <Select
              options={[
                { label: "采购合同", value: "purchase" },
                { label: "保密协议", value: "nda" },
              ]}
            />
          </Form.Item>
          <Form.Item
            label="供应商"
            name="supplierId"
            rules={[{ required: true, message: "请选择供应商" }]}
          >
            <SupplierSelector placeholder="搜索供应商" />
          </Form.Item>
          <Form.Item
            label="合同模板"
            name="templateId"
            rules={[{ required: true, message: "请选择合同模板" }]}
          >
            <TemplateSelector placeholder="搜索模板" />
          </Form.Item>
          <Form.Item label="合同总额" name="totalAmount">
            <InputNumber style={{ width: "100%" }} min={0} precision={2} />
          </Form.Item>
          <Space style={{ width: "100%" }} size="middle">
            <Form.Item label="生效日期" name="effectiveDate">
              <DatePicker />
            </Form.Item>
            <Form.Item label="到期日期" name="expirationDate">
              <DatePicker />
            </Form.Item>
          </Space>
          <Form.Item label="备注" name="remark">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
