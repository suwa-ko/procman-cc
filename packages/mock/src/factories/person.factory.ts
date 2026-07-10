import { faker } from "@faker-js/faker"
import type { PersonDTO } from "@ps/contracts"

import { fakeId } from "./helpers"

/**
 * 创建人员 mock 数据
 * @param overrides 覆盖字段
 */
export function createPerson(overrides?: Partial<PersonDTO>): PersonDTO {
  return {
    id: fakeId(),
    name: faker.person.fullName(),
    ...overrides,
  }
}

/**
 * 创建人员列表
 * @param count 数量
 * @param overrides 覆盖字段
 */
export function createPersonList(
  count: number,
  overrides?: Partial<PersonDTO>
): PersonDTO[] {
  return Array.from({ length: count }, () => createPerson(overrides))
}
