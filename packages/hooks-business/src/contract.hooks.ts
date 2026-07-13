/**
 * 合同 CRUD Hooks
 */

import type {
  ContractDTO,
  ContractQueryParams,
  CreateContractRequest,
  UpdateContractRequest,
} from "@ps/contracts"
import { createCrudHooks } from "@ps/hooks-core"
import type { CrudHooks } from "@ps/hooks-core"

const contractHooks = createCrudHooks<
  ContractDTO,
  CreateContractRequest,
  UpdateContractRequest,
  ContractQueryParams
>({
  baseUrl: "/api/contracts",
  queryKey: ["contracts"],
  entityName: "合同",
})

export type ContractHooks = CrudHooks<
  ContractDTO,
  CreateContractRequest,
  UpdateContractRequest,
  ContractQueryParams
>

export const {
  useList: useContractList,
  useDetail: useContractDetail,
  useCreate: useCreateContract,
  useUpdate: useUpdateContract,
  useDelete: useDeleteContract,
} = contractHooks
