import type { SupplierDTO } from "@ps/contracts"
import { useSupplierList } from "@ps/hooks-business"
import { Select } from "antd"
import React, { useCallback, useMemo, useRef, useState } from "react"

interface SupplierSelectorProps {
  /** 当前选中值：支持字符串 ID 或 SupplierDTO 对象（向后兼容） */
  readonly value?: string | string[] | SupplierDTO | SupplierDTO[]
  /** onChange 回调，传出字符串 ID(s) */
  readonly onChange?: (value: string | string[]) => void
  readonly multiple?: boolean
  readonly placeholder?: string
  readonly disabled?: boolean
}

/** 从 value 中提取字符串 ID */
function toId(value: string | SupplierDTO): string {
  return typeof value === "string" ? value : value.id
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

  // 使用 ref 避免 handleChange 中的闭包过期问题
  const suppliersRef = useRef(suppliers)
  suppliersRef.current = suppliers

  const handleSearch = useCallback((val: string) => {
    setKeyword(val)
  }, [])

  // 将 value 统一转换为字符串 ID 供 Select 使用
  const selectValue = useMemo(() => {
    if (value === undefined) return undefined
    if (multiple && Array.isArray(value)) return value.map(toId)
    if (!multiple && !Array.isArray(value)) return toId(value)
    return undefined
  }, [value, multiple])

  const handleChange = useCallback(
    (val: string | string[]) => {
      onChange?.(val)
    },
    [onChange],
  )

  const options = useMemo(
    () =>
      suppliers.map((s) => ({
        label: `${s.name} (${s.code})`,
        value: s.id,
      })),
    [suppliers],
  )

  return (
    <Select
      showSearch
      filterOption={false}
      onSearch={handleSearch}
      loading={isLoading}
      placeholder={placeholder}
      disabled={disabled}
      mode={multiple ? "multiple" : undefined}
      value={selectValue}
      onChange={handleChange}
      options={options}
      notFoundContent={isLoading ? "搜索中..." : "无匹配结果"}
    />
  )
}
