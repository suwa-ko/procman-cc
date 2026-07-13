/**
 * 合同 Mock 存储，含关键词/编码/类型/供应商/状态/日期筛选，
 * 内嵌合同条目子存储，维护合同↔条目关联
 */

import type {
  ContractDTO,
  ContractEntryDTO,
  ContractQueryParams,
  ContractStatus,
} from "@ps/contracts"
import type { PaginatedResponse } from "@ps/types-base"

import { BaseMockStore } from "./base.store"

/** 合同列表筛选字段 */
interface ContractFilters {
  keyword?: string
  code?: string
  type?: string
  supplierId?: string
  status?: ContractStatus
  startDate?: string
  endDate?: string
}

export class ContractStore extends BaseMockStore<ContractDTO, ContractFilters> {
  /** 合同条目子存储：contractId → entries */
  private entries: Map<string, ContractEntryDTO[]> = new Map()

  constructor(idGen: () => string) {
    super("contract", idGen)
    this.setFilter((item, f) => {
      if (f.status && item.status !== f.status) {
        return false
      }
      if (f.code && item.code !== f.code) {
        return false
      }
      if (f.type && String(item.type) !== f.type) {
        return false
      }
      if (f.supplierId && item.supplierId !== f.supplierId) {
        return false
      }
      if (f.keyword) {
        const kw = f.keyword.toLowerCase()
        const matchName = item.name.toLowerCase().includes(kw)
        const matchCode = item.code.toLowerCase().includes(kw)
        if (!matchName && !matchCode) {
          return false
        }
      }
      if (f.startDate && item.effectiveDate && item.effectiveDate < f.startDate) {
        return false
      }
      if (f.endDate && item.expirationDate && item.expirationDate > f.endDate) {
        return false
      }
      return true
    })
  }

  /** 获取合同条目 */
  getEntries(contractId: string): ContractEntryDTO[] {
    return this.entries.get(contractId) ?? []
  }

  /** 设置合同条目 */
  setEntries(contractId: string, entryList: ContractEntryDTO[]): void {
    this.entries.set(contractId, entryList)
  }

  /** 添加合同条目 */
  addEntry(entry: ContractEntryDTO): void {
    const list = this.entries.get(entry.contractId) ?? []
    list.push(entry)
    this.entries.set(entry.contractId, list)
  }

  /** 删除合同（连带条目） */
  override delete(id: string): boolean {
    this.entries.delete(id)
    return super.delete(id)
  }

  /** 清空（连带条目） */
  override clear(): void {
    this.entries.clear()
    super.clear()
  }

  /** 合同列表查询（分页） */
  listByQuery(params: ContractQueryParams): PaginatedResponse<ContractDTO> {
    return this.list({
      page: params.page,
      pageSize: params.pageSize,
      filters: {
        keyword: params.keyword,
        code: params.code,
        type: params.type,
        supplierId: params.supplierId,
        status: params.status,
        startDate: params.startDate,
        endDate: params.endDate,
      },
    })
  }
}
