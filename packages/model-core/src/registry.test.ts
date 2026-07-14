import { describe, expect, it } from "vitest"

import { z } from "zod"

import { createEntityMappingRegistry } from "./mapping"
import { ModelRegistry } from "./registry"

// ========== ModelRegistry ==========

describe("ModelRegistry", () => {
  const supplierSchema = z.object({
    id: z.string(),
    name: z.string(),
    code: z.string(),
  })

  const createSupplier = z.object({ name: z.string() })
  const updateSupplier = z.object({ name: z.string().optional() })
  const querySupplier = z.object({ name: z.string().optional(), page: z.number().optional() })

  it("register 后可通过 get 获取", () => {
    const registry = new ModelRegistry()
    registry.register({
      name: "supplier",
      entitySchema: supplierSchema,
      createSchema: createSupplier,
      updateSchema: updateSupplier,
      querySchema: querySupplier,
    })

    const def = registry.get("supplier")
    expect(def).toBeDefined()
    expect(def?.name).toBe("supplier")
  })

  it("get 未注册的模型返回 undefined", () => {
    const registry = new ModelRegistry()
    expect(registry.get("unknown")).toBeUndefined()
  })

  it("names 返回所有已注册模型名称", () => {
    const registry = new ModelRegistry()
    registry.register({ name: "a", entitySchema: supplierSchema, createSchema: createSupplier, updateSchema: updateSupplier, querySchema: querySupplier })
    registry.register({ name: "b", entitySchema: supplierSchema, createSchema: createSupplier, updateSchema: updateSupplier, querySchema: querySupplier })

    expect(registry.names()).toEqual(["a", "b"])
  })

  it("clear 后 get 返回 undefined", () => {
    const registry = new ModelRegistry()
    registry.register({ name: "supplier", entitySchema: supplierSchema, createSchema: createSupplier, updateSchema: updateSupplier, querySchema: querySupplier })
    registry.clear()

    expect(registry.get("supplier")).toBeUndefined()
    expect(registry.names()).toEqual([])
  })

  it("支持 relations 定义", () => {
    const registry = new ModelRegistry()
    registry.register({
      name: "supplier",
      entitySchema: supplierSchema,
      createSchema: createSupplier,
      updateSchema: updateSupplier,
      querySchema: querySupplier,
      relations: [{ type: "one-to-many", targetModel: "pricing", foreignKey: "supplierId" }],
    })

    const def = registry.get("supplier")
    expect(def?.relations).toHaveLength(1)
    expect(def?.relations?.[0]?.foreignKey).toBe("supplierId")
  })
})

// ========== EntityMappingRegistry ==========

describe("createEntityMappingRegistry", () => {
  it("add 后可通过 of 获取映射", () => {
    const registry = createEntityMappingRegistry()

    registry.add({
      sourceModel: "supplier",
      targetModel: "pricing",
      direction: "children",
      foreignKey: "supplierId",
    })

    const mappings = registry.of("supplier")
    expect(mappings).toHaveLength(1)
    expect(mappings[0]?.targetModel).toBe("pricing")
  })

  it("of 未注册模型返回空数组", () => {
    const registry = createEntityMappingRegistry()
    expect(registry.of("unknown")).toEqual([])
  })

  it("between 返回匹配的映射", () => {
    const registry = createEntityMappingRegistry()

    registry.add({ sourceModel: "supplier", targetModel: "pricing", direction: "children", foreignKey: "supplierId" })
    registry.add({ sourceModel: "supplier", targetModel: "contract", direction: "children", foreignKey: "supplierId" })

    const mapping = registry.between("supplier", "contract")
    expect(mapping).toBeDefined()
    expect(mapping?.targetModel).toBe("contract")
  })

  it("between 不匹配返回 undefined", () => {
    const registry = createEntityMappingRegistry()
    registry.add({ sourceModel: "supplier", targetModel: "pricing", direction: "children", foreignKey: "supplierId" })

    expect(registry.between("supplier", "contract")).toBeUndefined()
  })

  it("支持 cascade 属性", () => {
    const registry = createEntityMappingRegistry()

    registry.add({
      sourceModel: "contract",
      targetModel: "contract_entry",
      direction: "children",
      foreignKey: "contractId",
      cascade: true,
    })

    const mapping = registry.between("contract", "contract_entry")
    expect(mapping?.cascade).toBe(true)
  })
})
