import type { ContractEntryEntity } from "@ps/model"

import { BaseRepository } from "./core/base-repository"
import type { DbClient, QueryResult } from "./core/types"

/** 合同条目数据库行（实体字段 + 系统字段） */
export interface ContractEntryRow extends ContractEntryEntity {
  id: string
  contractId: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

/**
 * 合同条目仓储。
 * 封装合同条目表的原子 CRUD + 按合同查询。
 * 不含业务规则 —— 由 service 层负责。
 */
export class ContractEntryRepo extends BaseRepository<ContractEntryRow> {
  public constructor(client: DbClient) {
    super(client, "contract_entries")
  }

  /** 按合同 ID 查询所有条目，按 sortOrder 升序 */
  public async findByContractId(contractId: string): Promise<ContractEntryRow[]> {
    const result: QueryResult<unknown[]> =
      await this.client.supabase
        .from(this.tableName)
        .select("*")
        .eq("contractId", contractId)
        .order("sortOrder", { ascending: true })

    if (result.error) {
      this.client.logger.error("findByContractId 失败", {
        table: this.tableName,
        contractId,
        error: result.error.message,
      })
      throw result.error
    }

    return (result.data ?? []) as ContractEntryRow[]
  }
}
