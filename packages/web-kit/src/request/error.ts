import type { RequestConfig } from "./types"

/**
 * HTTP 客户端统一错误。
 * 涵盖网络错误、超时、HTTP 状态错误、业务错误码四种场景。
 *
 * - status === 0：网络错误或超时（未收到 HTTP 响应）
 * - status >= 400：HTTP 状态错误
 * - code !== undefined：业务错误码（来自 ApiResponse.code）
 */
export class HttpClientError extends Error {
  public readonly status: number
  public readonly code: number | undefined
  public readonly details: Record<string, unknown> | undefined
  public readonly config: RequestConfig | undefined

  constructor(
    message: string,
    options: {
      status: number
      code?: number
      details?: Record<string, unknown>
      config?: RequestConfig
    }
  ) {
    super(message)
    this.name = "HttpClientError"
    this.status = options.status
    this.code = options.code
    this.details = options.details
    this.config = options.config
  }
}
