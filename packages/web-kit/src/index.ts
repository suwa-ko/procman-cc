/**
 * @ps/web-kit
 * 前端能力包 — 网络请求封装 + React Hooks + UI 组件
 *
 * 当前迭代：request 模块（通用 HTTP 客户端）
 * 后续迭代：hooks/（useQuery/useMutation）、components/（业务复合组件）
 *
 * 依赖注入：baseURL 由 apps/web 从 @ps/env-config 读取后注入，本包不引用 env-config。
 */

export * from "./request"
