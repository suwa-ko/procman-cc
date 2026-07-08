/**
 * 业务错误码枚举
 * 0 表示成功，非 0 表示各类业务错误
 */
export enum ResponseCode {
  /** 成功 */
  Success = 0,
  /** 参数校验失败 */
  ValidationError = 4000,
  /** 未认证 */
  Unauthorized = 4010,
  /** 无权限 */
  Forbidden = 4030,
  /** 资源不存在 */
  NotFound = 4040,
  /** 业务规则冲突（如供应商已被引用） */
  Conflict = 4090,
  /** 服务器内部错误 */
  InternalError = 5000,
}

/**
 * 统一 API 响应包装
 */
export interface ApiResponse<T = unknown> {
  /** 业务状态码，0 表示成功 */
  code: ResponseCode
  /** 响应数据，失败时为 null */
  data: T | null
  /** 提示信息 */
  message: string
}

/**
 * 构造成功响应的工具函数
 */
export function successResponse<T>(data: T, message = "ok"): ApiResponse<T> {
  return { code: ResponseCode.Success, data, message }
}

/**
 * 构造失败响应的工具函数
 */
export function errorResponse(
  code: ResponseCode,
  message: string
): ApiResponse<null> {
  return { code, data: null, message }
}
