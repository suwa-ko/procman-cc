import type { TemplateEntity } from "@ps/model"

import { BaseRepository } from "./core/base-repository"
import type { DbClient } from "./core/types"

/** 合同模板数据库行 */
export interface TemplateRow extends TemplateEntity {
  id: string
  code: string
  createdAt: string
  updatedAt: string
}

/** 合同模板仓储（原子 CRUD，不含业务规则） */
export class TemplateRepo extends BaseRepository<TemplateRow> {
  public constructor(client: DbClient) {
    super(client, "templates")
  }
}
