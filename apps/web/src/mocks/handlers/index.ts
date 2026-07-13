import type { HttpHandler } from "msw"

import type { AllMockStores } from "../stores"

import { createAuthHandlers } from "./auth.handler"
import { createCategoryHandlers } from "./category.handler"
import { createContractHandlers } from "./contract.handler"
import { createMaterialHandlers } from "./material.handler"
import { createPersonHandlers } from "./person.handler"
import { createPricingHandlers } from "./pricing.handler"
import { createSupplierHandlers } from "./supplier.handler"
import { createTemplateHandlers } from "./template.handler"

export { createSupplierHandlers } from "./supplier.handler"
export { createCategoryHandlers } from "./category.handler"
export { createMaterialHandlers } from "./material.handler"
export { createPricingHandlers } from "./pricing.handler"
export { createContractHandlers } from "./contract.handler"
export { createTemplateHandlers } from "./template.handler"
export { createPersonHandlers } from "./person.handler"

/** 合并所有 MSW handler */
export function createAllHandlers(stores: AllMockStores): HttpHandler[] {
  return [
    ...createSupplierHandlers(stores.supplier),
    ...createCategoryHandlers(stores.category),
    ...createMaterialHandlers(stores.material),
    ...createPricingHandlers(stores.pricing),
    ...createContractHandlers(stores.contract),
    ...createTemplateHandlers(stores.template),
    ...createPersonHandlers(stores.person),
    ...createAuthHandlers(stores.auth),
  ]
}
