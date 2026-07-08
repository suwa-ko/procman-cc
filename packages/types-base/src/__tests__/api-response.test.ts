import { describe, it, expect } from "vitest"

import {
  ResponseCode,
  successResponse,
  errorResponse,
  type ApiResponse,
} from "../api-response"

describe("api-response", () => {
  describe("ResponseCode", () => {
    it("Success 应为 0", () => {
      expect(ResponseCode.Success).toBe(0)
    })

    it("错误码应为正整数", () => {
      expect(ResponseCode.ValidationError).toBeGreaterThan(0)
      expect(ResponseCode.Unauthorized).toBeGreaterThan(0)
      expect(ResponseCode.Forbidden).toBeGreaterThan(0)
      expect(ResponseCode.NotFound).toBeGreaterThan(0)
      expect(ResponseCode.Conflict).toBeGreaterThan(0)
      expect(ResponseCode.InternalError).toBeGreaterThan(0)
    })

    it("各错误码之间不应重复", () => {
      const codes = [
        ResponseCode.Success,
        ResponseCode.ValidationError,
        ResponseCode.Unauthorized,
        ResponseCode.Forbidden,
        ResponseCode.NotFound,
        ResponseCode.Conflict,
        ResponseCode.InternalError,
      ]
      expect(new Set(codes).size).toBe(codes.length)
    })
  })

  describe("successResponse", () => {
    it("应构造成功响应，code 为 Success", () => {
      const response = successResponse({ id: "1", name: "test" })
      expect(response.code).toBe(ResponseCode.Success)
      expect(response.data).toEqual({ id: "1", name: "test" })
      expect(response.message).toBe("ok")
    })

    it("应支持自定义 message", () => {
      const response = successResponse(null, "操作成功")
      expect(response.code).toBe(ResponseCode.Success)
      expect(response.data).toBeNull()
      expect(response.message).toBe("操作成功")
    })

    it("应支持数组数据", () => {
      const response = successResponse([1, 2, 3])
      expect(response.data).toEqual([1, 2, 3])
    })

    it("应支持字符串数据", () => {
      const response = successResponse("hello")
      expect(response.data).toBe("hello")
    })
  })

  describe("errorResponse", () => {
    it("应构造失败响应，data 为 null", () => {
      const response = errorResponse(ResponseCode.NotFound, "供应商不存在")
      expect(response.code).toBe(ResponseCode.NotFound)
      expect(response.data).toBeNull()
      expect(response.message).toBe("供应商不存在")
    })

    it("应支持 ValidationError 错误码", () => {
      const response = errorResponse(
        ResponseCode.ValidationError,
        "参数校验失败"
      )
      expect(response.code).toBe(ResponseCode.ValidationError)
    })
  })

  describe("ApiResponse 类型", () => {
    it("应能构造符合类型的对象", () => {
      const response: ApiResponse<string> = {
        code: ResponseCode.Success,
        data: "test",
        message: "ok",
      }
      expect(response.data).toBe("test")
    })
  })
})
