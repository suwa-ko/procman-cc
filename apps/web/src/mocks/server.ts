/**
 * MSW 测试环境初始化 — Server 模式。
 * 供 Vitest 测试使用，不需要 Service Worker。
 */

import { setupServer } from "msw/node"

import { createAllHandlers } from "./handlers"
import type { AllMockStores } from "./stores"

/**
 * 创建 MSW 测试 Server。
 * 调用方需要 beforeAll(server.listen) / afterAll(server.close) / afterEach(server.resetHandlers)
 */
export function createMockServer(
  stores: AllMockStores
): ReturnType<typeof setupServer> {
  const handlers = createAllHandlers(stores)
  return setupServer(...handlers)
}
