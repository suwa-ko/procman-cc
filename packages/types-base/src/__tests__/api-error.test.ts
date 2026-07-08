import { describe, it, expect } from "vitest"

import { BusinessException, type ApiError } from "../api-error"

describe("api-error", () => {
  describe("BusinessException", () => {
    it("应能创建带 code 和 message 的异常", () => {
      const error = new BusinessException(4040, "供应商不存在")
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(BusinessException)
      expect(error.name).toBe("BusinessException")
      expect(error.code).toBe(4040)
      expect(error.message).toBe("供应商不存在")
      expect(error.details).toBeUndefined()
    })

    it("应能创建带 details 的异常", () => {
      const details = { field: "creditCode", reason: "格式错误" }
      const error = new BusinessException(4000, "校验失败", details)
      expect(error.details).toEqual(details)
    })

    it("toApiError 应返回标准 ApiError 结构", () => {
      const error = new BusinessException(4090, "供应商已被引用", {
        refCount: 5,
      })
      const apiError: ApiError = error.toApiError()
      expect(apiError.code).toBe(4090)
      expect(apiError.message).toBe("供应商已被引用")
      expect(apiError.details).toEqual({ refCount: 5 })
    })

    it("toApiError 无 details 时返回的 ApiError 不含 details", () => {
      const error = new BusinessException(4040, "不存在")
      const apiError = error.toApiError()
      expect(apiError.code).toBe(4040)
      expect(apiError.message).toBe("不存在")
      expect(apiError.details).toBeUndefined()
    })

    it("应能被 try/catch 捕获", () => {
      const thrower = (): never => {
        throw new BusinessException(5000, "内部错误")
      }
      expect(thrower).toThrow(BusinessException)
      expect(thrower).toThrow("内部错误")
    })
  })
})
