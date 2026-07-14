import type { CategoryDTO, CategoryQueryParams } from "@ps/contracts"
import { useCategoryList } from "@ps/hooks-business"
import { Select } from "antd"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"

interface CategorySelectorProps {
  value?: CategoryDTO | CategoryDTO[]
  onChange?: (value: CategoryDTO | CategoryDTO[]) => void
  multiple?: boolean
  placeholder?: string
  disabled?: boolean
}

const DEBOUNCE_MS = 300
const DEFAULT_PAGE_SIZE = 50

export function CategorySelector({
  value,
  onChange,
  multiple = false,
  placeholder = "请选择品类",
  disabled = false,
}: CategorySelectorProps): React.ReactNode {
  const [debouncedKeyword, setDebouncedKeyword] = useState("")
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const handleSearch = useCallback((searchValue: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    timerRef.current = setTimeout(() => {
      setDebouncedKeyword(searchValue)
    }, DEBOUNCE_MS)
  }, [])

  const queryParams: CategoryQueryParams = {
    keyword: debouncedKeyword || undefined,
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  }

  const { data, isLoading } = useCategoryList(queryParams)

  const options = useMemo(() => {
    return (data?.data ?? []).map((item) => ({
      label: `${item.name} (${item.code})`,
      value: item.id,
    }))
  }, [data])

  const categoryMap = useMemo(() => {
    const map = new Map<string, CategoryDTO>()
    for (const item of data?.data ?? []) {
      map.set(item.id, item)
    }
    return map
  }, [data])

  const selectValue = multiple
    ? (value as CategoryDTO[] | undefined)?.map((v) => v.id)
    : (value as CategoryDTO | undefined)?.id

  const handleChange = useCallback(
    (selected: string | string[]) => {
      if (!onChange) {
        return
      }
      if (multiple) {
        const ids = selected as string[]
        const categories = ids
          .map((id) => categoryMap.get(id))
          .filter((c): c is CategoryDTO => c !== undefined)
        onChange(categories)
      } else {
        const selectedId = selected as string
        const category = categoryMap.get(selectedId)
        if (category) {
          onChange(category)
        }
      }
    },
    [multiple, onChange, categoryMap],
  )

  return (
    <Select
      showSearch
      filterOption={false}
      onSearch={handleSearch}
      value={selectValue}
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
