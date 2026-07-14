import { useUserDetail } from "@ps/hooks-business"
import { Descriptions, Popover, Spin } from "antd"
import React from "react"

export interface UserPopoverProps {
  readonly id: string
  readonly children: React.ReactNode
}

export function UserPopover({
  id,
  children,
}: UserPopoverProps): React.ReactNode {
  const { data, isLoading } = useUserDetail(id)

  const content: React.ReactNode = isLoading ?
    <Spin />
   : data ?
    <Descriptions column={1} size="small" bordered>
      <Descriptions.Item label="ID">{data.id}</Descriptions.Item>
      <Descriptions.Item label="姓名">{data.name}</Descriptions.Item>
    </Descriptions>
   : null

  return (
    <Popover content={content} trigger="hover">
      {children}
    </Popover>
  )
}
