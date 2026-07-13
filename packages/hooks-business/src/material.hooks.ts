/**
 * 物料 CRUD Hooks
 */

import type {
  CreateMaterialRequest,
  MaterialDTO,
  MaterialQueryParams,
  UpdateMaterialRequest,
} from "@ps/contracts"
import { createCrudHooks } from "@ps/hooks-core"
import type { CrudHooks } from "@ps/hooks-core"

const materialHooks = createCrudHooks<
  MaterialDTO,
  CreateMaterialRequest,
  UpdateMaterialRequest,
  MaterialQueryParams
>({
  baseUrl: "/api/materials",
  queryKey: ["materials"],
  entityName: "物料",
})

export type MaterialHooks = CrudHooks<
  MaterialDTO,
  CreateMaterialRequest,
  UpdateMaterialRequest,
  MaterialQueryParams
>

export const {
  useList: useMaterialList,
  useDetail: useMaterialDetail,
  useCreate: useCreateMaterial,
  useUpdate: useUpdateMaterial,
  useDelete: useDeleteMaterial,
} = materialHooks
