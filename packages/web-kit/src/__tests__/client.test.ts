import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { createHttpClient } from "../request/client"
import { HttpClientError } from "../request/error"
import type { ResponseContext } from "../request/types"

// ============================================================
// 测试用 Mock 工具
// ============================================================

/** mock fetch（用 vi.fn 创建，保留 mock 方法） */
const mockFetch = vi.fn()

/**
 * expect.objectContaining 的类型安全包装。
 * 原始返回类型为 any，在嵌套赋值时触发 no-unsafe-assignment，故统一转为 unknown。
 */
function containing(obj: Record<string, unknown>): unknown {
  return expect.objectContaining(obj) as unknown
}

/** 创建 mock Response（204 返回空 body，其余返回 JSON body） */
function createResponse(body: unknown, init?: ResponseInit): Response {
  const status = init?.status ?? 200
  const statusText = init?.statusText ?? "OK"
  if (status === 204) {
    return new Response(null, { status, statusText })
  }
  return new Response(JSON.stringify(body), {
    status,
    statusText,
    headers: { "Content-Type": "application/json" },
  })
}

/** 创建成功 ApiResponse 响应 */
function okResponse<T>(data: T): Response {
  return createResponse({ code: 0, data, message: "ok" })
}

/** 创建失败 ApiResponse 响应 */
function errorResponse(code: number, message: string, status = 200): Response {
  return createResponse({ code, data: null, message }, { status })
}

// ============================================================
// 测试用例
// ============================================================

describe("createHttpClient", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetch as unknown as typeof fetch)
    mockFetch.mockReset()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // ----------------------------------------------------------
  // 基础请求方法
  // ----------------------------------------------------------
  describe("基础请求方法", () => {
    it("GET 请求成功并解包 ApiResponse", async () => {
      mockFetch.mockResolvedValueOnce(okResponse({ id: 1, name: "Alice" }))

      const client = createHttpClient({ baseURL: "http://api.test" })
      const result = await client.get<{ id: number; name: string }>("/users/1")

      expect(result).toEqual({ id: 1, name: "Alice" })
      expect(mockFetch).toHaveBeenCalledWith(
        "http://api.test/users/1",
        expect.objectContaining({ method: "GET" })
      )
    })

    it("POST 请求发送 JSON body 并设置 Content-Type", async () => {
      mockFetch.mockResolvedValueOnce(okResponse({ id: 1 }))

      const client = createHttpClient({ baseURL: "http://api.test" })
      const result = await client.post("/users", { name: "Alice", age: 30 })

      expect(result).toEqual({ id: 1 })
      expect(mockFetch).toHaveBeenCalledWith(
        "http://api.test/users",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "Alice", age: 30 }),
          headers: containing({
            "Content-Type": "application/json",
          }),
        })
      )
    })

    it("PUT 请求", async () => {
      mockFetch.mockResolvedValueOnce(okResponse({ id: 1, name: "Updated" }))

      const client = createHttpClient({ baseURL: "http://api.test" })
      const result = await client.put("/users/1", { name: "Updated" })

      expect(result).toEqual({ id: 1, name: "Updated" })
      expect(mockFetch).toHaveBeenCalledWith(
        "http://api.test/users/1",
        expect.objectContaining({ method: "PUT" })
      )
    })

    it("PATCH 请求", async () => {
      mockFetch.mockResolvedValueOnce(okResponse({ id: 1, name: "Patched" }))

      const client = createHttpClient({ baseURL: "http://api.test" })
      const result = await client.patch("/users/1", { name: "Patched" })

      expect(result).toEqual({ id: 1, name: "Patched" })
      expect(mockFetch).toHaveBeenCalledWith(
        "http://api.test/users/1",
        expect.objectContaining({ method: "PATCH" })
      )
    })

    it("DELETE 请求成功", async () => {
      mockFetch.mockResolvedValueOnce(okResponse(null))

      const client = createHttpClient({ baseURL: "http://api.test" })
      const result = await client.delete("/users/1")

      expect(result).toBeNull()
      expect(mockFetch).toHaveBeenCalledWith(
        "http://api.test/users/1",
        expect.objectContaining({ method: "DELETE" })
      )
    })

    it("204 No Content 返回 null", async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(null, { status: 204, statusText: "No Content" })
      )

      const client = createHttpClient({ baseURL: "http://api.test" })
      const result = await client.delete("/users/1")

      expect(result).toBeNull()
    })

    it("request 方法支持完整配置", async () => {
      mockFetch.mockResolvedValueOnce(okResponse({ ok: true }))

      const client = createHttpClient({ baseURL: "http://api.test" })
      const result = await client.request({
        url: "/test",
        method: "POST",
        body: { foo: "bar" },
        params: { q: "1" },
        headers: { "X-Test": "yes" },
      })

      expect(result).toEqual({ ok: true })
      expect(mockFetch).toHaveBeenCalledWith(
        "http://api.test/test?q=1",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ foo: "bar" }),
          headers: containing({
            "X-Test": "yes",
            "Content-Type": "application/json",
          }),
        })
      )
    })
  })

  // ----------------------------------------------------------
  // 响应处理
  // ----------------------------------------------------------
  describe("响应处理", () => {
    it("非 ApiResponse 响应直接返回原始数据", async () => {
      mockFetch.mockResolvedValueOnce(createResponse({ foo: "bar", count: 42 }))

      const client = createHttpClient({ baseURL: "http://api.test" })
      const result = await client.get("/raw")

      expect(result).toEqual({ foo: "bar", count: 42 })
    })

    it("查询参数正确拼接（过滤 null/undefined）", async () => {
      mockFetch.mockResolvedValueOnce(okResponse([]))

      const client = createHttpClient({ baseURL: "http://api.test" })
      await client.get("/users", {
        params: {
          page: 1,
          pageSize: 20,
          keyword: "a",
          empty: null,
          skip: undefined,
        },
      })

      expect(mockFetch).toHaveBeenCalledWith(
        "http://api.test/users?page=1&pageSize=20&keyword=a",
        expect.objectContaining({ method: "GET" })
      )
    })

    it("默认请求头与自定义请求头合并", async () => {
      mockFetch.mockResolvedValueOnce(okResponse(null))

      const client = createHttpClient({
        baseURL: "http://api.test",
        defaultHeaders: { "X-App": "purchase" },
      })
      await client.get("/users", { headers: { "X-Custom": "custom" } })

      expect(mockFetch).toHaveBeenCalledWith(
        "http://api.test/users",
        expect.objectContaining({
          headers: containing({
            "X-App": "purchase",
            "X-Custom": "custom",
          }),
        })
      )
    })

    it("绝对路径 URL 不拼接 baseURL", async () => {
      mockFetch.mockResolvedValueOnce(okResponse(null))

      const client = createHttpClient({ baseURL: "http://api.test" })
      await client.get("http://other.example.com/data")

      expect(mockFetch).toHaveBeenCalledWith(
        "http://other.example.com/data",
        expect.anything()
      )
    })

    it("baseURL 结尾 / 与 url 开头 / 归一化避免双斜杠", async () => {
      mockFetch.mockResolvedValueOnce(okResponse(null))

      const client = createHttpClient({ baseURL: "http://api.test/" })
      await client.get("/users")

      expect(mockFetch).toHaveBeenCalledWith(
        "http://api.test/users",
        expect.objectContaining({ method: "GET" })
      )
    })

    it("非 http(s):// 开头的字符串视为相对路径拼接 baseURL", async () => {
      mockFetch.mockResolvedValueOnce(okResponse(null))

      const client = createHttpClient({ baseURL: "http://api.test" })
      await client.get("httpfoo/path")

      expect(mockFetch).toHaveBeenCalledWith(
        "http://api.test/httpfoo/path",
        expect.objectContaining({ method: "GET" })
      )
    })
  })

  // ----------------------------------------------------------
  // 拦截器
  // ----------------------------------------------------------
  describe("拦截器", () => {
    it("请求拦截器按顺序执行并可修改配置", async () => {
      mockFetch.mockResolvedValueOnce(okResponse(null))

      const client = createHttpClient({
        baseURL: "http://api.test",
        requestInterceptors: [
          (config) => ({
            ...config,
            headers: { ...config.headers, "X-Token": "token1" },
          }),
          (config) => ({
            ...config,
            headers: { ...config.headers, "X-Trace": "trace1" },
          }),
        ],
      })
      await client.get("/users")

      expect(mockFetch).toHaveBeenCalledWith(
        "http://api.test/users",
        expect.objectContaining({
          headers: containing({
            "X-Token": "token1",
            "X-Trace": "trace1",
          }),
        })
      )
    })

    it("响应拦截器可修改响应数据", async () => {
      mockFetch.mockResolvedValueOnce(
        createResponse({ code: 0, data: { value: 1 }, message: "ok" })
      )

      const client = createHttpClient({
        baseURL: "http://api.test",
        responseInterceptors: [
          (response) => ({
            ...response,
            data: { code: 0, data: { value: 2 }, message: "ok" },
          }),
        ],
      })

      const result = await client.get("/data")
      expect(result).toEqual({ value: 2 })
    })

    it("HTTP 错误时不执行响应拦截器", async () => {
      mockFetch.mockResolvedValueOnce(errorResponse(4040, "Not Found", 404))

      const interceptor = vi.fn((response: ResponseContext) => response)
      const client = createHttpClient({
        baseURL: "http://api.test",
        responseInterceptors: [interceptor],
      })

      await expect(client.get("/users/999")).rejects.toThrow(HttpClientError)
      expect(interceptor).not.toHaveBeenCalled()
    })
  })

  // ----------------------------------------------------------
  // 超时控制
  // ----------------------------------------------------------
  describe("超时控制", () => {
    it("timeout <= 0 视为不启用超时，请求正常成功", async () => {
      mockFetch.mockResolvedValueOnce(okResponse({ ok: true }))

      const client = createHttpClient({ baseURL: "http://api.test" })
      const result = await client.get("/users", { timeout: 0 })

      expect(result).toEqual({ ok: true })
    })

    it("timeout <= 0 时外部 signal 仍可触发取消", async () => {
      const controller = new AbortController()
      const abortError = new Error("aborted")
      abortError.name = "AbortError"
      mockFetch.mockImplementationOnce(
        (_url: string, init?: RequestInit) =>
          new Promise((_resolve, reject) => {
            const signal = init?.signal
            if (signal?.aborted) {
              reject(abortError)
              return
            }
            signal?.addEventListener("abort", () => reject(abortError))
          })
      )

      const client = createHttpClient({ baseURL: "http://api.test" })
      const promise = client.get("/users", {
        timeout: 0,
        signal: controller.signal,
      })
      controller.abort()

      await expect(promise).rejects.toMatchObject({
        name: "HttpClientError",
        status: 0,
        message: "请求超时或被取消",
      })
    })
  })

  // ----------------------------------------------------------
  // 错误处理
  // ----------------------------------------------------------
  describe("错误处理", () => {
    it("HTTP 404 错误抛出 HttpClientError", async () => {
      mockFetch.mockResolvedValueOnce(errorResponse(4040, "资源不存在", 404))

      const client = createHttpClient({ baseURL: "http://api.test" })
      await expect(client.get("/users/999")).rejects.toMatchObject({
        name: "HttpClientError",
        status: 404,
        code: 4040,
        message: "资源不存在",
      })
    })

    it("HTTP 500 错误抛出 HttpClientError", async () => {
      mockFetch.mockResolvedValueOnce(
        createResponse(
          { code: 5000, data: null, message: "服务器内部错误" },
          { status: 500, statusText: "Internal Server Error" }
        )
      )

      const client = createHttpClient({ baseURL: "http://api.test" })
      await expect(client.get("/users")).rejects.toMatchObject({
        name: "HttpClientError",
        status: 500,
        code: 5000,
        message: "服务器内部错误",
      })
    })

    it("HTTP 错误且响应体非 ApiResponse 时使用状态文本", async () => {
      mockFetch.mockResolvedValueOnce(
        createResponse("plain error text", {
          status: 502,
          statusText: "Bad Gateway",
        })
      )

      const client = createHttpClient({ baseURL: "http://api.test" })
      await expect(client.get("/users")).rejects.toMatchObject({
        name: "HttpClientError",
        status: 502,
        message: "HTTP 502 Bad Gateway",
      })
    })

    it("ApiResponse code !== 0 时抛出 HttpClientError", async () => {
      mockFetch.mockResolvedValueOnce(errorResponse(4000, "参数校验失败"))

      const client = createHttpClient({ baseURL: "http://api.test" })
      await expect(client.post("/users", { name: "" })).rejects.toMatchObject({
        name: "HttpClientError",
        status: 200,
        code: 4000,
        message: "参数校验失败",
      })
    })

    it("HTTP 错误响应附带 details 时透传到 HttpClientError", async () => {
      mockFetch.mockResolvedValueOnce(
        createResponse(
          {
            code: 4000,
            data: null,
            message: "参数校验失败",
            details: { fields: ["name", "age"] },
          },
          { status: 400, statusText: "Bad Request" }
        )
      )

      const client = createHttpClient({ baseURL: "http://api.test" })
      await expect(client.post("/users", { name: "" })).rejects.toMatchObject({
        name: "HttpClientError",
        status: 400,
        code: 4000,
        message: "参数校验失败",
        details: { fields: ["name", "age"] },
      })
    })

    it("ApiResponse 业务错误附带 details 时透传到 HttpClientError", async () => {
      mockFetch.mockResolvedValueOnce(
        createResponse({
          code: 4001,
          data: null,
          message: "供应商已被引用",
          details: { referencedBy: "contract" },
        })
      )

      const client = createHttpClient({ baseURL: "http://api.test" })
      await expect(client.delete("/suppliers/1")).rejects.toMatchObject({
        name: "HttpClientError",
        status: 200,
        code: 4001,
        details: { referencedBy: "contract" },
      })
    })

    it("网络错误（fetch 抛出非 AbortError）", async () => {
      mockFetch.mockRejectedValueOnce(new TypeError("Failed to fetch"))

      const client = createHttpClient({ baseURL: "http://api.test" })
      await expect(client.get("/users")).rejects.toMatchObject({
        name: "HttpClientError",
        status: 0,
        message: "Failed to fetch",
      })
    })

    it("超时/取消（AbortError）抛出 status=0 的 HttpClientError", async () => {
      const abortError = new Error("The operation was aborted")
      abortError.name = "AbortError"
      mockFetch.mockRejectedValueOnce(abortError)

      const client = createHttpClient({ baseURL: "http://api.test" })
      await expect(client.get("/users")).rejects.toMatchObject({
        name: "HttpClientError",
        status: 0,
        message: "请求超时或被取消",
      })
    })
  })
})
