import type { HttpClient, QueryParams, RequestConfig } from "@ps/web-kit"

import {
  createCategoryList,
  createMaterialList,
  createPersonList,
  createPricingList,
  createSupplierList,
  createTemplateList,
} from "@ps/mock"

import { createCategory } from "@ps/mock"
import { createMaterial } from "@ps/mock"
import { createPerson } from "@ps/mock"
import { createPricing } from "@ps/mock"
import { createSupplier } from "@ps/mock"
import { createTemplate } from "@ps/mock"

type MockDataFactory<T> = (count: number) => T[]
type MockDetailFactory<T> = () => T

interface MockRoute {
  pattern: RegExp
  listFactory: MockDataFactory<unknown>
  detailFactory: MockDetailFactory<unknown>
  totalCount: number
}

const MOCK_ROUTES: MockRoute[] = [
  {
    pattern: /\/api\/suppliers(\/([^/]+))?$/,
    listFactory: (n: number) => createSupplierList(n),
    detailFactory: () => createSupplier(),
    totalCount: 25,
  },
  {
    pattern: /\/api\/materials(\/([^/]+))?$/,
    listFactory: (n: number) => createMaterialList(n),
    detailFactory: () => createMaterial(),
    totalCount: 30,
  },
  {
    pattern: /\/api\/categories(\/([^/]+))?$/,
    listFactory: (n: number) => createCategoryList(n),
    detailFactory: () => createCategory(),
    totalCount: 15,
  },
  {
    pattern: /\/api\/pricings(\/([^/]+))?$/,
    listFactory: (n: number) => createPricingList(n),
    detailFactory: () => createPricing(),
    totalCount: 40,
  },
  {
    pattern: /\/api\/persons(\/([^/]+))?$/,
    listFactory: (n: number) => createPersonList(n),
    detailFactory: () => createPerson(),
    totalCount: 20,
  },
  {
    pattern: /\/api\/templates(\/([^/]+))?$/,
    listFactory: (n: number) => createTemplateList(n),
    detailFactory: () => createTemplate(),
    totalCount: 10,
  },
]

function findRoute(url: string): MockRoute | undefined {
  return MOCK_ROUTES.find((r) => r.pattern.test(url))
}

function parseId(url: string): string | undefined {
  const match = /\/([^/]+)$/.exec(url)
  return match?.[1]
}

function createDelayedResponse<T>(data: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data)
    }, 300)
  })
}

export function createMockHttpClient(): HttpClient {
  return {
    async request<T>(config: RequestConfig): Promise<T> {
      const url = config.url
      const route = findRoute(url)

      if (!route) {
        return { code: 0, data: [], total: 0, page: 1, pageSize: 10 } as T
      }

      const id = parseId(url)

      if (id) {
        const item = route.detailFactory()
        return createDelayedResponse({
          code: 0,
          data: item,
          message: "ok",
        } as T)
      }

      const params = (config.params ?? {}) as Record<string, unknown>
      const page = Number(params["page"]) || 1
      const pageSize = Number(params["pageSize"]) || 10
      const items = route.listFactory(pageSize)

      return createDelayedResponse({
        code: 0,
        data: items,
        total: route.totalCount,
        page,
        pageSize,
        message: "ok",
      } as T)
    },

    async get<T>(
      url: string,
      config?: Omit<RequestConfig, "url" | "method">
    ): Promise<T> {
      return this.request<T>({ ...config, url, method: "GET" })
    },

    async post<T>(
      url: string,
      body?: unknown,
      config?: Omit<RequestConfig, "url" | "method" | "body">
    ): Promise<T> {
      return this.request<T>({ ...config, url, method: "POST", body })
    },

    async put<T>(
      url: string,
      body?: unknown,
      config?: Omit<RequestConfig, "url" | "method" | "body">
    ): Promise<T> {
      return this.request<T>({ ...config, url, method: "PUT", body })
    },

    async patch<T>(
      url: string,
      body?: unknown,
      config?: Omit<RequestConfig, "url" | "method" | "body">
    ): Promise<T> {
      return this.request<T>({ ...config, url, method: "PATCH", body })
    },

    async delete<T>(
      url: string,
      config?: Omit<RequestConfig, "url" | "method">
    ): Promise<T> {
      return this.request<T>({ ...config, url, method: "DELETE" })
    },
  }
}
