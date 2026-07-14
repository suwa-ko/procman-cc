import type { SupplierDTO } from "@ps/contracts"
import { useSupplierList } from "@ps/hooks-business"
import { Select } from "antd"
import React, { useCallback, useState } from "react"

interface SupplierSelectorProps {
  readonly value?: SupplierDTO | SupplierDTO[]
  readonly onChange?: (value: SupplierDTO | SupplierDTO[]) => void
  readonly multiple?: boolean
  readonly placeholder?: string
  readonly disabled?: boolean
}

export function SupplierSelector({
  value,
  onChange,
  multiple = false,
  placeholder = "请选择供应商",
  disabled = false,
}: SupplierSelectorProps): React.ReactNode {
  const [keyword, setKeyword] = useState<string>("")

  const { data, isLoading } = useSupplierList({
    keyword: keyword || undefined,
    page: 1,
    pageSize: 50,
  })

  const suppliers = data?.data ?? []

  const handleSearch = useCallback((val: string) => {
    setKeyword(val)
  }, [])

  const handleChange = useCallback(
    (val: SupplierDTO | SupplierDTO[]) => {
      onChange?.(val)
    },
    [onChange],
  )

  const options = suppliers.map((s) => ({
    label: `${s.name} (${s.code})`,
    value: s,
  }))

  return (
    <Select
      showSearch
      filterOption={false}
      onSearch={handleSearch}
      loading={isLoading}
      placeholder={placeholder}
      disabled={disabled}
      mode={multiple ? "multiple" : undefined}
      value={value}
      onChange={handleChange}
      options={options}
      notFoundContent={isLoading ? "搜索中..." : "无匹配结果"}
    />
  )
}
