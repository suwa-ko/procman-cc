/**
 * @ps/contracts
 * API 契约包 — 枚举 / DTO / Zod schema / 业务常量
 * 前后端校验单一真相源，通过 @ps/types-base 引入基础类型
 */

// ---- 枚举 ----
export {
  SupplierStatus,
  ContractStatus,
  ContractType,
  PricingStatus,
  MaterialStatus,
} from "./enums"

// ---- 常量 ----
export { CODE_PREFIX } from "./constants/code-prefix"

// ---- Schema（Zod 校验） ----
export {
  supplierSchema,
  createSupplierSchema,
  updateSupplierSchema,
} from "./schemas/supplier"
export type {
  SupplierDTO,
  CreateSupplierRequest,
  UpdateSupplierRequest,
} from "./schemas/supplier"

export {
  materialSchema,
  createMaterialSchema,
  updateMaterialSchema,
} from "./schemas/material"
export type {
  MaterialDTO,
  CreateMaterialRequest,
  UpdateMaterialRequest,
} from "./schemas/material"

export {
  pricingSchema,
  createPricingSchema,
  updatePricingSchema,
} from "./schemas/price"
export type {
  PricingDTO,
  CreatePricingRequest,
  UpdatePricingRequest,
} from "./schemas/price"

export {
  contractSchema,
  contractEntrySchema,
  createContractSchema,
  updateContractSchema,
} from "./schemas/contract"
export type {
  ContractDTO,
  ContractEntryDTO,
  CreateContractRequest,
  UpdateContractRequest,
  CreateContractEntryRequest,
} from "./schemas/contract"

// ---- DTO（查询参数 / 列表响应 / 非校验类型） ----
export type {
  SupplierQueryParams,
  SupplierListResponse,
} from "./dto/supplier.dto"

export type {
  CategoryDTO,
  CategoryTreeNode,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  MaterialQueryParams,
} from "./dto/category.dto"

export type { PersonDTO } from "./dto/person.dto"

export type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from "./dto/auth.dto"

export type { PricingQueryParams, PricingListResponse } from "./dto/price.dto"

export type {
  ContractQueryParams,
  ContractListResponse,
} from "./dto/contract.dto"

export type {
  TemplateDTO,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  TemplateVariable,
} from "./dto/template.dto"
