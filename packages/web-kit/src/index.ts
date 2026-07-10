/**
 * @ps/web-kit
 * 前端能力包 — 网络请求封装 + React Hooks + UI 组件
 *
 * 当前迭代：request 模块（通用 HTTP 客户端 + setupHttpClient 环境感知初始化）
 * 后续迭代：hooks/（useQuery/useMutation）、components/（业务复合组件）
 *
 * setupHttpClient() 自动对接 @ps/env-config 按环境配置 baseURL，
 * 同时保留 createHttpClient() 手动传参方式。
 */

export * from "./request"
