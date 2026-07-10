/**
 * apps/web 前端入口 — DI 接线层。
 *
 * 启动流程：
 *   1. loadConfig()      → 读取环境配置（mock/dev/prod）
 *   2. createLogger()    → 注入日志级别
 *   3. setupHttpClient() → 注入 baseURL，自动按环境切换
 *   4. ReactDOM.render() → 渲染应用
 */

import { loadConfig } from "@ps/env-config"
import { createLogger, LEVEL_VALUES } from "@ps/log"
import { setupHttpClient } from "@ps/web-kit"
import React from "react"
import ReactDOM from "react-dom/client"

import { App } from "./App"

// ---------- 1. 加载环境配置 ----------
const config = loadConfig()

// ---------- 2. 初始化日志 ----------
const logger = createLogger({
  level: LEVEL_VALUES[config.logLevel],
})

logger.info("前端环境配置加载完成", {
  env: config.env,
  appName: config.appName,
})

// ---------- 3. 初始化 HTTP 客户端 ----------
// 直接传入 baseURL 避免 setupHttpClient 内部二次调用 loadConfig
setupHttpClient({ baseURL: config.apiBaseUrl })

logger.info("HTTP 客户端初始化完成", { baseURL: config.apiBaseUrl })

// ---------- 4. 渲染 React 应用 ----------
const root = document.getElementById("root")

if (root === null) {
  throw new Error("找不到根节点 #root，请检查 index.html")
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
