import type { PricingDTO } from "@ps/contracts"
import { usePricingList } from "@ps/hooks-business"
import { Select } from "antd"
import type React from "react"
import { useMemo, useState } from "react"

export interface PricingSelectorProps {
  readonly value?: PricingDTO | PricingDTO[]
  readonly onChange?: (value: PricingDTO | PricingDTO[]) => void
  readonly multiple?: boolean
  readonly placeholder?: string
  readonly disabled?: boolean
}

function filterByKeyword(items: PricingDTO[], keyword: string): PricingDTO[] {
  const lower = keyword.toLowerCase()
  return items.filter(
    (item) =>
      item.supplierId.toLowerCase().includes(lower) ||
      item.materialId.toLowerCase().includes(lower)
  )
}

function formatLabel(item: PricingDTO): string {
  return `${item.supplierId} - ${item.materialId} (¥${item.unitPrice.toFixed(2)})`
}

export function PricingSelector({
  value,
  onChange,
  multiple = false,
  placeholder = "请选择定价",
  disabled = false,
}: PricingSelectorProps): React.ReactNode {
  const [keyword, setKeyword] = useState("")
  const { data, isLoading } = usePricingList({ page: 1, pageSize: 100 })

  const options = useMemo(() => {
    const list = data?.data ?? []
    const filtered = keyword ? filterByKeyword(list, keyword) : list
    return filtered.map((item) => ({
      label: formatLabel(item),
      value: item.id,
      item,
    }))
  }, [data, keyword])

  const handleChange = (
    selectedIds: string | string[]
  ): void => {
    if (!onChange) {
      return
    }
    if (multiple) {
      const ids = Array.isArray(selectedIds) ? selectedIds : [selectedIds]
      const selectedItems = ids
        .map((id) => options.find((opt) => opt.value === id)?.item)
        .filter((item): item is PricingDTO => item !== undefined)
      onChange(selectedItems)
    } else {
      const id = Array.isArray(selectedIds) ? selectedIds[0] : selectedIds
      const selectedItem = id
        ? options.find((opt) => opt.value === id)?.item
        : undefined
      if (selectedItem) {
        onChange(selectedItem)
      }
    }
  }

  const selectedValue = useMemo(() => {
    if (value === undefined) {
      return undefined
    }
    if (multiple) {
      return (value as PricingDTO[]).map((v) => v.id)
    }
    return (value as PricingDTO).id
  }, [value, multiple])

  return (
    <Select
      showSearch
      value={selectedValue}
      onChange={handleChange}
      onSearch={setKeyword}
      mode={multiple ? "multiple" : undefined}
      placeholder={placeholder}
      disabled={disabled}
      loading={isLoading}
      filterOption={false}
      options={options}
      optionLabelProp="label"
    />
  )
}
