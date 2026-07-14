import { ContractType } from "@ps/contracts"
import type { TemplateDTO } from "@ps/contracts"
import { useTemplateDetail } from "@ps/hooks-business"
import { Descriptions, Popover, Spin, Tag } from "antd"
import type React from "react"

function contractTypeLabel(t: ContractType): string {
  return t === ContractType.NDA ? "NDA" : "采购合同"
}

export interface TemplatePopoverProps {
  readonly id: string
  readonly children: React.ReactNode
}

function PopoverContent({ template }: { template: TemplateDTO }): React.ReactNode {
  return (
    <Descriptions
      column={1}
      size="small"
      bordered
      style={{ maxWidth: 360 }}
    >
      <Descriptions.Item label="模板名称">
        {template.name}
      </Descriptions.Item>
      <Descriptions.Item label="模板编码">
        {template.code}
      </Descriptions.Item>
      <Descriptions.Item label="合同类型">
        <Tag>{contractTypeLabel(template.contractType)}</Tag>
      </Descriptions.Item>
      <Descriptions.Item label="版本">
        {template.version}
      </Descriptions.Item>
      <Descriptions.Item label="状态">
        {template.enabled ? <Tag color="green">启用</Tag> : <Tag color="red">停用</Tag>}
      </Descriptions.Item>
      <Descriptions.Item label="变量数量">
        {Object.keys(template.variables).length}
      </Descriptions.Item>
      <Descriptions.Item label="创建时间">
        {template.createdAt}
      </Descriptions.Item>
      <Descriptions.Item label="更新时间">
        {template.updatedAt}
      </Descriptions.Item>
    </Descriptions>
  )
}

export function TemplatePopover({
  id,
  children,
}: TemplatePopoverProps): React.ReactNode {
  const { data: template, isLoading } = useTemplateDetail(id)

  const content = isLoading ? <Spin size="small" /> : template ? <PopoverContent template={template} /> : null

  return (
    <Popover content={content} trigger="hover" mouseEnterDelay={0.3}>
      {children}
    </Popover>
  )
}
