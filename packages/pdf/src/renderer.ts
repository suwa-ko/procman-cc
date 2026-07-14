import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"

import type { createLogger } from "@ps/log"
import puppeteer from "puppeteer"
import type { Browser, Page, PaperFormat } from "puppeteer"

import type { PdfOptions, PdfRenderResult } from "./types"

const DEFAULT_WATERMARK = "CONFIDENTIAL"

function getCurrentDir(): string {
  const filename = fileURLToPath(import.meta.url)
  return resolve(filename, "..")
}

/**
 * 转义用于 CSS content 属性的字符串，防止注入。
 */
function escapeCssString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
}

/**
 * 构建完整的 HTML 文档，注入水印、字体和样式。
 * 独立导出，供 renderPdf 和 previewHtml 共用。
 */
export function buildHtmlDocument(
  bodyHtml: string,
  watermark = DEFAULT_WATERMARK
): string {
  const safeWatermark = escapeCssString(watermark)
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <title>Contract PDF</title>
  <style>
    /* ===== 页面设置 ===== */
    @page {
      size: A4;
      margin: 25mm 20mm 30mm 20mm;
      @bottom-center {
        content: "第 " counter(page) " 页，共 " counter(pages) " 页";
        font-family: "SimSun", "宋体", serif;
        font-size: 9pt;
        color: #666;
      }
    }

    /* ===== 全局 ===== */
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: "SimSun", "宋体", "STSong", "Noto Serif CJK SC", serif;
      font-size: 12pt;
      line-height: 2;
      color: #1a1a1a;
      position: relative;
    }

    /* ===== 标题层级 ===== */
    h1 {
      font-family: "SimHei", "黑体", "STHeiti", "Noto Sans CJK SC", sans-serif;
      font-size: 18pt;
      text-align: center;
      margin: 30px 0 24px;
      font-weight: bold;
      letter-spacing: 4px;
    }

    h2 {
      font-family: "SimHei", "黑体", "STHeiti", "Noto Sans CJK SC", sans-serif;
      font-size: 14pt;
      margin: 20px 0 12px;
      font-weight: bold;
    }

    h3 {
      font-family: "SimHei", "黑体", "STHeiti", "Noto Sans CJK SC", sans-serif;
      font-size: 12pt;
      margin: 14px 0 8px;
      font-weight: bold;
    }

    /* ===== 正文段落 ===== */
    p {
      text-indent: 2em;
      margin: 4px 0;
    }

    p.no-indent { text-indent: 0; }

    /* ===== 合同编号条 ===== */
    .contract-no-line {
      text-align: right;
      font-size: 10.5pt;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid #333;
    }
    .contract-no-line .label { font-weight: bold; }
    .contract-no-line .value { margin-left: 8px; }

    /* ===== 签约概要 ===== */
    .signing-info {
      margin: 20px 0 30px;
      font-size: 10.5pt;
      text-align: right;
      color: #555;
    }
    .signing-info span { margin-left: 24px; }

    /* ===== 前言 ===== */
    .preamble {
      margin: 16px 0 24px;
    }
    .preamble p { text-indent: 2em; }

    /* ===== 当事人信息表 ===== */
    .party-info-table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0 24px;
      font-size: 11pt;
    }
    .party-info-table td {
      padding: 6px 8px;
      vertical-align: top;
      border: none;
    }
    .party-info-table .label-col {
      width: 100px;
      font-weight: bold;
      white-space: nowrap;
      text-align: right;
      padding-right: 4px;
    }
    .party-info-table .value-col {
      text-indent: 0;
    }
    .party-info-table .value-col p { text-indent: 0; margin: 0; }
    .party-info-table .party-sep {
      border-top: 1px dashed #ccc;
    }
    .party-info-table .party-sep td {
      padding-top: 12px;
    }

    /* ===== 采购明细表格 ===== */
    table.purchase-table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0 24px;
      font-size: 10.5pt;
    }
    table.purchase-table th,
    table.purchase-table td {
      border: 1px solid #555;
      padding: 7px 8px;
      text-align: center;
      vertical-align: middle;
    }
    table.purchase-table th {
      background-color: #e8e8e8;
      font-weight: bold;
      font-family: "SimHei", "黑体", "STHeiti", sans-serif;
      font-size: 10.5pt;
    }
    table.purchase-table td {
      font-size: 10.5pt;
    }
    table.purchase-table .col-seq { width: 50px; }
    table.purchase-table .col-name { text-align: left; }
    table.purchase-table .col-spec { text-align: left; }
    table.purchase-table .col-price { text-align: right; }
    table.purchase-table .col-qty { text-align: right; }
    table.purchase-table .col-unit { width: 70px; }
    table.purchase-table .col-total { text-align: right; }
    table.purchase-table tr:nth-child(even) td {
      background-color: #fafafa;
    }
    table.purchase-table .total-row td {
      font-weight: bold;
      background-color: #f0f0f0;
      font-size: 11pt;
    }

    /* ===== 签署区 ===== */
    .signature {
      margin-top: 50px;
      page-break-inside: avoid;
    }
    .signature-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11pt;
    }
    .signature-table td {
      width: 50%;
      padding: 10px 20px;
      vertical-align: top;
    }
    .signature-table .sig-party {
      font-weight: bold;
      font-family: "SimHei", "黑体", "STHeiti", sans-serif;
      font-size: 12pt;
      margin-bottom: 16px;
      text-indent: 0;
    }
    .signature-table .sig-line {
      margin: 12px 0;
      text-indent: 0;
    }
    .signature-table .sig-seal {
      margin-top: 30px;
      text-indent: 0;
      color: #888;
      font-size: 10pt;
    }

    /* ===== 末尾条款编号 ===== */
    .clause-num {
      font-weight: bold;
      font-family: "SimHei", "黑体", "STHeiti", sans-serif;
    }

    /* ===== 水印 ===== */
    body::after {
      content: "${safeWatermark}";
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-family: "SimHei", "黑体", "STHeiti", sans-serif;
      font-size: 72pt;
      color: rgba(0, 0, 0, 0.04);
      pointer-events: none;
      white-space: nowrap;
      z-index: 1000;
    }

    /* ===== 辅助 ===== */
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .mt-8 { margin-top: 8px; }
    .mt-16 { margin-top: 16px; }
    .mt-24 { margin-top: 24px; }
    .mb-16 { margin-bottom: 16px; }
  </style>
</head>
<body>
${bodyHtml}
</body>
</html>`
}

/**
 * PDF 渲染器 —— 将 HTML 字符串转换为 PDF Buffer。
 * 业务无关：不关心 HTML 内容来源，仅做渲染转换。
 */
export class PdfRenderer {
  private browser: Browser | null = null
  private readonly logger: ReturnType<typeof createLogger>

  public constructor(logger: ReturnType<typeof createLogger>) {
    this.logger = logger
  }

  /**
   * 将 HTML 渲染为 PDF Buffer。
   * @param html - 完整的 HTML 文档字符串
   * @param options - PDF 生成选项
   */
  public async render(
    html: string,
    options: PdfOptions = {}
  ): Promise<PdfRenderResult> {
    const page = await this.getPage()
    const { format = "A4", displayHeaderFooter = false, margin = 20 } = options

    try {
      await page.setContent(html, {
        waitUntil: "networkidle0",
        timeout: 30_000,
      })

      const pdfBuffer = Buffer.from(
        await page.pdf({
          format: format as PaperFormat,
          displayHeaderFooter,
          margin: {
            top: `${margin}mm`,
            bottom: `${margin}mm`,
            left: `${margin}mm`,
            right: `${margin}mm`,
          },
          printBackground: true,
          preferCSSPageSize: true,
        })
      )

      this.logger.info("PDF generated successfully", {
        size: pdfBuffer.length,
        format,
      })

      return { pdfBuffer, html }
    } catch (error: unknown) {
      this.logger.error("PDF generation failed", {
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    } finally {
      await page.close()
    }
  }

  /**
   * 释放浏览器实例。
   */
  public async dispose(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
      this.logger.info("Puppeteer browser closed")
    }
  }

  /**
   * 获取或创建 Puppeteer 页面。
   */
  private async getPage(): Promise<Page> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
        ],
      })
      this.logger.info("Puppeteer browser launched")
    }

    return this.browser.newPage()
  }
}

/**
 * 读取内置默认模板 HTML 文件。
 * @param templateName - 模板文件名（不含扩展名），如 "nda.default" | "purchase.default"
 * @returns HTML 模板字符串
 */
export async function loadDefaultTemplate(
  templateName: "nda.default" | "purchase.default"
): Promise<string> {
  const dir = getCurrentDir()
  const filePath = resolve(dir, "templates", `${templateName}.html`)
  return readFile(filePath, "utf-8")
}
