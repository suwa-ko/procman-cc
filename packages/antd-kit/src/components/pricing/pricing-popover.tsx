import type { PricingDTO } from "@ps/contracts"
import { usePricingDetail } from "@ps/hooks-business"
import { Descriptions, Popover, Spin, Tag } from "antd"
import type React from "react"

export interface PricingPopoverProps {
  readonly id: string
  readonly children: React.ReactNode
}

const STATUS_TAG_COLOR: Record<string, string> = {
  active: "green",
  inactive: "red",
}

function formatUnitPrice(price: number): string {
  return `¥${price.toFixed(2)}`
}

function buildContent(record: PricingDTO): React.ReactNode {
  return (
    <Descriptions column={1} size="small" bordered>
      <Descriptions.Item label="定价编码">{record.code}</Descriptions.Item>
      <Descriptions.Item label="供应商 ID">
        {record.supplierId}
      </Descriptions.Item>
      <Descriptions.Item label="物料 ID">
        {record.materialId}
      </Descriptions.Item>
      <Descriptions.Item label="单价">
        {formatUnitPrice(record.unitPrice)}
      </Descriptions.Item>
      <Descriptions.Item label="币种">{record.currency}</Descriptions.Item>
      <Descriptions.Item label="状态">
        <Tag color={STATUS_TAG_COLOR[record.status] ?? "default"}>
          {record.status}
        </Tag>
      </Descriptions.Item>
      {record.remark ?
        <Descriptions.Item label="备注">{record.remark}</Descriptions.Item>
       : null}
      <Descriptions.Item label="创建时间">{record.createdAt}</Descriptions.Item>
      <Descriptions.Item label="更新时间">{record.updatedAt}</Descriptions.Item>
    </Descriptions>
  )
}

export function PricingPopover({
  id,
  children,
}: PricingPopoverProps): React.ReactNode {
  const { data, isLoading } = usePricingDetail(id)

  return (
    <Popover
      content={
        isLoading ? <Spin /> : data ? buildContent(data) : null
      }
      trigger="hover"
      placement="right"
    >
      {children}
    </Popover>
  )
}
