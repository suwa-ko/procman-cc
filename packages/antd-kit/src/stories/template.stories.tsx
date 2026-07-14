/* eslint-disable import/no-default-export */
import type { Meta, StoryObj } from "@storybook/react"
import { Button } from "antd"
import React from "react"

import { TemplatePopover } from "../components/template/template-popover"
import { TemplateSelector } from "../components/template/template-selector"
import { TemplateTable } from "../components/template/template-table"

const meta: Meta<typeof TemplateSelector> = {
  title: "Template/TemplateSelector",
  component: TemplateSelector,
  tags: ["autodocs"],
}

export default meta

type SelectorStory = StoryObj<typeof meta>

export const SelectorDefault: SelectorStory = {
  args: {
    placeholder: "请选择合同模板",
  },
}

export const SelectorMultiple: SelectorStory = {
  args: {
    multiple: true,
    placeholder: "请选择多个合同模板",
  },
}

export const TableDefault: StoryObj<typeof TemplateTable> = {
  render: () => <TemplateTable />,
}

export const PopoverDefault: StoryObj<typeof TemplatePopover> = {
  render: () => (
    <TemplatePopover id="mock-template-1">
      <Button>悬停查看模板详情</Button>
    </TemplatePopover>
  ),
}
