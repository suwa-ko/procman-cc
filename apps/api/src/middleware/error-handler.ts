import { ResponseCode } from "@ps/types-base"
import type { Context, Next } from "hono"


import { ContractServiceError } from "../services/contract.service"
import { PricingServiceError } from "../services/price.service"

/**
 * 将业务 ServiceError 映射为 HTTP 状态码与 ResponseCode。
 */
function mapError(error: Error): {
  status: number
  code: ResponseCode
} {
  if (error instanceof PricingServiceError || error instanceof ContractServiceError) {
    const map: Record<string, ResponseCode> = {
      PRICING_NOT_FOUND: ResponseCode.NotFound,
      CONTRACT_NOT_FOUND: ResponseCode.NotFound,
      CONTRACT_NOT_DRAFT: ResponseCode.Conflict,
      CONTRACT_NOT_EFFECTIVE: ResponseCode.Conflict,
      CONTRACT_TERMINAL: ResponseCode.Conflict,
      CONTRACT_LOCKED: ResponseCode.Conflict,
    }
    return {
      status: 409,
      code: map[error.code] ?? ResponseCode.Conflict,
    }
  }

  return {
    status: 500,
    code: ResponseCode.InternalError,
  }
}

/**
 * 全局错误处理中间件。
 * 捕获所有未处理异常，统一转换为 ApiResponse 格式返回。
 */
export async function errorHandler(c: Context, next: Next): Promise<void> {
  try {
    await next()
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    const { status, code } = mapError(err)

    c.status(status as 200)
    c.json({
      code,
      data: null,
      message: err.message,
    })

  }
}
