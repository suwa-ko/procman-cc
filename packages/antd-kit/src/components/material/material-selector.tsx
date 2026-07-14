import type { MaterialDTO } from "@ps/contracts"
import { useMaterialList } from "@ps/hooks-business"
import { useDebounce } from "@ps/hooks-core"
import { Select } from "antd"
import type { DefaultOptionType } from "antd/es/select"
import React, { useCallback, useMemo, useRef, useState } from "react"

export interface MaterialSelectorProps {
  readonly value?: MaterialDTO | MaterialDTO[]
  readonly onChange?: (value: MaterialDTO | MaterialDTO[]) => void
  readonly multiple?: boolean
  readonly placeholder?: string
  readonly disabled?: boolean
  readonly categoryId?: string
}

function getDisplayLabel(item: MaterialDTO): string {
  if (item.spec !== undefined && item.spec.length > 0) {
    return `${item.name}（${item.spec}）`
  }
  return `${item.name}（${item.code}）`
}

export function MaterialSelector({
  value,
  onChange,
  multiple = false,
  placeholder = "请选择物料",
  disabled = false,
  categoryId,
}: MaterialSelectorProps): React.ReactNode {
  const [keyword, setKeyword] = useState("")
  const debouncedKeyword = useDebounce(keyword, 300)
  const materialMapRef = useRef<Map<string, MaterialDTO>>(new Map())

  const queryParams = useMemo(
    () => ({
      keyword: debouncedKeyword.length > 0 ? debouncedKeyword : undefined,
      categoryId,
      page: 1,
      pageSize: 100,
    }),
    [debouncedKeyword, categoryId]
  )

  const { data, isLoading } = useMaterialList(queryParams)

  const options = useMemo<DefaultOptionType[]>(() => {
    const items = data?.data ?? []
    const newMap = new Map<string, MaterialDTO>()
    for (const item of items) {
      newMap.set(item.id, item)
    }
    materialMapRef.current = newMap
    return items.map((item) => ({
      label: getDisplayLabel(item),
      value: item.id,
    }))
  }, [data])

  const internalValue = useMemo(() => {
    if (value === undefined) {
      return multiple ? [] : undefined
    }
    if (multiple) {
      return (value as MaterialDTO[]).map((v) => v.id)
    }
    return (value as MaterialDTO).id
  }, [value, multiple])

  const handleChange = useCallback(
    (selectedValue: string | string[]) => {
      if (onChange === undefined) {
        return
      }
      const lookup = materialMapRef.current
      if (multiple) {
        const ids = selectedValue as string[]
        const materials = ids
          .map((id) => lookup.get(id))
          .filter((m): m is MaterialDTO => m !== undefined)
        onChange(materials)
      } else {
        const id = selectedValue as string
        const material = lookup.get(id)
        if (material !== undefined) {
          onChange(material)
        }
      }
    },
    [onChange, multiple]
  )

  const handleSearch = useCallback((searchValue: string) => {
    setKeyword(searchValue)
  }, [])

  return (
    <Select
      showSearch
      filterOption={false}
      onSearch={handleSearch}
      value={internalValue}
      onChange={handleChange}
      mode={multiple ? "multiple" : undefined}
      placeholder={placeholder}
      disabled={disabled}
      loading={isLoading}
      options={options}
      allowClear
    />
  )
}
