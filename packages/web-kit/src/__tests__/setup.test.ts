import { afterEach, describe, expect, it, vi } from "vitest"

import {
  getHttpClient,
  resetHttpClient,
  setupHttpClient,
} from "../request/setup"
import type { RequestContext, ResponseContext } from "../request/types"

// ============================================================
// 测试用具：mock @ps/env-config 的 loadConfig
// ============================================================

vi.mock("@ps/env-config", () => ({
  loadConfig: vi.fn(() => ({
    env: "dev" as const,
    apiBaseUrl: "http://localhost:3000",
    supabaseUrl: "http://localhost:54321",
    supabaseAnonKey: "anon-key",
    logLevel: "debug" as const,
    appName: "测试应用",
    logoUrl: "",
  })),
}))

// ============================================================
// 测试用例
// ============================================================

describe("setupHttpClient", () => {
  afterEach(() => {
    resetHttpClient()
  })

  it("无参数调用创建全局客户端并返回", () => {
    const client = setupHttpClient()
    expect(client).toBeDefined()
  })

  it("getHttpClient 返回全局实例", () => {
    const client = setupHttpClient()
    expect(getHttpClient()).toBe(client)
  })

  it("重复调用 setupHttpClient 覆盖旧实例", () => {
    const first = setupHttpClient()
    const second = setupHttpClient()
    expect(first).not.toBe(second)
    expect(getHttpClient()).toBe(second)
  })

  it("支持覆盖 baseURL", () => {
    setupHttpClient({ baseURL: "http://custom.test:4000" })
    const client = getHttpClient()
    expect(client).toBeDefined()
  })

  it("支持覆盖拦截器和超时", () => {
    const requestInterceptor = vi.fn((config: RequestContext) => config)
    setupHttpClient({
      timeout: 5000,
      requestInterceptors: [requestInterceptor],
    })
    const client = getHttpClient()
    expect(client).toBeDefined()
  })

  it("支持覆盖默认请求头", () => {
    setupHttpClient({
      defaultHeaders: { "X-App": "test" },
    })
    const client = getHttpClient()
    expect(client).toBeDefined()
  })

  it("支持覆盖响应拦截器", () => {
    const responseInterceptor = vi.fn((response: ResponseContext) => response)
    setupHttpClient({
      responseInterceptors: [responseInterceptor],
    })
    const client = getHttpClient()
    expect(client).toBeDefined()
  })

  it("getHttpClient 未初始化时抛出错误", () => {
    expect(() => getHttpClient()).toThrow(
      "HTTP 客户端未初始化，请在应用启动时调用 setupHttpClient()"
    )
  })

  it("resetHttpClient 清除实例后 getHttpClient 抛出", () => {
    setupHttpClient()
    expect(() => getHttpClient()).not.toThrow()
    resetHttpClient()
    expect(() => getHttpClient()).toThrow(
      "HTTP 客户端未初始化，请在应用启动时调用 setupHttpClient()"
    )
  })

  it("resetHttpClient 后重新 setupHttpClient 正常", () => {
    setupHttpClient()
    resetHttpClient()
    const client = setupHttpClient()
    expect(getHttpClient()).toBe(client)
  })

  it("createHttpClient 仍可独立使用（不依赖全局实例）", async () => {
    const { createHttpClient } = await import("../request/client")

    const client = createHttpClient({ baseURL: "http://standalone.test" })
    expect(client).toBeDefined()

    // 全局实例此时为空，不影响独立使用
    expect(() => getHttpClient()).toThrow()
  })
})
