/**
 * MSW 浏览器环境初始化 — Service Worker 模式。
 * 仅在 APP_ENV=mock 时由 main.tsx 调用。
 */

import { setupWorker } from "msw/browser"

import { createAllHandlers } from "./handlers"
import type { AllMockStores } from "./stores"

/**
 * 创建并启动 MSW 浏览器 Worker。
 * 合并所有 handler 并调用 worker.start()
 */
export async function startMockBrowser(
  stores: AllMockStores
): Promise<ServiceWorkerRegistration | undefined> {
  const handlers = createAllHandlers(stores)
  const worker = setupWorker(...handlers)
  const registration = await worker.start({
    onUnhandledRequest: "bypass",
  })
  return registration
}
