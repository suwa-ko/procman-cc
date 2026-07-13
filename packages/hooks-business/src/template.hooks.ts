/**
 * 合同模板 CRUD Hooks
 */

import type {
  CreateTemplateRequest,
  TemplateDTO,
  TemplateQueryParams,
  UpdateTemplateRequest,
} from "@ps/contracts"
import { createCrudHooks } from "@vibe-purchase/hooks-core"
import type { CrudHooks } from "@vibe-purchase/hooks-core"

const templateHooks = createCrudHooks<
  TemplateDTO,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  TemplateQueryParams
>({
  baseUrl: "/api/templates",
  queryKey: ["templates"],
  entityName: "模板",
})

export type TemplateHooks = CrudHooks<
  TemplateDTO,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  TemplateQueryParams
>

export const {
  useList: useTemplateList,
  useDetail: useTemplateDetail,
  useCreate: useCreateTemplate,
  useUpdate: useUpdateTemplate,
  useDelete: useDeleteTemplate,
} = templateHooks
