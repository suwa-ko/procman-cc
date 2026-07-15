/**
 * HTTP 客户端核心实现。
 * 基于 fetch 封装，支持请求/响应拦截器链、超时控制、ApiResponse 自动解包。
 * baseURL 由调用方注入（依赖注入），不引用 env-config。
 */

import { ResponseCode } from "@ps/types-base"
import type { ApiResponse } from "@ps/types-base"

import { HttpClientError } from "./error"
import type {
  HttpClient,
  HttpClientOptions,
  QueryParams,
  RequestConfig,
  RequestContext,
  RequestInterceptor,
  ResponseContext,
  ResponseInterceptor,
} from "./types"

const DEFAULT_TIMEOUT = 30000

/** 判断响应体是否符合 ApiResponse 结构（仅校验必需字段 code/message） */
function isApiResponse(value: unknown): value is ApiResponse {
  if (typeof value !== "object" || value === null) {
    return false
  }
  const obj = value as Record<string, unknown>
  return (
    "code" in obj &&
    typeof obj.code === "number" &&
    "message" in obj &&
    typeof obj.message === "string"
  )
}

/** 判断字符串是否为绝对 URL（仅识别 http:// 与 https://，避免误判 "httpfoo"） */
function isAbsoluteUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://")
}

/**
 * 拼接 baseURL + url + 查询参数。
 * - 绝对 URL（http://、https://）直接使用，不拼接 baseURL
 * - baseURL 结尾的 "/" 与 url 开头的 "/" 归一化，避免出现 "//"
 */
function buildUrl(baseURL: string, url: string, params?: QueryParams): string {
  const fullUrl = isAbsoluteUrl(url)
    ? url
    : `${baseURL.replace(/\/+$/, "")}/${url.replace(/^\/+/, "")}`
  if (!params) {
    return fullUrl
  }
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) {
      continue
    }
    search.append(key, String(value))
  }
  const query = search.toString()
  return query ? `${fullUrl}?${query}` : fullUrl
}

/** 安全提取响应体中的 details 字段（后端可在 ApiResponse 之外附带错误明细） */
function extractDetails(data: unknown): Record<string, unknown> | undefined {
  if (typeof data !== "object" || data === null) {
    return undefined
  }
  const obj = data as Record<string, unknown>
  if (
    "details" in obj &&
    typeof obj.details === "object" &&
    obj.details !== null
  ) {
    return obj.details as Record<string, unknown>
  }
  return undefined
}

/**
 * 创建超时 AbortSignal，返回 signal 与清理函数（清理 timer 与事件监听）。
 * timeout <= 0 表示不启用超时（仅监听外部 signal），避免 setTimeout(fn, 0) 立即触发误取消。
 */
function createTimeoutSignal(
  timeout: number,
  externalSignal?: AbortSignal
): { signal: AbortSignal; cleanup: () => void } {
  const controller = new AbortController()
  let timer: ReturnType<typeof setTimeout> | null = null
  if (timeout > 0) {
    timer = setTimeout(() => controller.abort(), timeout)
  }
  let onAbort: (() => void) | null = null
  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort()
    } else {
      onAbort = () => controller.abort()
      externalSignal.addEventListener("abort", onAbort, { once: true })
    }
  }
  return {
    signal: controller.signal,
    cleanup: () => {
      if (timer !== null) {
        clearTimeout(timer)
      }
      if (onAbort !== null && externalSignal) {
        externalSignal.removeEventListener("abort", onAbort)
      }
    },
  }
}

/** 按顺序执行请求拦截器链 */
async function runRequestInterceptors(
  config: RequestContext,
  interceptors: RequestInterceptor[]
): Promise<RequestContext> {
  let result = config
  for (const interceptor of interceptors) {
    result = await interceptor(result)
  }
  return result
}

/** 按顺序执行响应拦截器链（仅 HTTP 2xx 时调用） */
async function runResponseInterceptors(
  response: ResponseContext,
  interceptors: ResponseInterceptor[]
): Promise<ResponseContext> {
  let result = response
  for (const interceptor of interceptors) {
    result = await interceptor(result)
  }
  return result
}

/** 解析响应体：204 返回 null，JSON 返回对象，非 JSON 返回文本 */
async function parseResponse(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null
  }
  const text = await response.text()
  if (text === "") {
    return null
  }
  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

/** 执行 fetch 请求，统一处理超时与网络错误 */
async function executeFetch(config: RequestContext): Promise<ResponseContext> {
  const { signal, cleanup } = createTimeoutSignal(
    config.timeout ?? DEFAULT_TIMEOUT,
    config.signal
  )
  const body =
    config.body !== undefined ? JSON.stringify(config.body) : undefined
  const contentTypeHeaders: Record<string, string> =
    body !== undefined ? { "Content-Type": "application/json" } : {}
  const headers: Record<string, string> = {
    ...contentTypeHeaders,
    ...config.headers,
  }
  try {
    const response = await fetch(
      buildUrl(config.baseURL, config.url, config.params),
      { method: config.method ?? "GET", headers, body, signal }
    )
    const data = await parseResponse(response)
    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      config,
    }
  } catch (err) {
    if (err instanceof HttpClientError) {
      throw err
    }
    if (err instanceof Error && err.name === "AbortError") {
      throw new HttpClientError("请求超时或被取消", { status: 0, config })
    }
    const message = err instanceof Error ? err.message : "网络请求失败"
    throw new HttpClientError(message, { status: 0, config })
  } finally {
    cleanup()
  }
}

/** 从非 2xx 响应创建 HttpClientError，优先提取 ApiResponse 业务信息与 details 明细 */
function createHttpError(response: ResponseContext): HttpClientError {
  const data = response.data
  if (isApiResponse(data)) {
    return new HttpClientError(data.message, {
      status: response.status,
      code: data.code,
      details: extractDetails(data),
      config: response.config,
    })
  }
  return new HttpClientError(`HTTP ${response.status} ${response.statusText}`, {
    status: response.status,
    details: extractDetails(data),
    config: response.config,
  })
}

/** 解包 ApiResponse：成功返回 data，失败抛出 HttpClientError；非 ApiResponse 返回原始数据 */
function unwrapResponse<T>(response: ResponseContext): T {
  const data = response.data
  if (isApiResponse(data)) {
    if (data.code !== ResponseCode.Success) {
      throw new HttpClientError(data.message, {
        status: response.status,
        code: data.code,
        details: extractDetails(data),
        config: response.config,
      })
    }
    return data.data as T
  }
  return data as T
}

/**
 * 创建 HTTP 客户端。
 * baseURL 由 apps 层从 env-config 注入（依赖注入，不自行读取 env-config）。
 * 自动解包 ApiResponse：成功返回 data，失败抛出 HttpClientError。
 */
export function createHttpClient(options: HttpClientOptions): HttpClient {
  const defaultHeaders = options.defaultHeaders ?? {}
  const defaultTimeout = options.timeout ?? DEFAULT_TIMEOUT
  const reqInterceptors = options.requestInterceptors ?? []
  const resInterceptors = options.responseInterceptors ?? []

  async function request<T>(config: RequestConfig): Promise<T> {
    const context: RequestContext = {
      ...config,
      baseURL: options.baseURL,
      headers: { ...defaultHeaders, ...config.headers },
      timeout: config.timeout ?? defaultTimeout,
    }
    const intercepted = await runRequestInterceptors(context, reqInterceptors)
    const response = await executeFetch(intercepted)
    if (response.status < 200 || response.status >= 300) {
      throw createHttpError(response)
    }
    const interceptedResponse = await runResponseInterceptors(
      response,
      resInterceptors
    )
    return unwrapResponse<T>(interceptedResponse)
  }

  async function downloadBlob(
    url: string,
    config?: Omit<RequestConfig, "url" | "method">
  ): Promise<Blob> {
    const context: RequestContext = {
      url,
      method: "GET",
      baseURL: options.baseURL,
      headers: { ...defaultHeaders, ...config?.headers },
      timeout: config?.timeout ?? defaultTimeout,
    }
    const intercepted = await runRequestInterceptors(context, reqInterceptors)
    const { signal, cleanup } = createTimeoutSignal(
      intercepted.timeout ?? defaultTimeout,
      intercepted.signal
    )
    try {
      const resp = await fetch(
        buildUrl(intercepted.baseURL, intercepted.url, intercepted.params),
        { method: intercepted.method, headers: intercepted.headers, signal }
      )
      if (!resp.ok) {
        throw new HttpClientError(
          `HTTP ${resp.status} ${resp.statusText}`,
          { status: resp.status, config: intercepted }
        )
      }
      return await resp.blob()
    } catch (err) {
      if (err instanceof HttpClientError) {
        throw err
      }
      if (err instanceof Error && err.name === "AbortError") {
        throw new HttpClientError("下载超时或被取消", { status: 0, config: intercepted })
      }
      const message = err instanceof Error ? err.message : "下载失败"
      throw new HttpClientError(message, { status: 0, config: intercepted })
    } finally {
      cleanup()
    }
  }

  return {
    request,
    get: <T = unknown>(
      url: string,
      config?: Omit<RequestConfig, "url" | "method">
    ) => request<T>({ url, method: "GET", ...config }),
    post: <T = unknown>(
      url: string,
      body?: unknown,
      config?: Omit<RequestConfig, "url" | "method" | "body">
    ) => request<T>({ url, method: "POST", body, ...config }),
    put: <T = unknown>(
      url: string,
      body?: unknown,
      config?: Omit<RequestConfig, "url" | "method" | "body">
    ) => request<T>({ url, method: "PUT", body, ...config }),
    patch: <T = unknown>(
      url: string,
      body?: unknown,
      config?: Omit<RequestConfig, "url" | "method" | "body">
    ) => request<T>({ url, method: "PATCH", body, ...config }),
    delete: <T = unknown>(
      url: string,
      config?: Omit<RequestConfig, "url" | "method">
    ) => request<T>({ url, method: "DELETE", ...config }),
    downloadBlob,
  }
}
