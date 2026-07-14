/**
 * PDF 样本生成脚本
 * 用法: npx tsx packages/pdf/scripts/generate-sample.ts
 */
import { mkdir, writeFile } from "node:fs/promises"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

import { LogLevel, createLogger } from "@ps/log"
import { createContract, createContractEntryList } from "@ps/mock"
import type { ContractType } from "@ps/contracts"

import { loadDefaultTemplate } from "../src/renderer"
import { renderPdf } from "../src/index"

const __dirname = dirname(fileURLToPath(import.meta.url))

async function main(): Promise<void> {
  const logger = createLogger({ level: LogLevel.Info })

  // 1. 构造 mock 合同数据（含条目 + content 扩展字段）
  const contract = createContract({
    type: "purchase_contract" as ContractType,
    code: "CTT-2026-0001",
    name: "2026年度CPU采购合同",
    totalAmount: 456000,
    companyName: "成都计算机零部件制造有限公司",
    effectiveDate: "2026-07-14",
    expirationDate: "2027-07-13",
    content: {
      companyAddress: "四川省成都市高新区天府大道XX号",
      handlerName: "张三",
      supplierName: "深圳电子元器件供应有限公司",
      supplierContact: "李四 / 13900000001",
      deliveryClause: "乙方应在合同生效后30个自然日内完成全部交货。",
      deliveryLocation: "甲方指定仓库：四川省成都市高新区XX路XX号。",
      qualityClause:
        "乙方所提供的产品必须符合国家相关质量标准及双方确认的技术规格书。",
      paymentClause: "货到验收合格后60日内，甲方向乙方一次性支付合同总金额。",
      acceptanceClause:
        "甲方在收到货物后15个工作日内完成验收，验收合格后出具验收单。",
      additionalClause: "乙方应免费提供一年的售后技术支持和质量保证服务。",
      liabilityClause:
        "逾期交货每日按未交付产品总金额的0.5%支付违约金，累计违约金不超过合同总金额的10%。",
      disputeClause:
        "因本合同引起的争议，双方应友好协商解决；协商不成的，提交甲方所在地有管辖权的人民法院裁决。",
    },
    handlerName: "张三",
  })

  const entries = createContractEntryList(5, contract.id)
  const contractWithEntries = { ...contract, entries }

  // 2. 加载模板
  const templateHtml = await loadDefaultTemplate("purchase.default")
  logger.info("模板加载成功", { templateLength: templateHtml.length })

  // 3. 渲染 PDF
  logger.info("正在生成 PDF，请稍候...")
  const result = await renderPdf(
    {
      templateHtml,
      contract: contractWithEntries,
      watermark: "样本",
    },
    undefined,
    { format: "A4", margin: 20 },
    logger
  )

  // 4. 保存文件
  const outputDir = resolve(__dirname, "..", "output")
  await mkdir(outputDir, { recursive: true })

  const pdfPath = resolve(outputDir, "sample-purchase-contract.pdf")
  const htmlPath = resolve(outputDir, "sample-purchase-contract.html")

  await writeFile(pdfPath, result.pdfBuffer)
  await writeFile(htmlPath, result.html, "utf-8")

  logger.info("PDF 生成完成", {
    pdfPath,
    pdfSize: result.pdfBuffer.length,
    htmlPath,
  })
}

main().catch((err: unknown) => {
  console.error("生成失败:", err)
  process.exit(1)
})
