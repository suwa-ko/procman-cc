/**
 * 定价 Mock 存储，含供应商/物料/品类/状态筛选，
 * 支持「新增定价时旧定价自动失效」业务规则
 */

import {
  PricingStatus,
  type PricingDTO,
  type PricingQueryParams,
} from "@ps/contracts"
import type { PaginatedResponse } from "@ps/types-base"

import { BaseMockStore } from "./base.store"

/** 定价列表筛选字段 */
interface PricingFilters {
  supplierId?: string
  materialId?: string
  categoryId?: string
  status?: PricingStatus
}

export class PricingStore extends BaseMockStore<PricingDTO, PricingFilters> {
  /** 品类→物料 映射（由外部 seed 时注入，用于品类筛选） */
  private materialCategoryMap: Map<string, string> = new Map()

  constructor(idGen: () => string) {
    super("pricing", idGen)
    this.setFilter((item, f) => {
      if (f.status && item.status !== f.status) {
        return false
      }
      if (f.supplierId && item.supplierId !== f.supplierId) {
        return false
      }
      if (f.materialId && item.materialId !== f.materialId) {
        return false
      }
      if (f.categoryId) {
        const itemCategory = this.materialCategoryMap.get(item.materialId)
        if (itemCategory !== f.categoryId) {
          return false
        }
      }
      return true
    })
  }

  /** 设置物料→品类映射 */
  setMaterialCategoryMap(map: Map<string, string>): void {
    this.materialCategoryMap = map
  }

  /** 创建定价并自动将同供应商+同物料的旧有效定价设为失效 */
  createWithInvalidation(
    data: Omit<PricingDTO, "id" | "code" | "createdAt" | "updatedAt">
  ): PricingDTO {
    // 先将同 supplierId + materialId 的有效定价置为失效
    const allActive = this.getAll().filter(
      (p) =>
        p.supplierId === data.supplierId &&
        p.materialId === data.materialId &&
        p.status === PricingStatus.Active
    )
    for (const active of allActive) {
      const patch: Partial<PricingDTO> = { status: PricingStatus.Inactive }
      this.update(active.id, patch)
    }
    return this.create(data)
  }

  /** 定价列表查询（分页） */
  listByQuery(params: PricingQueryParams): PaginatedResponse<PricingDTO> {
    return this.list({
      page: params.page,
      pageSize: params.pageSize,
      filters: {
        supplierId: params.supplierId,
        materialId: params.materialId,
        categoryId: params.categoryId,
        status: params.status,
      },
    })
  }
}
