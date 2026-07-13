/**
 * 合同模板 Mock 存储
 */

import type { TemplateDTO } from "@ps/contracts"

import { BaseMockStore } from "./base.store"

export class TemplateStore extends BaseMockStore<TemplateDTO> {
  constructor(idGen: () => string) {
    super("template", idGen)
  }
}
