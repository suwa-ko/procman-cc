/**
 * 供应商 CRUD Hooks
 */

import type {
  CreateSupplierRequest,
  SupplierDTO,
  SupplierQueryParams,
  UpdateSupplierRequest,
} from "@ps/contracts"
import { createCrudHooks } from "@ps/hooks-core"
import type { CrudHooks } from "@ps/hooks-core"

const supplierHooks = createCrudHooks<
  SupplierDTO,
  CreateSupplierRequest,
  UpdateSupplierRequest,
  SupplierQueryParams
>({
  baseUrl: "/api/suppliers",
  queryKey: ["suppliers"],
  entityName: "供应商",
})

export type SupplierHooks = CrudHooks<
  SupplierDTO,
  CreateSupplierRequest,
  UpdateSupplierRequest,
  SupplierQueryParams
>

export const {
  useList: useSupplierList,
  useDetail: useSupplierDetail,
  useCreate: useCreateSupplier,
  useUpdate: useUpdateSupplier,
  useDelete: useDeleteSupplier,
} = supplierHooks
