/* eslint-disable import/no-default-export */
import type { Meta, StoryObj } from "@storybook/react"
import { Button } from "antd"
import React from "react"

import { UserPopover } from "../components/user/user-popover"
import { UserSelector } from "../components/user/user-selector"
import { UserTable } from "../components/user/user-table"

const meta: Meta<typeof UserSelector> = {
  title: "User/UserSelector",
  component: UserSelector,
  tags: ["autodocs"],
}

export default meta

type SelectorStory = StoryObj<typeof meta>

export const SelectorDefault: SelectorStory = {
  args: {
    placeholder: "请选择用户",
  },
}

export const SelectorMultiple: SelectorStory = {
  args: {
    multiple: true,
    placeholder: "请选择多个用户",
  },
}

export const TableDefault: StoryObj<typeof UserTable> = {
  render: () => <UserTable />,
}

export const PopoverDefault: StoryObj<typeof UserPopover> = {
  render: () => (
    <UserPopover id="mock-user-1">
      <Button>悬停查看用户详情</Button>
    </UserPopover>
  ),
}
