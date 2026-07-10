import { faker } from "@faker-js/faker"
import { SupplierStatus } from "@ps/contracts"
import type { SupplierDTO } from "@ps/contracts"

import { fakeId, fakeCode, fakeTimestamp, pickEnum } from "./helpers"

/**
 * 创建单个供应商 mock 数据
 * @param overrides 覆盖字段
 */
export function createSupplier(overrides?: Partial<SupplierDTO>): SupplierDTO {
  const id = fakeId()
  return {
    id,
    code: fakeCode("SUP"),
    name: faker.company.name(),
    creditCode: faker.string.numeric(18),
    contactPerson: faker.person.fullName(),
    contactPhone: faker.phone.number(),
    contactEmail: faker.internet.email(),
    address: faker.location.streetAddress(),
    businessScope: faker.company.catchPhrase(),
    status: pickEnum(SupplierStatus),
    remark: faker.lorem.sentence(),
    createdAt: fakeTimestamp(),
    updatedAt: fakeTimestamp(),
    ...overrides,
  }
}

/**
 * 创建供应商列表
 * @param count 数量
 * @param overrides 覆盖字段（应用于每一项）
 */
export function createSupplierList(
  count: number,
  overrides?: Partial<SupplierDTO>
): SupplierDTO[] {
  return Array.from({ length: count }, () => createSupplier(overrides))
}
