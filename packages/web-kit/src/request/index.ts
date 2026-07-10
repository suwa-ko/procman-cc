/**
 * 网络请求模块入口。
 * 通用底层 HTTP 客户端，不含业务代码。
 * 业务 API 封装（基于具体 DTO 的请求函数）应放在 apps 层或后续 api/ 子模块。
 */

export { createHttpClient } from "./client"
export { getHttpClient, resetHttpClient, setupHttpClient } from "./setup"
export type { SetupHttpClientOptions } from "./setup"
export { HttpClientError } from "./error"
export type {
  HttpClient,
  HttpClientOptions,
  HttpMethod,
  QueryParamValue,
  QueryParams,
  RequestConfig,
  RequestContext,
  RequestHeaders,
  RequestInterceptor,
  ResponseContext,
  ResponseInterceptor,
} from "./types"
