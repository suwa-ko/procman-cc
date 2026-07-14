import type { ContractEntity } from "@ps/model"

import { BaseRepository } from "./core/base-repository"
import type { DbClient } from "./core/types"

/** 合同主表数据库行（实体字段 + 系统字段） */
export interface ContractRow extends ContractEntity {
  id: string
  code: string
  createdAt: string
  updatedAt: string
}

/**
 * 合同主表仓储。
 * 封装合同表的原子 CRUD。
 * 不含合同锁定等业务规则 —— 由 service 层负责。
 */
export class ContractRepo extends BaseRepository<ContractRow> {
  public constructor(client: DbClient) {
    super(client, "contracts")
  }
}
