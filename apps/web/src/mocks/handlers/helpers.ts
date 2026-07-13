/**
 * MSW Handler 公共工具。
 * 统一 ApiResponse 包装、参数解析、错误返回格式。
 */

import { ResponseCode, type ApiResponse } from "@ps/types-base"
import { HttpResponse } from "msw"
import type { DefaultBodyType, StrictRequest } from "msw"


/** 成功响应包装 */
export function ok<T>(data: T): ReturnType<typeof HttpResponse.json> {
  const body: ApiResponse<T> = {
    code: ResponseCode.Success,
    data,
    message: "ok",
  }
  return HttpResponse.json(body)
}

/** 失败响应包装 */
export function fail(
  code: ResponseCode,
  message: string
): ReturnType<typeof HttpResponse.json> {
  const body: ApiResponse<null> = {
    code,
    data: null,
    message,
  }
  return HttpResponse.json(body, { status: 400 })
}

/** 从请求中解析分页参数 */
export function parsePagination(request: StrictRequest<DefaultBodyType>): {
  page: number
  pageSize: number
} {
  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get("page") ?? "1", 10)
  const pageSize = parseInt(url.searchParams.get("pageSize") ?? "20", 10)
  return { page, pageSize }
}

/** 安全解析请求体 JSON */
export async function parseBody<T>(
  request: StrictRequest<DefaultBodyType>
): Promise<T | null> {
  try {
    const body: unknown = await request.json()
    return body as T
  } catch {
    return null
  }
}
