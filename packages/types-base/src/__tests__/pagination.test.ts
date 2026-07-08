import { describe, it, expect } from "vitest"

import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  type PaginationParams,
  type PaginatedResponse,
} from "../pagination"

describe("pagination", () => {
  describe("常量", () => {
    it("DEFAULT_PAGE 应为 1", () => {
      expect(DEFAULT_PAGE).toBe(1)
    })

    it("DEFAULT_PAGE_SIZE 应为 20", () => {
      expect(DEFAULT_PAGE_SIZE).toBe(20)
    })

    it("MAX_PAGE_SIZE 应为 100", () => {
      expect(MAX_PAGE_SIZE).toBe(100)
    })
  })

  describe("PaginationParams", () => {
    it("应能构造合法的分页参数", () => {
      const params: PaginationParams = { page: 1, pageSize: 20 }
      expect(params.page).toBe(1)
      expect(params.pageSize).toBe(20)
    })

    it("page 应从 1 开始", () => {
      const params: PaginationParams = { page: 1, pageSize: 10 }
      expect(params.page).toBeGreaterThanOrEqual(1)
    })

    it("pageSize 不应超过 MAX_PAGE_SIZE", () => {
      const params: PaginationParams = {
        page: 1,
        pageSize: MAX_PAGE_SIZE,
      }
      expect(params.pageSize).toBeLessThanOrEqual(MAX_PAGE_SIZE)
    })
  })

  describe("PaginatedResponse", () => {
    it("应能构造合法的分页响应", () => {
      const response: PaginatedResponse<string> = {
        data: ["a", "b", "c"],
        total: 30,
        page: 2,
        pageSize: 10,
      }
      expect(response.data).toHaveLength(3)
      expect(response.total).toBe(30)
      expect(response.page).toBe(2)
      expect(response.pageSize).toBe(10)
    })

    it("空结果集 data 应为空数组", () => {
      const response: PaginatedResponse<string> = {
        data: [],
        total: 0,
        page: 1,
        pageSize: 20,
      }
      expect(response.data).toEqual([])
      expect(response.total).toBe(0)
    })
  })
})
