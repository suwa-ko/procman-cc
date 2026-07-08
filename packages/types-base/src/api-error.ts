/**
 * 统一错误结构
 */
export interface ApiError {
  /** 业务状态码 */
  code: number
  /** 错误信息 */
  message: string
  /** 错误详情（如字段级校验错误） */
  details?: Record<string, unknown>
}

/**
 * 业务错误异常类
 * 用于 service 层抛出业务错误，由 route 层统一捕获并转换为 ApiResponse
 */
export class BusinessException extends Error {
  public readonly code: number
  public readonly details?: Record<string, unknown>

  constructor(
    code: number,
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message)
    this.name = "BusinessException"
    this.code = code
    this.details = details
  }

  toApiError(): ApiError {
    return { code: this.code, message: this.message, details: this.details }
  }
}
