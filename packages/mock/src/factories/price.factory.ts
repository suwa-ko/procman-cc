import { faker } from "@faker-js/faker"
import { PricingStatus } from "@ps/contracts"
import type { PricingDTO } from "@ps/contracts"

import { fakeId, fakeCode, fakeTimestamp, pickEnum } from "./helpers"

/**
 * 创建单个定价 mock 数据
 * @param overrides 覆盖字段
 */
export function createPricing(overrides?: Partial<PricingDTO>): PricingDTO {
  const id = fakeId()
  return {
    id,
    code: fakeCode("PRC"),
    supplierId: fakeId(),
    materialId: fakeId(),
    unitPrice: faker.number.float({
      min: 0.01,
      max: 99999.99,
      fractionDigits: 2,
    }),
    currency: "CNY",
    status: pickEnum(PricingStatus),
    remark: faker.lorem.sentence(),
    createdAt: fakeTimestamp(),
    updatedAt: fakeTimestamp(),
    ...overrides,
  }
}

/**
 * 创建定价列表
 * @param count 数量
 * @param overrides 覆盖字段
 */
export function createPricingList(
  count: number,
  overrides?: Partial<PricingDTO>
): PricingDTO[] {
  return Array.from({ length: count }, () => createPricing(overrides))
}
