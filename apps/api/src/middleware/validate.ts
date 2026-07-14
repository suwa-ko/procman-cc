import { ResponseCode } from "@ps/types-base"
import { Hono } from "hono"
import type { ZodIssue, ZodSchema } from "zod"


/**
 * 创建请求体校验中间件。
 * 校验失败直接返回 400 ApiResponse，不进入下游 handler。
 *
 * @param schema - Zod schema
 * @returns Hono 中间件
 */
export function validateBody<T>(schema: ZodSchema<T>): Hono {
  const middleware = new Hono()

  middleware.use("*", async (c, next) => {
    // Hono 的 c.req.json() 返回 unknown（运行时校验由 Zod 完成）
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = await c.req.json()
    const result = schema.safeParse(body)

    if (!result.success) {
      const messages = result.error.issues.map(
        (issue: ZodIssue) => `${issue.path.join(".")}: ${issue.message}`
      )
      return c.json(
        {
          code: ResponseCode.ValidationError,
          data: null,
          message: `参数校验失败：${messages.join("；")}`,
        },
        400
      )
    }

    // 将解析后的数据存入 context，供下游 handler 使用
    c.set("validatedBody" as never, result.data as never)
    return next()
  })

  return middleware
}
