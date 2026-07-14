import { ContractType } from "@ps/contracts"
import type { TemplateDTO } from "@ps/contracts"
import { useTemplateList } from "@ps/hooks-business"
import { useDebounce } from "@ps/hooks-core"
import { Select } from "antd"
import { useMemo, useState } from "react"

function contractTypeLabel(t: ContractType): string {
  return t === ContractType.NDA ? "NDA" : "采购合同"
}

export interface TemplateSelectorProps {
  readonly value?: TemplateDTO | TemplateDTO[]
  readonly onChange?: (value: TemplateDTO | TemplateDTO[]) => void
  readonly multiple?: boolean
  readonly placeholder?: string
  readonly disabled?: boolean
}

export function TemplateSelector({
  value,
  onChange,
  multiple = false,
  placeholder = "请选择合同模板",
  disabled = false,
}: TemplateSelectorProps): React.ReactNode {
  const [keyword, setKeyword] = useState("")
  const debouncedKeyword = useDebounce(keyword, 300)

  const { data, isLoading } = useTemplateList({
    keyword: debouncedKeyword || undefined,
    page: 1,
    pageSize: 50,
  })

  const options = useMemo(() => {
    if (!data?.data) {
      return []
    }
    return data.data.map((t) => ({
      label: `${t.name} (${contractTypeLabel(t.contractType)})`,
      value: t,
    }))
  }, [data])

  if (multiple) {
    const multiValue = Array.isArray(value) ? value : undefined

    return (
      <Select
        mode="multiple"
        placeholder={placeholder}
        disabled={disabled}
        loading={isLoading}
        showSearch
        filterOption={false}
        value={multiValue}
        options={options}
        onSearch={setKeyword}
        onChange={(selected) => {
          onChange?.(selected)
        }}
      />
    )
  }

  const singleValue = Array.isArray(value) ? undefined : value

  return (
    <Select
      allowClear
      placeholder={placeholder}
      disabled={disabled}
      loading={isLoading}
      showSearch
      filterOption={false}
      value={singleValue}
      options={options}
      onSearch={setKeyword}
      onChange={(selected) => {
        onChange?.(selected)
      }}
    />
  )
}
