import { useCategoryDetail } from "@ps/hooks-business"
import { Descriptions, Popover, Spin } from "antd"
import React from "react"

export interface CategoryPopoverProps {
  readonly id: string
  readonly children: React.ReactNode
}

export function CategoryPopover({
  id,
  children,
}: CategoryPopoverProps): React.ReactNode {
  const { data, isLoading } = useCategoryDetail(id)

  let content: React.ReactNode = null
  if (isLoading) {
    content = <Spin />
  } else if (data) {
    content = <Descriptions column={1} size="small" bordered>
        <Descriptions.Item label="名称">{data.name}</Descriptions.Item>
        <Descriptions.Item label="编码">{data.code}</Descriptions.Item>
        <Descriptions.Item label="父级品类">
          {data.parentId ?? "-"}
        </Descriptions.Item>
        <Descriptions.Item label="排序">{data.sortOrder}</Descriptions.Item>
      </Descriptions>

  }

  return (
    <Popover content={content} trigger="hover">
      {children}
    </Popover>
  )
}
