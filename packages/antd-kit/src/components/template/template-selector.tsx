import { ContractType } from "@ps/contracts"
import type { TemplateDTO } from "@ps/contracts"
import { useTemplateList } from "@ps/hooks-business"
import { useDebounce } from "@ps/hooks-core"
import { Select } from "antd"
import { useCallback, useMemo, useRef, useState } from "react"

function contractTypeLabel(t: ContractType): string {
  return t === ContractType.NDA ? "NDA" : "采购合同"
}

export interface TemplateSelectorProps {
  /** 当前选中值：支持字符串 ID 或 TemplateDTO 对象（向后兼容） */
  readonly value?: string | string[] | TemplateDTO | TemplateDTO[]
  /** onChange 回调，传出字符串 ID(s) */
  readonly onChange?: (value: string | string[]) => void
  readonly multiple?: boolean
  readonly placeholder?: string
  readonly disabled?: boolean
}

/** 从 value 中提取字符串 ID */
function toId(value: string | TemplateDTO): string {
  return typeof value === "string" ? value : value.id
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

  const templates = data?.data ?? []

  // 使用 ref 避免闭包过期问题
  const templatesRef = useRef(templates)
  templatesRef.current = templates

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
      templates.map((t) => ({
        label: `${t.name} (${contractTypeLabel(t.contractType)})`,
        value: t.id,
      })),
    [templates],
  )

  return (
    <Select
      allowClear
      mode={multiple ? "multiple" : undefined}
      placeholder={placeholder}
      disabled={disabled}
      loading={isLoading}
      showSearch
      filterOption={false}
      value={selectValue}
      options={options}
      onSearch={setKeyword}
      onChange={handleChange}
    />
  )
}
