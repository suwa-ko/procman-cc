import type { SupplierEntity } from "@ps/model"

import { BaseRepository } from "./core/base-repository"
import type { DbClient } from "./core/types"

/** 供应商数据库行 */
export interface SupplierRow extends SupplierEntity {
  id: string
  code: string
  createdAt: string
  updatedAt: string
}

/** 供应商仓储（原子 CRUD，不含业务规则） */
export class SupplierRepo extends BaseRepository<SupplierRow> {
  public constructor(client: DbClient) {
    super(client, "suppliers")
  }
}
