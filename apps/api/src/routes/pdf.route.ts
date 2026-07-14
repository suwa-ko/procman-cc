/**
 * PDF 导出路由。
 *
 * 提供合同 PDF 生成端点，使用 @ps/pdf 的 renderPdf + loadDefaultTemplate。
 * 路由挂载于 /api/contracts 下，提供 GET /:id/pdf。
 */

import type { ContractDTO, ContractEntryDTO } from "@ps/contracts"
import { ContractEntryRepo, ContractRepo } from "@ps/db"
import { loadDefaultTemplate, renderPdf } from "@ps/pdf"
import { Hono } from "hono"

import type { AppDependencies } from "../types"

export function pdfRoutes(deps: AppDependencies): Hono {
  const contractRepo = new ContractRepo(deps.db)
  const entryRepo = new ContractEntryRepo(deps.db)
  const router = new Hono()

  // ---------- GET /contracts/:id/pdf — 导出合同 PDF ----------
  router.get("/:id/pdf", async (c) => {
    const contractId = c.req.param("id")

    // 1. 查询合同主表
    const contract = await contractRepo.findById(contractId)
    if (contract === null) {
      return c.json(
        { code: 4004, data: null, message: "合同不存在" },
        404
      )
    }

    // 2. 查询合同条目
    const entries = await entryRepo.findByContractId(contractId)

    // 3. 组装 PdfRenderContext 所需的 contract 数据
    const contractWithEntries: ContractDTO & {
      entries: readonly ContractEntryDTO[]
    } = {
      ...(contract as unknown as ContractDTO),
      entries: entries as readonly ContractEntryDTO[],
    }

    // 4. 加载默认合同模板
    // 使用 purchase.default 模板（通用采购合同）
    const templateHtml = await loadDefaultTemplate("purchase.default")

    // 5. 渲染 PDF
    const result = await renderPdf(
      {
        templateHtml,
        contract: contractWithEntries,
      },
      undefined,
      { format: "A4" },
      deps.db.logger
    )

    // 6. 返回 PDF（转 Uint8Array 以兼容 BodyInit）
    return new Response(new Uint8Array(result.pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="contract-${contract.code}.pdf"`,
      },
    })
  })

  return router
}
