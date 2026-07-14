import type { MaterialEntity } from "@ps/model"

import { BaseRepository } from "./core/base-repository"
import type { DbClient } from "./core/types"

/** 物料数据库行 */
export interface MaterialRow extends MaterialEntity {
  id: string
  code: string
  createdAt: string
  updatedAt: string
}

/** 物料仓储（原子 CRUD，不含业务规则） */
export class MaterialRepo extends BaseRepository<MaterialRow> {
  public constructor(client: DbClient) {
    super(client, "materials")
  }
}
