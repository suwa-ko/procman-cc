/* eslint-disable import/no-default-export */
import type { Meta, StoryObj } from "@storybook/react"
import { Button } from "antd"
import React from "react"

import { PricingPopover } from "../components/pricing/pricing-popover"
import { PricingSelector } from "../components/pricing/pricing-selector"
import { PricingTable } from "../components/pricing/pricing-table"

const meta: Meta<typeof PricingSelector> = {
  title: "Pricing/PricingSelector",
  component: PricingSelector,
  tags: ["autodocs"],
}

export default meta

type SelectorStory = StoryObj<typeof meta>

export const SelectorDefault: SelectorStory = {
  args: {
    placeholder: "请选择定价",
  },
}

export const SelectorMultiple: SelectorStory = {
  args: {
    multiple: true,
    placeholder: "请选择多条定价",
  },
}

export const TableDefault: StoryObj<typeof PricingTable> = {
  render: () => <PricingTable />,
}

export const PopoverDefault: StoryObj<typeof PricingPopover> = {
  render: () => (
    <PricingPopover id="mock-pricing-1">
      <Button>悬停查看定价详情</Button>
    </PricingPopover>
  ),
}
