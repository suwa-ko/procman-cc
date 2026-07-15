/**
 * 模型 CRUD 配置映射表。
 *
 * 每个业务模型的 CRUD 行为集中定义在此处：
 * - 标准 CRUD：supplier / material / category / template
 * - 自定义创建（服务层）：pricing / contract
 * - 只读：person
 * - 扩展路由：contract（状态转换、条目查询）
 *
 * 新增模型时只需在此文件添加配置即可自动获得 RESTful API。
 */

import type { ContractDTO, ContractEntryDTO } from "@ps/contracts"
import {
  CategoryRepo,
  CodeSequenceRepo,
  ContractEntryRepo,
  ContractRepo,
  MaterialRepo,
  PersonRepo,
  PricingRepo,
  SupplierRepo,
  TemplateRepo,
} from "@ps/db"
import type { DbClient } from "@ps/db"

import { ContractService } from "../services/contract.service"
import { PriceService } from "../services/price.service"
import { nextCode } from "../services/code.service"
import type { AppDependencies } from "../types"
import type { CrudModelConfig, StandardRepo } from "./crud-routes"
import { loadDefaultTemplate, renderPdf } from "@ps/pdf"
import { successResponse } from "@ps/types-base"

// ============================================================================
// 配置表
// ============================================================================

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 全量模型 CRUD 配置。
 * 键名对应 ModelRegistry 注册名称和 API 路径前缀。
 */
export const MODEL_CONFIGS: Record<string, CrudModelConfig> = {
  // -------- 供应商 --------
  supplier: {
    name: "supplier",
    tableName: "suppliers",
    RepoClass: SupplierRepo as any as new (db: DbClient) => StandardRepo,
    label: "供应商",
    codePrefix: "SUP",
    queryFilters: [
      { param: "keyword", column: "name", operator: "ilike" },
      { param: "status", column: "status", operator: "eq" },
    ],
  },

  // -------- 物料 --------
  material: {
    name: "material",
    tableName: "materials",
    RepoClass: MaterialRepo as any as new (db: DbClient) => StandardRepo,
    label: "物料",
    codePrefix: "MAT",
    queryFilters: [
      { param: "keyword", column: "name", operator: "ilike" },
      { param: "categoryId", column: "categoryId", operator: "eq" },
      { param: "status", column: "status", operator: "eq" },
    ],
  },

  // -------- 品类 --------
  category: {
    name: "category",
    tableName: "categories",
    RepoClass: CategoryRepo as any as new (db: DbClient) => StandardRepo,
    label: "品类",
    queryFilters: [
      { param: "keyword", column: "name", operator: "ilike" },
      { param: "parentId", column: "parentId", operator: "eq" },
    ],
  },

  // -------- 定价（自定义创建：自动失效） --------
  pricing: {
    name: "pricing",
    tableName: "pricings",
    RepoClass: PricingRepo as any as new (db: DbClient) => StandardRepo,
    label: "定价",
    queryFilters: [
      { param: "supplierId", column: "supplierId", operator: "eq" },
      { param: "materialId", column: "materialId", operator: "eq" },
      { param: "status", column: "status", operator: "eq" },
    ],
    onCreate: async (deps, body) => {
      const repo = new PricingRepo(deps.db)
      const codeRepo = new CodeSequenceRepo(deps.db)
      const service = new PriceService(repo, codeRepo)
      return service.create(body as any)
    },
  },

  // -------- 合同（自定义更新 + 扩展路由） --------
  contract: {
    name: "contract",
    tableName: "contracts",
    RepoClass: ContractRepo as any as new (db: DbClient) => StandardRepo,
    label: "合同",
    codePrefix: "CTT",
    queryFilters: [
      { param: "keyword", column: "name", operator: "ilike" },
      { param: "code", column: "code", operator: "eq" },
      { param: "type", column: "type", operator: "eq" },
      { param: "supplierId", column: "supplierId", operator: "eq" },
      { param: "status", column: "status", operator: "eq" },
    ],
    onCreate: async (deps, body) => {
      const { ContractStatus } = await import("@ps/contracts")
      const repo = new ContractRepo(deps.db)
      const codeRepo = new CodeSequenceRepo(deps.db)
      const code = await nextCode(codeRepo, "contracts", "CTT")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return repo.insert({
        ...body,
        code,
        status: (ContractStatus as any).Draft,
      } as any)
    },
    onUpdate: async (deps, id, body) => {
      const repo = new ContractRepo(deps.db)
      const entryRepo = new ContractEntryRepo(deps.db)
      const codeRepo = new CodeSequenceRepo(deps.db)
      const service = new ContractService(repo, entryRepo, codeRepo)
      return service.update(id, body as any)
    },
    extraRoutes: (router, deps) => {
      const repo = new ContractRepo(deps.db)
      const entryRepo = new ContractEntryRepo(deps.db)
      const codeRepo = new CodeSequenceRepo(deps.db)
      const service = new ContractService(repo, entryRepo, codeRepo)

      // GET /:id/entries — 合同条目
      router.get("/:id/entries", async (c) => {
        const rows = await entryRepo.findByContractId(c.req.param("id"))
        return c.json(successResponse(rows))
      })

      // PATCH /:id/activate — 确认生效
      router.patch("/:id/activate", async (c) => {
        const row = await service.activate(c.req.param("id"))
        return c.json(successResponse(row))
      })

      // PATCH /:id/return-to-draft — 退回草稿
      router.patch("/:id/return-to-draft", async (c) => {
        const row = await service.returnToDraft(c.req.param("id"))
        return c.json(successResponse(row))
      })

      // PATCH /:id/void — 作废
      router.patch("/:id/void", async (c) => {
        const row = await service.voidContract(c.req.param("id"))
        return c.json(successResponse(row))
      })

      // GET /:id/pdf — 导出 PDF
      router.get("/:id/pdf", async (c) => {
        const contractId = c.req.param("id")
        const contract = await repo.findById(contractId)
        if (contract === null) {
          return c.json({ code: 4004, data: null, message: "合同不存在" }, 404)
        }
        const entries = await entryRepo.findByContractId(contractId)
        const contractWithEntries: ContractDTO & {
          entries: readonly ContractEntryDTO[]
        } = {
          ...(contract as unknown as ContractDTO),
          entries: entries as readonly ContractEntryDTO[],
        }
        const templateHtml = await loadDefaultTemplate("purchase.default")
        const result = await renderPdf(
          { templateHtml, contract: contractWithEntries },
          undefined,
          { format: "A4" },
          deps.db.logger
        )
        return new Response(new Uint8Array(result.pdfBuffer), {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="contract-${(contract as any).code}.pdf"`,
          },
        })
      })
    },
  },

  // -------- 模板 --------
  template: {
    name: "template",
    tableName: "templates",
    RepoClass: TemplateRepo as any as new (db: DbClient) => StandardRepo,
    label: "模板",
    codePrefix: "TPL",
    queryFilters: [
      { param: "keyword", column: "name", operator: "ilike" },
      { param: "contractType", column: "contractType", operator: "eq" },
      { param: "enabled", column: "enabled", operator: "eq" },
    ],
  },

  // -------- 人员（只读） --------
  person: {
    name: "person",
    tableName: "persons",
    RepoClass: PersonRepo as any as new (db: DbClient) => StandardRepo,
    label: "人员",
    disableCreate: true,
    disableUpdate: true,
    disableDelete: true,
    queryFilters: [{ param: "keyword", column: "name", operator: "ilike" }],
  },
}
