/**
 * E2E 测试共享 API Mock 工具。
 *
 * 提供通用 CRUD mock、种子数据生成、认证注入等能力。
 * 所有 mock 响应格式与 @ps/contracts ApiResponse<T> 一致。
 */

import type { Page } from "@playwright/test"

// ---------- 通用类型 ----------

export interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

export interface ListData<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export interface SeedEntity {
  id: string
  name: string
  code?: string
  status?: string
  [key: string]: unknown
}

// ---------- 认证注入 ----------

export function authInitScript(): {
  content: string
} {
  return {
    content: `localStorage.setItem("purchase_system_token", "mock-token-e2e-test")`,
  }
}

// ---------- 通用 CRUD Mock 工厂 ----------

export interface CrudMockOptions<T extends SeedEntity> {
  /** API 路径前缀，如 "/api/materials" */
  baseUrl: string
  /** 种子数据条数 */
  seedCount?: number
  /** 种子数据工厂 */
  seedFactory: (index: number) => T
}

export interface CrudMockStore<T extends SeedEntity> {
  items: T[]
  add(item: T): void
  update(id: string, patch: Partial<T>): T | undefined
  remove(id: string): boolean
  reset(): void
}

export function createCrudStore<T extends SeedEntity>(
  seedCount: number,
  factory: (index: number) => T,
): CrudMockStore<T> {
  const items: T[] = Array.from({ length: seedCount }, (_, i) => factory(i))

  return {
    items,
    add(item: T) {
      items.push(item)
    },
    update(id: string, patch: Partial<T>) {
      const idx = items.findIndex((it) => it.id === id)
      if (idx === -1) return undefined
      items[idx] = { ...items[idx]!, ...patch }
      return items[idx]
    },
    remove(id: string) {
      const idx = items.findIndex((it) => it.id === id)
      if (idx !== -1) items.splice(idx, 1)
      return idx !== -1
    },
    reset() {
      items.length = 0
      items.push(...Array.from({ length: seedCount }, (_, i) => factory(i)))
    },
  }
}

/**
 * 为标准 CRUD 端点注册 Playwright page.route mock。
 *
 * 拦截:
 *   GET    baseUrl        → 分页列表
 *   GET    baseUrl/:id    → 详情
 *   POST   baseUrl        → 创建
 *   PUT    baseUrl/:id    → 更新
 *   DELETE baseUrl/:id    → 删除
 */
export function setupCrudRoutes<T extends SeedEntity>(
  page: Page,
  store: CrudMockStore<T>,
  baseUrl: string,
): Promise<void> {
  return page.route(new RegExp(baseUrl), async (route) => {
    const url = new URL(route.request().url())
    const method = route.request().method()
    const pathParts = url.pathname.split("/").filter(Boolean)
    const id = pathParts.length >= 3 ? pathParts[2] : undefined

    await new Promise((r) => setTimeout(r, 30))

    // --- LIST ---
    if (method === "GET" && id === undefined) {
      const pageNum = Number(url.searchParams.get("page")) || 1
      const pageSize = Number(url.searchParams.get("pageSize")) || 10
      const keyword = url.searchParams.get("keyword") ?? ""
      const status = url.searchParams.get("status") ?? ""

      let filtered = [...store.items]
      if (keyword) {
        filtered = filtered.filter((s) => s.name.includes(keyword))
      }
      if (status) {
        filtered = filtered.filter((s) => s.status === status)
      }

      const total = filtered.length
      const start = (pageNum - 1) * pageSize
      const paged = filtered.slice(start, start + pageSize)

      return route.fulfill({
        status: 200,
        json: { code: 0, data: { data: paged, total, page: pageNum, pageSize }, message: "ok" },
      })
    }

    // --- DETAIL ---
    if (method === "GET" && id !== undefined) {
      const item = store.items.find((s) => s.id === id)
      if (!item) {
        return route.fulfill({ status: 404, json: { code: 404, data: null, message: "不存在" } })
      }
      return route.fulfill({ status: 200, json: { code: 0, data: item, message: "ok" } })
    }

    // --- CREATE ---
    if (method === "POST") {
      const body = route.request().postDataJSON() as Partial<T>
      const newItem = {
        ...body,
        id: `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      } as T
      store.add(newItem)
      return route.fulfill({ status: 201, json: { code: 0, data: newItem, message: "创建成功" } })
    }

    // --- UPDATE ---
    if (method === "PUT" && id !== undefined) {
      const body = route.request().postDataJSON() as { data: Partial<T> } | Partial<T>
      const patch = "data" in body ? body.data : body
      const updated = store.update(id, patch)
      if (!updated) {
        return route.fulfill({ status: 404, json: { code: 404, data: null, message: "不存在" } })
      }
      return route.fulfill({ status: 200, json: { code: 0, data: updated, message: "更新成功" } })
    }

    // --- DELETE ---
    if (method === "DELETE" && id !== undefined) {
      const ok = store.remove(id)
      if (!ok) {
        return route.fulfill({ status: 404, json: { code: 404, data: null, message: "不存在" } })
      }
      return route.fulfill({ status: 200, json: { code: 0, data: null, message: "删除成功" } })
    }

    return route.continue()
  })
}

// ---------- Cookie/LocalStorage 辅助 ----------

/** 生成 mock ID */
export function mockId(): string {
  return `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
