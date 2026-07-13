/**
 * 人员 Mock 存储（只读，模拟外部系统数据）
 */

import type { PersonDTO } from "@ps/contracts"

import { BaseMockStore } from "./base.store"

export class PersonStore extends BaseMockStore<PersonDTO> {
  constructor(idGen: () => string) {
    super("person", idGen)
  }
}
