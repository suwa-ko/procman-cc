/**
 * @vibe-purchase/hooks-business
 * 业务 Hook 库
 *
 * 为所有已有业务模型提供开箱即用的 CRUD Hooks。
 * 内部调用 @vibe-purchase/hooks-core 的 createCrudHooks 工厂。
 */

export {
  useSupplierList,
  useSupplierDetail,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
} from "./supplier.hooks"
export type { SupplierHooks } from "./supplier.hooks"

export {
  useMaterialList,
  useMaterialDetail,
  useCreateMaterial,
  useUpdateMaterial,
  useDeleteMaterial,
} from "./material.hooks"
export type { MaterialHooks } from "./material.hooks"

export {
  useCategoryList,
  useCategoryDetail,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "./category.hooks"
export type { CategoryHooks } from "./category.hooks"

export {
  usePricingList,
  usePricingDetail,
  useCreatePricing,
  useUpdatePricing,
  useDeletePricing,
} from "./pricing.hooks"
export type { PricingHooks } from "./pricing.hooks"

export {
  useContractList,
  useContractDetail,
  useCreateContract,
  useUpdateContract,
  useDeleteContract,
} from "./contract.hooks"
export type { ContractHooks } from "./contract.hooks"

export {
  useTemplateList,
  useTemplateDetail,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
} from "./template.hooks"
export type { TemplateHooks } from "./template.hooks"

export { usePersonList, usePersonDetail } from "./person.hooks"

export { useUserList, useUserDetail } from "./user.hooks"
