/**
 * @ps/model-core
 * 模型核心包 — 泛型注册/工厂/映射/仓储契约
 * 依赖 @ps/model，不掺杂具体业务
 */

export type { Repository } from "./types"

export type { ModelDefinition, RelationDefinition } from "./registry"
export { ModelRegistry } from "./registry"

export type {
  RelationDirection,
  EntityMapping,
  EntityMappingRegistry,
} from "./mapping"
export { createEntityMappingRegistry } from "./mapping"
