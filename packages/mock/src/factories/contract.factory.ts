import { faker } from "@faker-js/faker"
import { ContractStatus, ContractType } from "@ps/contracts"
import type { ContractDTO, ContractEntryDTO } from "@ps/contracts"

import { fakeId, fakeCode, fakeTimestamp, pickEnum } from "./helpers"

/**
 * 创建单个合同 mock 数据
 * @param overrides 覆盖字段
 */
export function createContract(overrides?: Partial<ContractDTO>): ContractDTO {
  const id = fakeId()
  return {
    id,
    code: fakeCode("CTT"),
    name: `采购合同-${faker.commerce.productName()}`,
    type: pickEnum(ContractType),
    supplierId: fakeId(),
    handlerId: fakeId(),
    handlerName: faker.person.fullName(),
    templateId: fakeId(),
    content: {},
    totalAmount: faker.number.float({
      min: 1000,
      max: 999999.99,
      fractionDigits: 2,
    }),
    effectiveDate: faker.date.future().toISOString().slice(0, 10),
    expirationDate: faker.date.future({ years: 1 }).toISOString().slice(0, 10),
    status: pickEnum(ContractStatus),
    companyName: faker.company.name(),
    createdAt: fakeTimestamp(),
    updatedAt: fakeTimestamp(),
    ...overrides,
  }
}

/**
 * 创建单个合同采购条目 mock 数据
 * @param overrides 覆盖字段
 */
export function createContractEntry(
  overrides?: Partial<ContractEntryDTO>
): ContractEntryDTO {
  const id = fakeId()
  const unitPrice = faker.number.float({
    min: 0.01,
    max: 9999.99,
    fractionDigits: 2,
  })
  const quantity = faker.number.int({ min: 1, max: 1000 })
  return {
    id,
    contractId: fakeId(),
    materialId: fakeId(),
    materialName: faker.commerce.productName(),
    spec: faker.commerce.productMaterial(),
    unitPrice,
    quantity,
    unit: faker.helpers.arrayElement(["个", "台", "kg", "m", "件", "套"]),
    totalPrice: Number((unitPrice * quantity).toFixed(2)),
    remark: faker.lorem.sentence(),
    sortOrder: faker.number.int({ min: 1, max: 50 }),
    ...overrides,
  }
}

/**
 * 创建合同列表
 * @param count 数量
 * @param overrides 覆盖字段
 */
export function createContractList(
  count: number,
  overrides?: Partial<ContractDTO>
): ContractDTO[] {
  return Array.from({ length: count }, () => createContract(overrides))
}

/**
 * 创建合同条目列表
 * @param count 数量
 * @param contractId 关联合同 ID
 * @param overrides 覆盖字段
 */
export function createContractEntryList(
  count: number,
  contractId: string,
  overrides?: Partial<ContractEntryDTO>
): ContractEntryDTO[] {
  return Array.from({ length: count }, (_, i) =>
    createContractEntry({ contractId, sortOrder: i + 1, ...overrides })
  )
}
