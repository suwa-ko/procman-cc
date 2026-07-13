/**
 * 品类 CRUD Hooks
 */

import type {
  CategoryDTO,
  CategoryQueryParams,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@ps/contracts"
import { createCrudHooks } from "@vibe-purchase/hooks-core"
import type { CrudHooks } from "@vibe-purchase/hooks-core"

const categoryHooks = createCrudHooks<
  CategoryDTO,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryQueryParams
>({
  baseUrl: "/api/categories",
  queryKey: ["categories"],
  entityName: "品类",
})

export type CategoryHooks = CrudHooks<
  CategoryDTO,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryQueryParams
>

export const {
  useList: useCategoryList,
  useDetail: useCategoryDetail,
  useCreate: useCreateCategory,
  useUpdate: useUpdateCategory,
  useDelete: useDeleteCategory,
} = categoryHooks
