import type { CategoryEntity } from "@ps/model"

import { BaseRepository } from "./core/base-repository"
import type { DbClient } from "./core/types"

/** 品类数据库行（品类编码为手动输入，非系统自动生成） */
export interface CategoryRow extends CategoryEntity {
  id: string
  code?: string
  createdAt: string
  updatedAt: string
}

/** 品类仓储（原子 CRUD，不含业务规则） */
export class CategoryRepo extends BaseRepository<CategoryRow> {
  public constructor(client: DbClient) {
    super(client, "categories")
  }
}
