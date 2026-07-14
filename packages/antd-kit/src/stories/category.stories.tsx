/* eslint-disable import/no-default-export */
import type { Meta, StoryObj } from "@storybook/react"
import { Button } from "antd"
import React from "react"

import { CategoryPopover } from "../components/category/category-popover"
import { CategorySelector } from "../components/category/category-selector"
import { CategoryTable } from "../components/category/category-table"

const meta: Meta<typeof CategorySelector> = {
  title: "Category/CategorySelector",
  component: CategorySelector,
  tags: ["autodocs"],
}

export default meta

type SelectorStory = StoryObj<typeof meta>

export const SelectorDefault: SelectorStory = {
  args: {
    placeholder: "请选择品类",
  },
}

export const SelectorMultiple: SelectorStory = {
  args: {
    placeholder: "请选择品类（多选）",
    multiple: true,
  },
}

export const TableDefault: StoryObj<typeof CategoryTable> = {
  render: () => <CategoryTable />,
}

export const PopoverDefault: StoryObj<typeof CategoryPopover> = {
  render: () => (
    <CategoryPopover id="mock-category-1">
      <Button>悬停查看品类详情</Button>
    </CategoryPopover>
  ),
}
