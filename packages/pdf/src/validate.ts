import type { ZodSchema } from "zod"

import { PdfValidationError } from "./types"

/**
 * 使用 Zod Schema 校验数据。
 * 校验通过返回解析后的数据；失败则抛出 PdfValidationError。
 *
 * @param schema - Zod Schema
 * @param data - 待校验的数据
 * @returns 解析后的数据（带类型）
 * @throws PdfValidationError 校验失败时抛出，包含所有错误信息
 */
export function validateData<T>(
  schema: ZodSchema<T>,
  data: unknown
): T {
  const result = schema.safeParse(data)

  if (!result.success) {
    const issues = result.error.issues.map(
      (issue) => `${issue.path.join(".")}: ${issue.message}`
    )
    throw new PdfValidationError(issues)
  }

  return result.data
}
