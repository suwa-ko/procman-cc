import { describe, expect, it } from "vitest"

import {
  AppProvider,
  SupplierSelector,
  SupplierTable,
  SupplierPopover,
  MaterialSelector,
  MaterialTable,
  MaterialPopover,
  CategorySelector,
  CategoryTable,
  CategoryPopover,
  PricingSelector,
  PricingTable,
  PricingPopover,
  UserSelector,
  UserTable,
  UserPopover,
  TemplateSelector,
  TemplateTable,
  TemplatePopover,
} from "../index"

describe("@ps/antd-kit exports", () => {
  it("AppProvider 已导出", () => {
    expect(typeof AppProvider).toBe("function")
  })

  it("Supplier 组件已导出", () => {
    expect(typeof SupplierSelector).toBe("function")
    expect(typeof SupplierTable).toBe("function")
    expect(typeof SupplierPopover).toBe("function")
  })

  it("Material 组件已导出", () => {
    expect(typeof MaterialSelector).toBe("function")
    expect(typeof MaterialTable).toBe("function")
    expect(typeof MaterialPopover).toBe("function")
  })

  it("Category 组件已导出", () => {
    expect(typeof CategorySelector).toBe("function")
    expect(typeof CategoryTable).toBe("function")
    expect(typeof CategoryPopover).toBe("function")
  })

  it("Pricing 组件已导出", () => {
    expect(typeof PricingSelector).toBe("function")
    expect(typeof PricingTable).toBe("function")
    expect(typeof PricingPopover).toBe("function")
  })

  it("User 组件已导出", () => {
    expect(typeof UserSelector).toBe("function")
    expect(typeof UserTable).toBe("function")
    expect(typeof UserPopover).toBe("function")
  })

  it("Template 组件已导出", () => {
    expect(typeof TemplateSelector).toBe("function")
    expect(typeof TemplateTable).toBe("function")
    expect(typeof TemplatePopover).toBe("function")
  })
})
