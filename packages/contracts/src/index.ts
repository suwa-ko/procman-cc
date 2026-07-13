/**
 * @ps/contracts
 * API 契约包 — 枚举 / DTO / Zod schema / 业务常量
 * 前后端校验单一真相源，通过 @ps/model 引入 Schema，通过 @ps/types-base 引入基础类型
 */

// ---- 从 @ps/model 重新导出（向后兼容） ----
export {
  // 枚举
  SupplierStatus,
  ContractStatus,
  ContractType,
  PricingStatus,
  MaterialStatus,
  // Schema
  supplierSchema,
  createSupplierSchema,
  updateSupplierSchema,
  supplierQuerySchema,
  categorySchema,
  createCategorySchema,
  updateCategorySchema,
  categoryQuerySchema,
  materialSchema,
  createMaterialSchema,
  updateMaterialSchema,
  materialQuerySchema,
  pricingSchema,
  createPricingSchema,
  updatePricingSchema,
  pricingQuerySchema,
  contractSchema,
  contractEntrySchema,
  createContractSchema,
  updateContractSchema,
  createContractEntrySchema,
  updateContractEntrySchema,
  contractQuerySchema,
  templateSchema,
  templateVariableSchema,
  createTemplateSchema,
  updateTemplateSchema,
  templateQuerySchema,
  personSchema,
  personQuerySchema,
  loginSchema,
  registerSchema,
} from "@ps/model"

export type {
  SupplierEntity,
  CreateSupplierInput,
  UpdateSupplierInput,
  SupplierQuery,
  CategoryEntity,
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryQuery,
  MaterialEntity,
  CreateMaterialInput,
  UpdateMaterialInput,
  MaterialQuery,
  PricingEntity,
  CreatePricingInput,
  UpdatePricingInput,
  PricingQuery,
  ContractEntity,
  ContractEntryEntity,
  CreateContractInput,
  UpdateContractInput,
  CreateContractEntryInput,
  UpdateContractEntryInput,
  ContractQuery,
  TemplateEntity,
  TemplateVariableEntity,
  CreateTemplateInput,
  UpdateTemplateInput,
  TemplateQuery,
  PersonEntity,
  PersonQuery,
  LoginInput,
  RegisterInput,
} from "@ps/model"

// ---- 常量 ----
export { CODE_PREFIX } from "./constants/code-prefix"

// ---- DTO ----
export type {
  SupplierDTO,
  CreateSupplierRequest,
  UpdateSupplierRequest,
  SupplierQueryParams,
  SupplierListResponse,
} from "./dto/supplier.dto"

export type {
  MaterialDTO,
  CreateMaterialRequest,
  UpdateMaterialRequest,
  MaterialQueryParams,
  MaterialListResponse,
} from "./dto/material.dto"

export type {
  CategoryDTO,
  CategoryTreeNode,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryQueryParams,
  CategoryListResponse,
} from "./dto/category.dto"

export type {
  PricingDTO,
  CreatePricingRequest,
  UpdatePricingRequest,
  PricingQueryParams,
  PricingListResponse,
} from "./dto/price.dto"

export type {
  ContractDTO,
  ContractEntryDTO,
  CreateContractRequest,
  UpdateContractRequest,
  CreateContractEntryRequest,
  UpdateContractEntryRequest,
  ContractQueryParams,
  ContractListResponse,
} from "./dto/contract.dto"

export type {
  TemplateDTO,
  TemplateVariable,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  TemplateQueryParams,
  TemplateListResponse,
} from "./dto/template.dto"

export type {
  PersonDTO,
  PersonQueryParams,
  PersonListResponse,
} from "./dto/person.dto"

export type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from "./dto/auth.dto"
