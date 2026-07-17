import { describe, expect, it } from "vitest"

import {
  useSupplierList,
  useCreateSupplier,
  useDeleteSupplier,
  useContractList,
  useCreateContract,
  useDeleteContract,
  useMaterialList,
  useCreateMaterial,
  useDeleteMaterial,
  useCategoryList,
  useCreateCategory,
  useDeleteCategory,
  usePricingList,
  useCreatePricing,
  useDeletePricing,
  useTemplateList,
  useCreateTemplate,
  useDeleteTemplate,
  usePersonList,
  useUserList,
} from "../index"

describe("@ps/hooks-business exports", () => {
  it("供应商 Hooks 已导出", () => {
    expect(typeof useSupplierList).toBe("function")
    expect(typeof useCreateSupplier).toBe("function")
    expect(typeof useDeleteSupplier).toBe("function")
  })

  it("合同 Hooks 已导出", () => {
    expect(typeof useContractList).toBe("function")
    expect(typeof useCreateContract).toBe("function")
    expect(typeof useDeleteContract).toBe("function")
  })

  it("物料 Hooks 已导出", () => {
    expect(typeof useMaterialList).toBe("function")
    expect(typeof useCreateMaterial).toBe("function")
    expect(typeof useDeleteMaterial).toBe("function")
  })

  it("品类 Hooks 已导出", () => {
    expect(typeof useCategoryList).toBe("function")
    expect(typeof useCreateCategory).toBe("function")
    expect(typeof useDeleteCategory).toBe("function")
  })

  it("定价 Hooks 已导出", () => {
    expect(typeof usePricingList).toBe("function")
    expect(typeof useCreatePricing).toBe("function")
    expect(typeof useDeletePricing).toBe("function")
  })

  it("模板 Hooks 已导出", () => {
    expect(typeof useTemplateList).toBe("function")
    expect(typeof useCreateTemplate).toBe("function")
    expect(typeof useDeleteTemplate).toBe("function")
  })

  it("人员/用户 Hooks 已导出", () => {
    expect(typeof usePersonList).toBe("function")
    expect(typeof useUserList).toBe("function")
  })
})
