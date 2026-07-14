import type { SupplierDTO } from "@ps/contracts"
import { useSupplierDetail } from "@ps/hooks-business"
import { Descriptions, Popover, Spin, Tag } from "antd"
import React from "react"

interface SupplierPopoverProps {
  readonly id: string
  readonly children: React.ReactNode
}

const STATUS_COLOR_MAP: Record<string, string> = {
  active: "green",
  frozen: "orange",
  obsolete: "red",
}

const STATUS_LABEL_MAP: Record<string, string> = {
  active: "已准入",
  frozen: "冻结",
  obsolete: "淘汰",
}

function SupplierDetailContent({ id }: { readonly id: string }): React.ReactNode {
  const { data, isLoading } = useSupplierDetail(id)

  if (isLoading) {
    return <Spin tip="加载中..." />
  }

  if (!data) {
    return <span>未找到供应商信息</span>
  }

  const supplier: SupplierDTO = data

  return (
    <Descriptions
      column={1}
      size="small"
      bordered
      style={{ maxWidth: 400 }}
    >
      <Descriptions.Item label="名称">
        {supplier.name}
      </Descriptions.Item>
      <Descriptions.Item label="编码">
        {supplier.code}
      </Descriptions.Item>
      <Descriptions.Item label="统一社会信用代码">
        {supplier.creditCode}
      </Descriptions.Item>
      <Descriptions.Item label="联系人">
        {supplier.contactPerson ?? "-"}
      </Descriptions.Item>
      <Descriptions.Item label="联系电话">
        {supplier.contactPhone ?? "-"}
      </Descriptions.Item>
      <Descriptions.Item label="联系邮箱">
        {supplier.contactEmail ?? "-"}
      </Descriptions.Item>
      <Descriptions.Item label="地址">
        {supplier.address ?? "-"}
      </Descriptions.Item>
      <Descriptions.Item label="经营范围">
        {supplier.businessScope ?? "-"}
      </Descriptions.Item>
      <Descriptions.Item label="状态">
        <Tag color={STATUS_COLOR_MAP[supplier.status]}>
          {STATUS_LABEL_MAP[supplier.status]}
        </Tag>
      </Descriptions.Item>
      <Descriptions.Item label="备注">
        {supplier.remark ?? "-"}
      </Descriptions.Item>
      <Descriptions.Item label="创建时间">
        {supplier.createdAt}
      </Descriptions.Item>
    </Descriptions>
  )
}

export function SupplierPopover({
  id,
  children,
}: SupplierPopoverProps): React.ReactNode {
  return (
    <Popover
      content={<SupplierDetailContent id={id} />}
      trigger="hover"
      placement="right"
      overlayStyle={{ maxWidth: 450 }}
    >
      {children}
    </Popover>
  )
}
