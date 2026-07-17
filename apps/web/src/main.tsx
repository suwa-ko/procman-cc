/**
 * apps/web 前端入口 — DI 接线层。
 *
 * 启动流程：
 *   1. loadConfig()      → 读取环境配置（mock/dev/prod）
 *   2. createLogger()    → 注入日志级别
 *   3. setupHttpClient() → 注入 baseURL，自动按环境切换
 *   4. mock 环境          → 启动 MSW + 种子数据 + 拦截 API
 *   5. ReactDOM.render() → 渲染应用
 */

import type { AppEnv } from "@ps/env-config"
import { loadConfig } from "@ps/env-config"
import { createLogger, LEVEL_VALUES } from "@ps/log"
import { setupHttpClient } from "@ps/web-kit"
import React from "react"
import ReactDOM from "react-dom/client"

import { App } from "./App"

// ---------- 1. 加载环境配置 ----------
// 通过 VITE_APP_ENV 切换环境，默认 mock（安全默认值）
const rawEnv = import.meta.env.VITE_APP_ENV as string | undefined
const appEnv: AppEnv = rawEnv === "dev" || rawEnv === "prod" ? rawEnv : "mock"
const config = loadConfig({ env: appEnv, overrides: import.meta.env })

// ---------- 2. 初始化日志 ----------
const logger = createLogger({
  level: LEVEL_VALUES[config.logLevel],
})

logger.info("前端环境配置加载完成", {
  env: config.env,
  appName: config.appName,
})

// ---------- 3. 初始化 HTTP 客户端 ----------
setupHttpClient({ baseURL: config.apiBaseUrl })

logger.info("HTTP 客户端初始化完成", { baseURL: config.apiBaseUrl })

// ---------- 4. mock 环境：启动 MSW ----------
async function bootstrap(): Promise<void> {
  if (config.env === "mock") {
    const { createMockStores, seedMockData, startMockBrowser } =
      await import("./mocks")
    const stores = createMockStores()
    seedMockData(stores)
    await startMockBrowser(stores)
    logger.info("MSW mock 环境启动完成", {
      suppliers: stores.supplier.size,
      materials: stores.material.size,
      contracts: stores.contract.size,
    })
  }

  // ---------- 5. 渲染 React 应用 ----------
  const root = document.getElementById("root")
  if (root === null) {
    throw new Error("找不到根节点 #root，请检查 index.html")
  }
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

bootstrap().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : "应用启动失败"
  logger.error(msg)
  const rootEl = document.getElementById("root")
  if (rootEl !== null) {
    rootEl.innerText = `启动失败: ${msg}`
  }
})
