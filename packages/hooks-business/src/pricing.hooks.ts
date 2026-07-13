/**
 * 定价 CRUD Hooks
 */

import type {
  CreatePricingRequest,
  PricingDTO,
  PricingQueryParams,
  UpdatePricingRequest,
} from "@ps/contracts"
import { createCrudHooks } from "@ps/hooks-core"
import type { CrudHooks } from "@ps/hooks-core"

const pricingHooks = createCrudHooks<
  PricingDTO,
  CreatePricingRequest,
  UpdatePricingRequest,
  PricingQueryParams
>({
  baseUrl: "/api/pricings",
  queryKey: ["pricings"],
  entityName: "定价",
})

export type PricingHooks = CrudHooks<
  PricingDTO,
  CreatePricingRequest,
  UpdatePricingRequest,
  PricingQueryParams
>

export const {
  useList: usePricingList,
  useDetail: usePricingDetail,
  useCreate: useCreatePricing,
  useUpdate: useUpdatePricing,
  useDelete: useDeletePricing,
} = pricingHooks
