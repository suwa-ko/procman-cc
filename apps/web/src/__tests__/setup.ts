/**
 * Vitest 测试环境初始化 — MSW Server + Mock Stores。
 */
import { setupServer } from "msw/node"
import { afterAll, afterEach, beforeAll } from "vitest"

import { createAllHandlers, createMockStores, seedMockData } from "../mocks"
import type { AllMockStores } from "../mocks"

// 全局 mock stores（供测试中直接操作数据）
let _stores: AllMockStores | null = null

export function getMockStores(): AllMockStores {
  if (_stores === null) {
    throw new Error("Mock stores 未初始化")
  }
  return _stores
}

const stores = createMockStores()
_stores = stores

// 种子数据：admin 账户 + 基础测试数据
seedMockData(stores)

const handlers = createAllHandlers(stores)
const server = setupServer(...handlers)

beforeAll(() => {
  server.listen({ onUnhandledRequest: "bypass" })
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
  _stores = null
})

// 预置 token（仅供测试辅助使用）
let _token = ""

export function loginAndGetToken(): string {
  if (_token !== "") {
    return _token
  }
  try {
    const result = stores.auth.login({ username: "admin", password: "admin123" })
    _token = result.token
    return _token
  } catch {
    throw new Error("登录失败：admin 账户不存在")
  }
}

export function clearLoginToken(): void {
  _token = ""
}
