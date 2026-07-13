export { BaseMockStore } from "./base.store"
export type { ListParams } from "./base.store"
export { SupplierStore } from "./supplier.store"
export { CategoryStore } from "./category.store"
export { MaterialStore } from "./material.store"
export { PricingStore } from "./pricing.store"
export { ContractStore } from "./contract.store"
export { TemplateStore } from "./template.store"
export { PersonStore } from "./person.store"
export { AuthStore } from "./auth.store"

import type { AuthStore } from "./auth.store"
import type { CategoryStore } from "./category.store"
import type { ContractStore } from "./contract.store"
import type { MaterialStore } from "./material.store"
import type { PersonStore } from "./person.store"
import type { PricingStore } from "./pricing.store"
import type { SupplierStore } from "./supplier.store"
import type { TemplateStore } from "./template.store"

/** 全部 Mock Store 实例集合的类型 */
export interface AllMockStores {
  supplier: SupplierStore
  category: CategoryStore
  material: MaterialStore
  pricing: PricingStore
  contract: ContractStore
  template: TemplateStore
  person: PersonStore
  auth: AuthStore
}
