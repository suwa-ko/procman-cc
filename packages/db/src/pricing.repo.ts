import type { PricingEntity } from "@ps/model"
import { PricingStatus } from "@ps/model"

import { BaseRepository } from "./core/base-repository"
import type { DbClient } from "./core/types"

/** 定价数据库行（实体字段 + 系统字段） */
export interface PricingRow extends PricingEntity {
  id: string
  code: string
  createdAt: string
  updatedAt: string
}

/**
 * 定价仓储。
 * 封装定价表的原子 CRUD + 有效定价查询。
 * 不含业务规则（如自动失效逻辑）—— 由 service 层负责。
 */
export class PricingRepo extends BaseRepository<PricingRow> {
  public constructor(client: DbClient) {
    super(client, "pricings")
  }

  /**
   * 按供应商 + 物料查询当前有效定价。
   * 根据业务规则：同一供应商+物料至多一条有效定价。
   */
  public async findActiveBySupplierMaterial(
    supplierId: string,
    materialId: string
  ): Promise<PricingRow | null> {
    const { data, error } = await this.client.supabase
      .from(this.tableName)
      .select("*")
      .eq("supplierId", supplierId)
      .eq("materialId", materialId)
      .eq("status", PricingStatus.Active)
      .maybeSingle()

    if (error) {
      this.client.logger.error("findActiveBySupplierMaterial 失败", {
        table: this.tableName,
        supplierId,
        materialId,
        error: error.message,
      })
      throw error
    }

    return data as PricingRow | null
  }

  /**
   * 将定价状态设置为已失效。
   */
  public async deactivate(id: string): Promise<PricingRow | null> {
    const updateData: Partial<Omit<PricingRow, "id" | "createdAt" | "updatedAt">> = {
      status: PricingStatus.Inactive,
    }
    return this.update(id, updateData)
  }
}
