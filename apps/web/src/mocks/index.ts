/**
 * apps/web Mock 层入口。
 *
 * 提供：
 *   1. createMockStores()   — 创建所有内存 store 实例
 *   2. seedMockData()       — 预填种子数据
 *
 * 使用流程（在 main.tsx 中）：
 *   const stores = createMockStores()
 *   seedMockData(stores)
 *   await startMockBrowser(stores)   // 或 createMockServer(stores) for test
 */

import { fakeId } from "@ps/mock"

import { seedMockData } from "./seed"
import {
  AuthStore,
  CategoryStore,
  ContractStore,
  MaterialStore,
  PersonStore,
  PricingStore,
  SupplierStore,
  TemplateStore,
  type AllMockStores,
} from "./stores"

/** 创建全部 Mock Store 实例 */
export function createMockStores(
  idGen: () => string = () => fakeId()
): AllMockStores {
  return {
    supplier: new SupplierStore(idGen),
    category: new CategoryStore(idGen),
    material: new MaterialStore(idGen),
    pricing: new PricingStore(idGen),
    contract: new ContractStore(idGen),
    template: new TemplateStore(idGen),
    person: new PersonStore(idGen),
    auth: new AuthStore(idGen),
  }
}

export { seedMockData }
export type { AllMockStores }
export { createAllHandlers } from "./handlers"
export { startMockBrowser } from "./browser"
export { createMockServer } from "./server"
