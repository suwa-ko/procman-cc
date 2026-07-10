/**
 * App 组件基本渲染测试。
 */

import { describe, expect, it } from "vitest"

import { App } from "../App"

describe("App", () => {
  it("导出 App 组件（React FC）", () => {
    expect(App).toBeDefined()
    expect(typeof App).toBe("function")
  })
})
