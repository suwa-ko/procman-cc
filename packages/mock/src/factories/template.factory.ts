import { faker } from "@faker-js/faker"
import { ContractType } from "@ps/contracts"
import type { TemplateDTO, TemplateVariable } from "@ps/contracts"

import { fakeId, fakeCode, fakeTimestamp, pickEnum } from "./helpers"

/**
 * 创建模板变量 mock 数据
 */
export function createTemplateVariable(
  overrides?: Partial<TemplateVariable>
): TemplateVariable {
  return {
    type: "text",
    label: faker.lorem.word(),
    ...overrides,
  }
}

/**
 * 创建单个合同模板 mock 数据
 * @param overrides 覆盖字段
 */
export function createTemplate(overrides?: Partial<TemplateDTO>): TemplateDTO {
  const id = fakeId()
  return {
    id,
    code: fakeCode("TPL"),
    name: `${faker.lorem.word()}模板`,
    contractType: pickEnum(ContractType),
    htmlContent: `<div><h1>{{contractName}}</h1><p>{{supplierName}}</p></div>`,
    variables: {
      contractName: { type: "text", label: "合同名称" },
      supplierName: { type: "text", label: "供应商名称" },
      amount: { type: "number", label: "金额" },
      signDate: { type: "date", label: "签订日期" },
    },
    version: `${faker.number.int({ min: 1, max: 10 })}.0`,
    enabled: true,
    createdAt: fakeTimestamp(),
    updatedAt: fakeTimestamp(),
    ...overrides,
  }
}

/**
 * 创建模板列表
 * @param count 数量
 * @param overrides 覆盖字段
 */
export function createTemplateList(
  count: number,
  overrides?: Partial<TemplateDTO>
): TemplateDTO[] {
  return Array.from({ length: count }, () => createTemplate(overrides))
}
