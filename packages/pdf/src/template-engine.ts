import Handlebars from "handlebars"

import type { CompiledTemplate } from "./types"

/**
 * 注册自定义 Handlebars Helpers。
 * 在模板编译前调用一次即可。
 */
function registerHelpers(): void {
  Handlebars.registerHelper("currency", (value: unknown) => {
    const n = Number(value)
    if (Number.isNaN(n)) {
      return "¥0.00"
    }
    return `¥${n.toFixed(2)}`
  })

  Handlebars.registerHelper("date", (value: unknown) => {
    if (typeof value !== "string" || value.length === 0) {
      return "-"
    }
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) {
      return value
    }
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  })

  Handlebars.registerHelper("default", (value: unknown, fallback: string) => {
    if (value === null || value === undefined || value === "") {
      return fallback
    }
    return String(value)
  })

  Handlebars.registerHelper("eq", (a: unknown, b: unknown) => {
    return a === b
  })

  Handlebars.registerHelper("inc", (value: unknown) => {
    return Number(value) + 1
  })
}

export { Handlebars }

let helpersRegistered = false

/**
 * 编译 Handlebars 模板字符串为可执行函数。
 * 首次调用自动注册 helpers。
 */
export function compileTemplate(templateHtml: string): CompiledTemplate {
  if (!helpersRegistered) {
    registerHelpers()
    helpersRegistered = true
  }
  return Handlebars.compile(templateHtml)
}

/**
 * 编译并渲染 Handlebars 模板。
 * @param templateHtml - Handlebars 模板字符串
 * @param context - 模板数据上下文
 * @returns 渲染后的 HTML 字符串
 */
export function renderTemplate(
  templateHtml: string,
  context: Record<string, unknown>
): string {
  const template = compileTemplate(templateHtml)
  return template(context)
}
