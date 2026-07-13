/**
 * Mock 种子数据生成器。
 * 使用 @ps/mock 工厂创建关联一致的初始数据，注入到各个 store。
 */

import {
  createCategory,
  createContract,
  createContractEntry,
  createMaterial,
  createPerson,
  createPricing,
  createSupplier,
  createTemplate,
} from "@ps/mock"

import type {
  AuthStore,
  CategoryStore,
  ContractStore,
  MaterialStore,
  PersonStore,
  PricingStore,
  SupplierStore,
  TemplateStore,
} from "./stores"

/** 种子数据配置 */
interface SeedConfig {
  supplierCount: number
  categoryCount: number
  materialCount: number
  templateCount: number
  personCount: number
  contractCount: number
  entriesPerContract: number
}

const DEFAULT_CONFIG: SeedConfig = {
  supplierCount: 15,
  categoryCount: 8,
  materialCount: 30,
  templateCount: 4,
  personCount: 10,
  contractCount: 10,
  entriesPerContract: 3,
}

/**
 * 生成种子数据的核心函数。
 * 按依赖顺序创建关联实体：人员 → 品类 → 物料 → 供应商 → 定价 → 模板 → 合同+条目
 */
export function seedMockData(
  stores: {
    supplier: SupplierStore
    category: CategoryStore
    material: MaterialStore
    pricing: PricingStore
    contract: ContractStore
    template: TemplateStore
    person: PersonStore
    auth: AuthStore
  },
  config: Partial<SeedConfig> = {}
): void {
  const cfg = { ...DEFAULT_CONFIG, ...config }

  // 1. 人员（独立，被合同引用）
  const persons = Array.from({ length: cfg.personCount }, () => createPerson())
  stores.person.seed(persons)

  // 2. 品类（自引用树结构）
  //    先创建平铺品类列表（无 parentId），再分配 parentId
  const categories = Array.from({ length: cfg.categoryCount }, () =>
    createCategory()
  )
  for (let i = 3; i < cfg.categoryCount; i++) {
    const cat = categories[i]
    if (cat) {
      const parentIdx = Math.floor(Math.random() * 3)
      const parent = categories[parentIdx]
      cat.parentId = parent?.id ?? null
    }
  }
  stores.category.seed(categories)

  // 3. 物料（关联品类）
  const materials = Array.from({ length: cfg.materialCount }, () =>
    createMaterial({
      categoryId:
        categories[Math.floor(Math.random() * categories.length)]?.id ?? "",
    })
  )
  stores.material.seed(materials)

  // 4. 供应商（独立）
  const suppliers = Array.from({ length: cfg.supplierCount }, () =>
    createSupplier()
  )
  stores.supplier.seed(suppliers)

  // 5. 定价（关联供应商 + 物料）
  const pricings = Array.from(
    { length: cfg.supplierCount * 2 },
    () => {
      const supplier = suppliers[Math.floor(Math.random() * suppliers.length)]
      const material = materials[Math.floor(Math.random() * materials.length)]
      if (!supplier || !material) {
        return createPricing()
      }
      return createPricing({
        supplierId: supplier.id,
        materialId: material.id,
      })
    }
  )
  stores.pricing.seed(pricings)
  // 注入物料→品类映射（供定价按品类筛选）
  const catMap = new Map<string, string>()
  for (const m of materials) {
    catMap.set(m.id, m.categoryId)
  }
  stores.pricing.setMaterialCategoryMap(catMap)

  // 6. 模板（独立）
  const templates = Array.from({ length: cfg.templateCount }, () =>
    createTemplate()
  )
  stores.template.seed(templates)

  // 7. 合同 + 条目（关联供应商/人员/模板）
  for (let i = 0; i < cfg.contractCount; i++) {
    const supplier = suppliers[Math.floor(Math.random() * suppliers.length)]
    const handler = persons[Math.floor(Math.random() * persons.length)]
    const template = templates[Math.floor(Math.random() * templates.length)]
    if (!supplier || !handler || !template) {
      continue
    }

    const contract = createContract({
      supplierId: supplier.id,
      handlerId: handler.id,
      handlerName: handler.name,
      templateId: template.id,
    })
    stores.contract.seed([contract])

    // 合同条目（关联物料）
    const entries = Array.from({ length: cfg.entriesPerContract }, (_, j) => {
      const material = materials[Math.floor(Math.random() * materials.length)]
      if (!material) {
        return createContractEntry({ contractId: contract.id })
      }
      return createContractEntry({
        contractId: contract.id,
        materialId: material.id,
        materialName: material.name,
        sortOrder: j + 1,
      })
    })
    stores.contract.setEntries(contract.id, entries)
  }
}
