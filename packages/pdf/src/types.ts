import type { ContractDTO, ContractEntryDTO } from "@ps/contracts"

/**
 * PDF 渲染上下文。
 * 由调用方 apps/api 组装后传入 @ps/pdf。
 * 本模块不访问数据库，所有数据由调用方提供。
 */
export interface PdfRenderContext {
  /** Handlebars 模板字符串 */
  readonly templateHtml: string

  /** 合同完整数据（含主表 + 条目列表） */
  readonly contract: ContractDTO & {
    readonly entries: readonly ContractEntryDTO[]
  }

  /** 企业 Logo 的 file:// 或 http:// URL（注入到模板的 {{logoUrl}}） */
  readonly logoUrl?: string

  /** 水印文本（默认 "CONFIDENTIAL"） */
  readonly watermark?: string
}

/** PDF 渲染结果 */
export interface PdfRenderResult {
  /** PDF 文件 Buffer */
  readonly pdfBuffer: Buffer

  /** 渲染后的完整 HTML（调试用） */
  readonly html: string
}

/** PDF 生成选项 */
export interface PdfOptions {
  /** 页面格式，默认 "A4" */
  readonly format?: "A4" | "A3" | "Letter" | "Legal"

  /** 是否显示页眉页脚，默认 true */
  readonly displayHeaderFooter?: boolean

  /** 页边距（mm），默认 20 */
  readonly margin?: number
}

/** Handlebars 模板编译结果 */
export interface CompiledTemplate {
  /** 渲染 HTML */
  (context: Record<string, unknown>): string
}

/** Schema 校验失败错误 */
export class PdfValidationError extends Error {
  public readonly issues: readonly string[]

  public constructor(issues: readonly string[]) {
    super(`数据校验失败：${issues.join("；")}`)
    this.name = "PdfValidationError"
    this.issues = issues
  }
}
