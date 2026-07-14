/* eslint-disable import/no-default-export */
import type { Meta, StoryObj } from "@storybook/react"
import { Button } from "antd"
import React from "react"

import { MaterialPopover } from "../components/material/material-popover"
import { MaterialSelector } from "../components/material/material-selector"
import { MaterialTable } from "../components/material/material-table"

const meta: Meta<typeof MaterialSelector> = {
  title: "Material/MaterialSelector",
  component: MaterialSelector,
  tags: ["autodocs"],
}

export default meta

type SelectorStory = StoryObj<typeof meta>

export const SelectorDefault: SelectorStory = {
  args: {
    placeholder: "请选择物料",
  },
}

export const SelectorMultiple: SelectorStory = {
  args: {
    placeholder: "请选择物料（多选）",
    multiple: true,
  },
}

export const TableDefault: StoryObj<typeof MaterialTable> = {
  render: () => <MaterialTable />,
}

export const PopoverDefault: StoryObj<typeof MaterialPopover> = {
  render: () => (
    <MaterialPopover id="mock-material-1">
      <Button>悬停查看物料详情</Button>
    </MaterialPopover>
  ),
}
