/* eslint-disable import/no-default-export */
import type { Meta, StoryObj } from "@storybook/react"
import { Button } from "antd"
import React from "react"

import { SupplierPopover } from "../components/supplier/supplier-popover"
import { SupplierSelector } from "../components/supplier/supplier-selector"
import { SupplierTable } from "../components/supplier/supplier-table"

const meta: Meta<typeof SupplierSelector> = {
  title: "Supplier/SupplierSelector",
  component: SupplierSelector,
  tags: ["autodocs"],
}

export default meta

type SelectorStory = StoryObj<typeof meta>

export const SelectorDefault: SelectorStory = {
  args: {
    placeholder: "请选择供应商",
  },
}

export const SelectorMultiple: SelectorStory = {
  args: {
    placeholder: "请选择供应商（多选）",
    multiple: true,
  },
}

export const TableDefault: StoryObj<typeof SupplierTable> = {
  render: () => <SupplierTable />,
}

export const PopoverDefault: StoryObj<typeof SupplierPopover> = {
  render: () => (
    <SupplierPopover id="supplier-1">
      <Button>悬停查看供应商详情</Button>
    </SupplierPopover>
  ),
}
