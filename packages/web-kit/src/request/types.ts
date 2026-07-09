/**
 * 网络请求层类型定义。
 * 纯类型，无运行时依赖，不包含任何业务代码。
 */

/** HTTP 方法 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

/** 查询参数值（标量，null/undefined 会被过滤） */
export type QueryParamValue = string | number | boolean | null | undefined

/** 查询参数集合 */
export type QueryParams = Record<string, QueryParamValue>

/** 请求头 */
export type RequestHeaders = Record<string, string>

/**
 * 请求配置（由调用方提供）。
 * url 为相对路径时拼接 baseURL，为绝对路径时直接使用。
 */
export interface RequestConfig {
  url: string
  method?: HttpMethod
  /** 请求体（自动 JSON 序列化） */
  body?: unknown
  /** URL 查询参数 */
  params?: QueryParams
  /** 自定义请求头（与默认头合并） */
  headers?: RequestHeaders
  /** 外部取消信号 */
  signal?: AbortSignal
  /** 超时毫秒数（未设置时使用客户端默认值） */
  timeout?: number
}

/**
 * 请求上下文（拦截器接收的完整配置）。
 * 在 RequestConfig 基础上补充 baseURL 与合并后的 headers。
 */
export interface RequestContext extends RequestConfig {
  baseURL: string
  headers: RequestHeaders
}

/**
 * 响应上下文（拦截器接收的已解析响应）。
 */
export interface ResponseContext {
  /** 已解析的响应体（JSON → 对象，否则 → 字符串） */
  data: unknown
  status: number
  statusText: string
  headers: Headers
  config: RequestContext
}

/** 请求拦截器：可在发请求前修改配置（如注入 Token） */
export type RequestInterceptor = (
  config: RequestContext
) => RequestContext | Promise<RequestContext>

/** 响应拦截器：可在返回前修改响应（如统一错误提示） */
export type ResponseInterceptor = (
  response: ResponseContext
) => ResponseContext | Promise<ResponseContext>

/**
 * HTTP 客户端创建选项。
 * baseURL 由 apps 层从 env-config 注入（依赖注入，不自行读取 env-config）。
 */
export interface HttpClientOptions {
  baseURL: string
  /** 请求拦截器链（按顺序执行） */
  requestInterceptors?: RequestInterceptor[]
  /** 响应拦截器链（按顺序执行，仅 HTTP 2xx 时触发） */
  responseInterceptors?: ResponseInterceptor[]
  /** 默认请求头（与单次请求 headers 合并，单次优先） */
  defaultHeaders?: RequestHeaders
  /** 默认超时毫秒数（默认 30000） */
  timeout?: number
}

/**
 * HTTP 客户端接口。
 * 所有方法返回 Promise<T>，T 为 ApiResponse 解包后的业务数据类型。
 * 调用方通过泛型指定：client.get<UserDTO>("/users/1")
 */
export interface HttpClient {
  request: <T = unknown>(config: RequestConfig) => Promise<T>
  get: <T = unknown>(
    url: string,
    config?: Omit<RequestConfig, "url" | "method">
  ) => Promise<T>
  post: <T = unknown>(
    url: string,
    body?: unknown,
    config?: Omit<RequestConfig, "url" | "method" | "body">
  ) => Promise<T>
  put: <T = unknown>(
    url: string,
    body?: unknown,
    config?: Omit<RequestConfig, "url" | "method" | "body">
  ) => Promise<T>
  patch: <T = unknown>(
    url: string,
    body?: unknown,
    config?: Omit<RequestConfig, "url" | "method" | "body">
  ) => Promise<T>
  delete: <T = unknown>(
    url: string,
    config?: Omit<RequestConfig, "url" | "method">
  ) => Promise<T>
}
