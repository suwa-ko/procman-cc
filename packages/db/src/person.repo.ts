import type { PersonEntity } from "@ps/model"

import { BaseRepository } from "./core/base-repository"
import type { DbClient } from "./core/types"

/** 人员数据库行 */
export interface PersonRow extends PersonEntity {
  id: string
  createdAt: string
  updatedAt: string
}

/**
 * 人员仓储。
 * 人员主数据来自外部系统，本仓储仅提供查询 + 冗余同步，
 * 不提供新增/编辑/删除（铁则 5.2）。
 */
export class PersonRepo extends BaseRepository<PersonRow> {
  public constructor(client: DbClient) {
    super(client, "persons")
  }
}
