import type { MaterialDTO, MaterialStatus } from "@ps/contracts"
import { useMaterialDetail } from "@ps/hooks-business"
import { Descriptions, Popover, Spin, Tag } from "antd"
import React from "react"

export interface MaterialPopoverProps {
  readonly id: string
  readonly children: React.ReactNode
}

const STATUS_COLOR_MAP: Record<string, string> = {
  active: "green",
  inactive: "red",
}

const STATUS_LABEL_MAP: Record<string, string> = {
  active: "启用",
  inactive: "停用",
}

function renderStatusTag(status: MaterialStatus): React.ReactNode {
  return <Tag color={STATUS_COLOR_MAP[status]}>{STATUS_LABEL_MAP[status]}</Tag>
}

function renderContent(material: MaterialDTO): React.ReactNode {
  return (
    <Descriptions column={1} size="small" bordered>
      <Descriptions.Item label="名称">{material.name}</Descriptions.Item>
      <Descriptions.Item label="编码">{material.code}</Descriptions.Item>
      <Descriptions.Item label="规格">
        {material.spec ?? "-"}
      </Descriptions.Item>
      <Descriptions.Item label="单位">{material.unit}</Descriptions.Item>
      <Descriptions.Item label="品类">
        {material.categoryId}
      </Descriptions.Item>
      <Descriptions.Item label="描述">
        {material.description ?? "-"}
      </Descriptions.Item>
      <Descriptions.Item label="状态">
        {renderStatusTag(material.status)}
      </Descriptions.Item>
      <Descriptions.Item label="创建时间">
        {material.createdAt}
      </Descriptions.Item>
      <Descriptions.Item label="更新时间">
        {material.updatedAt}
      </Descriptions.Item>
    </Descriptions>
  )
}

export function MaterialPopover({
  id,
  children,
}: MaterialPopoverProps): React.ReactNode {
  const { data: material, isLoading } = useMaterialDetail(id)

  const loadingContent = <Spin />

  const popoverContent = isLoading
    ? loadingContent
    : material !== undefined
      ? renderContent(material)
      : null

  return (
    <Popover content={popoverContent} trigger="hover">
      {children}
    </Popover>
  )
}
