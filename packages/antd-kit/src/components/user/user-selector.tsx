

import type { PersonDTO } from "@ps/contracts"
import { useUserList } from "@ps/hooks-business"
import { useDebounce } from "@ps/hooks-core"
import { Select } from "antd"
import React, { useState } from "react"

export interface UserSelectorProps {
  readonly value?: PersonDTO | PersonDTO[]
  readonly onChange?: (value: PersonDTO | PersonDTO[]) => void
  readonly multiple?: boolean
  readonly placeholder?: string
  readonly disabled?: boolean
}

export function UserSelector({
  value,
  onChange,
  multiple = false,
  placeholder = "请选择用户",
  disabled = false,
}: UserSelectorProps): React.ReactNode {
  const [keyword, setKeyword] = useState("")
  const debouncedKeyword = useDebounce(keyword, 300)

  const { data, isLoading } = useUserList({
    keyword: debouncedKeyword || undefined,
    page: 1,
    pageSize: 50,
  })

  const persons = data?.data ?? []

  const options = persons.map((person) => ({
    label: person.name,
    value: person.id,
  }))

  if (multiple) {
    const personArray = Array.isArray(value) ? value : undefined

    return (
      <Select
        mode="multiple"
        showSearch
        filterOption={false}
        onSearch={setKeyword}
        value={personArray?.map((p) => p.id)}
        onChange={(ids: string[]) => {
          const selected = persons.filter((p) => ids.includes(p.id))
          onChange?.(selected)
        }}
        options={options}
        loading={isLoading}
        placeholder={placeholder}
        disabled={disabled}
      />
    )
  }

  const person = Array.isArray(value) ? undefined : value

  return (
    <Select
      showSearch
      filterOption={false}
      onSearch={setKeyword}
      value={person?.id}
      onChange={(id: string) => {
        const selected = persons.find((p) => p.id === id)
        if (selected) {
          onChange?.(selected)
        }
      }}
      options={options}
      loading={isLoading}
      placeholder={placeholder}
      disabled={disabled}
    />
  )
}
