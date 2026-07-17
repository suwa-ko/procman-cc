import { describe, expect, it } from "vitest"

import {
  createCrudHooks,
  useDebounce,
  usePagination,
} from "../index"

describe("@ps/hooks-core exports", () => {
  it("createCrudHooks 是函数", () => {
    expect(typeof createCrudHooks).toBe("function")
  })

  it("useDebounce 是函数", () => {
    expect(typeof useDebounce).toBe("function")
  })

  it("usePagination 是函数", () => {
    expect(typeof usePagination).toBe("function")
  })
})
