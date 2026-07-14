import type { CreatePricingInput } from "@ps/contracts"
import { PricingStatus } from "@ps/contracts"
import type { CodeSequenceRepo, PricingRepo, PricingRow } from "@ps/db"

import { nextCode } from "./code.service"

/**
 * 业务层错误：定价创建被拒绝。
 * service 层统一抛出此类错误，由 route 层全局 error handler 捕获后转为 ApiResponse。
 */
export class PricingServiceError extends Error {
  public readonly code: string

  public constructor(code: string, message: string) {
    super(message)
    this.name = "PricingServiceError"
    this.code = code
  }
}

/**
 * 定价服务。
 *
 * 业务规则：
 * - 同一"供应商 + 物料"组合在同一时刻至多存在一条"有效"状态的定价
 * - 新增定价时，系统自动将原有效定价变更为"已失效"
 * - 编码由系统自动生成
 */
export class PriceService {
  private readonly pricingRepo: PricingRepo
  private readonly codeRepo: CodeSequenceRepo

  public constructor(pricingRepo: PricingRepo, codeRepo: CodeSequenceRepo) {
    this.pricingRepo = pricingRepo
    this.codeRepo = codeRepo
  }

  /**
   * 创建定价。
   *
   * 管线：
   *  1. 查询该 supplier+material 是否已有有效定价
   *  2. 若存在 → 将旧定价状态置为 Inactive（自动失效）
   *  3. 生成编码 → 插入新定价
   *
   * @throws PricingServiceError 当业务校验不通过时
   */
  public async create(data: CreatePricingInput): Promise<PricingRow> {
    // Step 1: 查询现有有效定价
    const existing = await this.pricingRepo.findActiveBySupplierMaterial(
      data.supplierId,
      data.materialId
    )

    // Step 2: 若存在，自动失效旧定价
    if (existing !== null) {
      await this.pricingRepo.deactivate(existing.id)
    }

    // Step 3: 生成编码 + 插入
    const code = await nextCode(this.codeRepo, "pricings", "PRC")
    const row = await this.pricingRepo.insert({
      ...data,
      code,
      status: data.status ?? PricingStatus.Active,
    })

    return row
  }

  /**
   * 手动将定价置为已失效。
   */
  public async deactivate(id: string): Promise<PricingRow | null> {
    const pricing = await this.pricingRepo.findById(id)
    if (pricing === null) {
      throw new PricingServiceError(
        "PRICING_NOT_FOUND",
        "定价不存在"
      )
    }
    return this.pricingRepo.deactivate(id)
  }
}
