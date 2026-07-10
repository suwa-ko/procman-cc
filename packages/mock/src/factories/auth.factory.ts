import { faker } from "@faker-js/faker"
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from "@ps/contracts"

import { fakeId } from "./helpers"

/**
 * 创建登录请求 mock 数据
 * @param overrides 覆盖字段
 */
export function createLoginRequest(
  overrides?: Partial<LoginRequest>
): LoginRequest {
  return {
    username: faker.internet.username(),
    password: faker.internet.password(),
    ...overrides,
  }
}

/**
 * 创建登录响应 mock 数据
 * @param overrides 覆盖字段
 */
export function createLoginResponse(
  overrides?: Partial<LoginResponse>
): LoginResponse {
  return {
    token: faker.string.alphanumeric(32),
    person: {
      id: fakeId(),
      name: faker.person.fullName(),
    },
    ...overrides,
  }
}

/**
 * 创建注册请求 mock 数据
 * @param overrides 覆盖字段
 */
export function createRegisterRequest(
  overrides?: Partial<RegisterRequest>
): RegisterRequest {
  return {
    username: faker.internet.username(),
    password: faker.internet.password(),
    personId: fakeId(),
    ...overrides,
  }
}
