import type { createLogger } from "@ps/log"
import type { ZodSchema } from "zod"

import { buildHtmlDocument, PdfRenderer } from "./renderer"
import { renderTemplate } from "./template-engine"
import type { PdfOptions, PdfRenderContext, PdfRenderResult } from "./types"
import { validateData } from "./validate"

// 导出公共类型
export type {
  PdfRenderContext,
  PdfRenderResult,
  PdfOptions,
  CompiledTemplate,
} from "./types"

export { PdfValidationError } from "./types"

// 导出模板引擎
export { compileTemplate, renderTemplate } from "./template-engine"

// 导出 schema 校验
export { validateData } from "./validate"

// 导出渲染函数
export { PdfRenderer, buildHtmlDocument, loadDefaultTemplate } from "./renderer"

/**
 * 从渲染上下文提取 Handlebars 模板上下文。
 * renderPdf 和 previewHtml 共用此逻辑。
 */
function buildTemplateContext(
  context: PdfRenderContext
): Record<string, unknown> {
  return {
    contract: context.contract,
    logoUrl: context.logoUrl,
  }
}

/**
 * 将合同数据渲染为 PDF Buffer。
 *
 * 管线：数据 → Zod Schema 校验 → Handlebars 模板渲染 → HTML 文档构建 → Puppeteer PDF
 *
 * 业务无关：本函数仅接收模板 HTML + 数据上下文 + 可选校验 Schema，
 * 不访问数据库、不处理业务逻辑。
 *
 * @param context - PDF 渲染上下文（模板 + 数据）
 * @param schema - 可选 Zod Schema，传入后先校验数据再渲染
 * @param pdfOptions - 可选 PDF 页面设置
 * @param logger - 日志器
 *
 * @example
 * ```ts
 * import { z } from "zod"
 * const schema = z.object({ contract: z.object({ code: z.string() }) })
 * const result = await renderPdf(context, schema, { format: "A4" }, logger)
 * ```
 */
export async function renderPdf(
  context: PdfRenderContext,
  schema: ZodSchema | undefined,
  pdfOptions: PdfOptions | undefined,
  logger: ReturnType<typeof createLogger>
): Promise<PdfRenderResult> {
  const { templateHtml, watermark } = context

  // Step 1: 构建模板上下文
  const templateContext = buildTemplateContext(context)

  // Step 2: 校验数据（如果提供了 schema）
  if (schema) {
    validateData(schema, templateContext)
    const keys = Object.keys(templateContext)
    logger.info("Schema validation passed", {
      keys: keys.length,
    })
  }

  // Step 3: Handlebars 渲染
  const bodyHtml = renderTemplate(templateHtml, templateContext)

  // Step 4: 构建完整 HTML 文档
  const fullHtml = buildHtmlDocument(bodyHtml, watermark)

  // Step 5: Puppeteer 生成 PDF
  const renderer = new PdfRenderer(logger)
  try {
    return await renderer.render(fullHtml, pdfOptions ?? {})
  } finally {
    await renderer.dispose()
  }
}

/**
 * 渲染合同 HTML（供在线预览，不生成 PDF）。
 *
 * 管线：数据 → Zod Schema 校验 → Handlebars 模板渲染 → HTML 文档构建
 */
export function previewHtml(
  context: PdfRenderContext,
  schema?: ZodSchema
): string {
  const { templateHtml, watermark } = context

  const templateContext = buildTemplateContext(context)

  if (schema) {
    validateData(schema, templateContext)
  }

  const bodyHtml = renderTemplate(templateHtml, templateContext)
  return buildHtmlDocument(bodyHtml, watermark)
}
