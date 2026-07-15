/**
 * 合同管理页面 — CRUD + 状态流转 + 三步分步表单 + 导出为合同模板。
 *
 * 创建合同三步：选择模板 → 填写表单数据 → 预览
 */

import { DownloadOutlined, FileTextOutlined, PlusOutlined } from "@ant-design/icons"
import { SupplierSelector, TemplateSelector } from "@ps/antd-kit"
import { ContractStatus } from "@ps/contracts"
import type {
  ContractDTO,
  ContractQueryParams,
  CreateContractRequest,
  TemplateDTO,
  UpdateContractRequest,
} from "@ps/contracts"
import {
  useContractList,
  useCreateContract,
  useDeleteContract,
  useUpdateContract,
} from "@ps/hooks-business"
import { getHttpClient } from "@ps/web-kit"
import {
  Button,
  DatePicker,
  Descriptions,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Steps,
  Table,
  Tag,
  Typography,
} from "antd"
import type { ColumnsType } from "antd/es/table"
import dayjs from "dayjs"
import React, { useCallback, useMemo, useState } from "react"

const { Text, Title } = Typography

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

const STEP_ITEMS = [
  { title: "选择模板" },
  { title: "填写数据" },
  { title: "预览确认" },
]

export const ContractPage: React.FC = () => {
  const [query, setQuery] = useState<ContractQueryParams>({
    page: 1,
    pageSize: 10,
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ContractDTO | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [_selectedTemplate, setSelectedTemplate] = useState<TemplateDTO | null>(
    null
  )
  const [form] = Form.useForm<CreateContractRequest | UpdateContractRequest>()
  const [exportingId, setExportingId] = useState<string | null>(null)

  const { data, isLoading } = useContractList(query)
  const createMutation = useCreateContract()
  const updateMutation = useUpdateContract()
  const deleteMutation = useDeleteContract()

  const contracts = useMemo<ContractDTO[]>(() => data?.data ?? [], [data])

  const handleSearch = useCallback((keyword: string) => {
    setQuery((prev) => ({ ...prev, keyword: keyword || undefined, page: 1 }))
  }, [])

  const handlePageChange = useCallback((page: number, pageSize: number) => {
    setQuery((prev) => ({ ...prev, page, pageSize }))
  }, [])

  // ---------- 创建：三步分步表单 ----------
  const openCreate = useCallback(() => {
    form.resetFields()
    setEditing(null)
    setCurrentStep(0)
    setSelectedTemplate(null)
    setModalOpen(true)
  }, [form])

  const openEdit = useCallback(
    (record: ContractDTO) => {
      const fieldValues: Record<string, unknown> = {
        name: record.name,
        type: record.type,
        supplierId: record.supplierId,
        templateId: record.templateId,
        totalAmount: record.totalAmount,
        effectiveDate: record.effectiveDate
          ? dayjs(record.effectiveDate)
          : undefined,
        expirationDate: record.expirationDate
          ? dayjs(record.expirationDate)
          : undefined,
        remark: record.remark,
      }
      form.setFieldsValue(fieldValues)
      setEditing(record)
      setCurrentStep(0)
      setModalOpen(true)
    },
    [form]
  )

  /** 步骤1 → 步骤2 */
  const handleStep1Next = useCallback(async () => {
    try {
      await form.validateFields(["templateId", "type"])
      const templateId = form.getFieldValue("templateId") as string | undefined
      setSelectedTemplate(templateId ? { id: templateId } as unknown as TemplateDTO : null)
      setCurrentStep(1)
    } catch {
      // 表单校验字段错误由 antd Form 自动展示
    }
  }, [form])

  /** 步骤2 → 步骤3 */
  const handleStep2Next = useCallback(async () => {
    try {
      await form.validateFields(["name", "supplierId", "totalAmount"])
      setCurrentStep(2)
    } catch {
      // 表单校验字段错误由 antd Form 自动展示
    }
  }, [form])

  /** 步骤3 提交 */
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
    } catch (err) {
      if (err instanceof Error) {
        message.error(err.message).then(() => {}, () => {})
      }
    }
  }, [editing, form, createMutation, updateMutation])

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteMutation.mutateAsync(id)
      message.success("合同已删除").then(() => {}, () => {})
    },
    [deleteMutation]
  )

  const handleStatusAction = useCallback(
    async (id: string, action: string) => {
      try {
        const httpClient = getHttpClient()
        await httpClient.patch(`/api/contracts/${id}/${action}`)
        message.success("操作成功").then(() => {}, () => {})
      } catch (err) {
        if (err instanceof Error) {
          message.error(err.message).then(() => {}, () => {})
        }
      }
    },
    []
  )

  /** 导出为合同模板 — 通过 HttpClient.downloadBlob 获取二进制文件 */
  const handleExportTemplate = useCallback(async (id: string) => {
    setExportingId(id)
    try {
      const httpClient = getHttpClient()
      const blob = await httpClient.downloadBlob(
        `/api/contracts/${id}/pdf`
      )
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `contract-${id}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      message.success("导出成功").then(() => {}, () => {})
    } catch (err) {
      if (err instanceof Error) {
        message.error(err.message).then(() => {}, () => {})
      }
    } finally {
      setExportingId(null)
    }
  }, [])

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
      {
        title: "供应商",
        dataIndex: "supplierName",
        key: "supplierName",
        width: 160,
      },
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
        width: 320,
        fixed: "right",
        render: (_: unknown, record: ContractDTO) => (
          <Space wrap size="small">
            {record.status === ContractStatus.Draft && (
              <Button
                type="link"
                size="small"
                onClick={() => {
                  openEdit(record)
                }}
              >
                编辑
              </Button>
            )}
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
            {(record.status === ContractStatus.Draft ||
              record.status === ContractStatus.Effective) && (
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
              loading={exportingId === record.id}
              onClick={() => {
                handleExportTemplate(record.id).catch(() => {})
              }}
            >
              导出为合同模板
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
    [handleDelete, handleStatusAction, handleExportTemplate, openEdit, exportingId]
  )

  /** 编辑模式：单步表单 */
  const renderEditForm = (): React.ReactElement => (
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
  )

  /** 创建模式：三步分步表单 */
  const renderCreateSteps = (): React.ReactElement => {
    const formValues = form.getFieldsValue()

    const step1 = (
      <>
        <Form.Item
          label="合同类型"
          name="type"
          rules={[{ required: true, message: "请选择合同类型" }]}
          initialValue="purchase"
        >
          <Select
            options={[
              { label: "采购合同", value: "purchase" },
              { label: "保密协议", value: "nda" },
            ]}
            style={{ width: "100%" }}
          />
        </Form.Item>
        <Form.Item
          label="合同模板"
          name="templateId"
          rules={[{ required: true, message: "请选择合同模板" }]}
        >
          <TemplateSelector placeholder="搜索并选择模板" />
        </Form.Item>
        <div
          style={{
            marginTop: 16,
            padding: 16,
            background: "#fafafa",
            borderRadius: 8,
          }}
        >
          <Text type="secondary">
            <FileTextOutlined /> 请选择合同类型和对应的模板文件。模板将决定合同的格式与条款结构。
          </Text>
        </div>
      </>
    )

    const step2 = (
      <>
        <Form.Item
          label="合同名称"
          name="name"
          rules={[{ required: true, message: "请输入合同名称" }]}
        >
          <Input placeholder="例如：2026年度钢材采购合同" />
        </Form.Item>
        <Form.Item
          label="供应商"
          name="supplierId"
          rules={[{ required: true, message: "请选择供应商" }]}
        >
          <SupplierSelector placeholder="搜索供应商" />
        </Form.Item>
        <Form.Item label="合同总额" name="totalAmount">
          <InputNumber style={{ width: "100%" }} min={0} precision={2} placeholder="合同金额" />
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
          <Input.TextArea rows={3} placeholder="合同备注信息" />
        </Form.Item>
      </>
    )

    const step3 = (
      <div>
        <Title level={5} style={{ marginBottom: 16 }}>
          合同预览
        </Title>
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="合同类型">
            {TYPE_LABEL_MAP[(formValues.type as string) ?? "purchase"] ?? "—"}
          </Descriptions.Item>
          <Descriptions.Item label="合同名称">
            {(formValues.name as string) ?? "—"}
          </Descriptions.Item>
          <Descriptions.Item label="模板ID">
            {(formValues.templateId as string) ?? "—"}
          </Descriptions.Item>
          <Descriptions.Item label="供应商ID">
            {(formValues.supplierId as string) ?? "—"}
          </Descriptions.Item>
          <Descriptions.Item label="合同金额">
            {formValues.totalAmount !== undefined
              ? `¥${formValues.totalAmount.toFixed(2)}`
              : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="货币">CNY</Descriptions.Item>
          <Descriptions.Item label="生效日期">
            {formValues.effectiveDate
              ? dayjs(formValues.effectiveDate).format("YYYY-MM-DD")
              : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="到期日期">
            {formValues.expirationDate
              ? dayjs(formValues.expirationDate).format("YYYY-MM-DD")
              : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="备注" span={2}>
            {(formValues.remark as string) ?? "—"}
          </Descriptions.Item>
        </Descriptions>
        <Divider />
        <Text type="secondary">
          请确认以上信息无误，确认后将提交并生成合同。创建后可在列表中查看和操作。
        </Text>
      </div>
    )

    return (
      <div>
        <Steps
          current={currentStep}
          items={STEP_ITEMS}
          style={{ marginBottom: 24 }}
        />
        <Form form={form} layout="vertical" initialValues={{ type: "purchase", currency: "CNY" }}>
          {currentStep === 0 && step1}
          {currentStep === 1 && step2}
          {currentStep === 2 && step3}
        </Form>
      </div>
    )
  }

  /** Modal footer 根据步骤动态变化 */
  const modalFooter = useMemo(() => {
    if (editing !== null) {
      // 编辑模式：单步表单，直接确认
      return [
        <Button
          key="cancel"
          onClick={() => {
            setModalOpen(false)
          }}
        >
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={updateMutation.isPending}
          onClick={() => {
            handleSubmit().catch(() => {})
          }}
        >
          保存
        </Button>,
      ]
    }
    // 创建模式：三步表单
    const stepButtons = []
    if (currentStep > 0) {
      stepButtons.push(
        <Button
          key="prev"
          onClick={() => {
            setCurrentStep((s) => s - 1)
          }}
        >
          上一步
        </Button>
      )
    }
    stepButtons.push(
      <Button
        key="cancel"
        onClick={() => {
          setModalOpen(false)
        }}
      >
        取消
      </Button>
    )
    if (currentStep < 2) {
      stepButtons.push(
        <Button
          key="next"
          type="primary"
          onClick={() => {
            if (currentStep === 0) {
              handleStep1Next().catch(() => {})
            } else {
              handleStep2Next().catch(() => {})
            }
          }}
        >
          下一步
        </Button>
      )
    } else {
      stepButtons.push(
        <Button
          key="submit"
          type="primary"
          loading={createMutation.isPending}
          onClick={() => {
            handleSubmit().catch(() => {})
          }}
        >
          确认创建
        </Button>
      )
    }
    return stepButtons
  }, [editing, currentStep, createMutation.isPending, updateMutation.isPending, handleSubmit, handleStep1Next, handleStep2Next])

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
        title={editing !== null ? "编辑合同" : "新增合同"}
        open={modalOpen}
        footer={modalFooter}
        onCancel={() => {
          setModalOpen(false)
        }}
        destroyOnHidden
        width={640}
      >
        {editing !== null ? renderEditForm() : renderCreateSteps()}
      </Modal>
    </div>
  )
}
