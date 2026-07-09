# @ps/types-base

> 基础类型包 — 与业务无关的泛型类型（分页、API 响应、实体、错误等）。

## 定位

- **层级**：第一层（零内部依赖）
- **运行环境**：universal（浏览器与 Node 均可）
- **依赖**：无任何 `@ps/` 包依赖，可被所有包引用

## 导出内容

| 模块           | 内容                                                                                     |
| -------------- | ---------------------------------------------------------------------------------------- |
| `api-response` | `ResponseCode` 枚举、`ApiResponse<T>` 接口、`successResponse` / `errorResponse` 工具函数 |
| `api-error`    | `ApiError` 接口、`BusinessException` 业务异常类                                          |
| `pagination`   | `PaginationParams`、`PaginatedResponse<T>`、默认分页常量                                 |
| `entity`       | `ID`、`VersionedEntity`、`TimestampedEntity`、`SoftDeletableEntity`                      |
| `common`       | `Nullable`、`Optional`、`DeepPartial`、`DeepReadonly` 等工具类型                         |

## 使用示例

```ts
import {
  ApiResponse,
  ResponseCode,
  successResponse,
  BusinessException,
  PaginatedResponse,
} from "@ps/types-base"

// 构造成功响应
const res: ApiResponse<UserDTO> = successResponse(user)

// 抛出业务异常（service 层）
throw new BusinessException(ResponseCode.Conflict, "供应商已被引用")

// 分页响应
const page: PaginatedResponse<UserDTO> = {
  data: users,
  total: 100,
  page: 1,
  pageSize: 20,
}
```

## 业务错误码

| 枚举值            | 码值 | 含义           |
| ----------------- | ---- | -------------- |
| `Success`         | 0    | 成功           |
| `ValidationError` | 4000 | 参数校验失败   |
| `Unauthorized`    | 4010 | 未认证         |
| `Forbidden`       | 4030 | 无权限         |
| `NotFound`        | 4040 | 资源不存在     |
| `Conflict`        | 4090 | 业务规则冲突   |
| `InternalError`   | 5000 | 服务器内部错误 |

## 开发命令

```bash
pnpm --filter @ps/types-base build       # 构建
pnpm --filter @ps/types-base typecheck   # 类型检查
pnpm --filter @ps/types-base test        # 测试
pnpm --filter @ps/types-base lint        # lint
```
