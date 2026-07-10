import { faker } from "@faker-js/faker"
import { MaterialStatus } from "@ps/contracts"
import type { MaterialDTO } from "@ps/contracts"

import { fakeId, fakeCode, fakeTimestamp, pickEnum } from "./helpers"

/**
 * 创建单个物料 mock 数据
 * @param overrides 覆盖字段
 */
export function createMaterial(overrides?: Partial<MaterialDTO>): MaterialDTO {
  const id = fakeId()
  const units = ["个", "台", "kg", "m", "件", "套", "箱", "瓶"]
  return {
    id,
    code: fakeCode("MAT"),
    name: faker.commerce.productName(),
    spec: faker.commerce.productMaterial(),
    unit: faker.helpers.arrayElement(units),
    categoryId: fakeId(),
    description: faker.commerce.productDescription(),
    status: pickEnum(MaterialStatus),
    createdAt: fakeTimestamp(),
    updatedAt: fakeTimestamp(),
    ...overrides,
  }
}

/**
 * 创建物料列表
 * @param count 数量
 * @param overrides 覆盖字段
 */
export function createMaterialList(
  count: number,
  overrides?: Partial<MaterialDTO>
): MaterialDTO[] {
  return Array.from({ length: count }, () => createMaterial(overrides))
}
