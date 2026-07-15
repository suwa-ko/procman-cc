/**
 * apps/api 服务入口 — DI 接线层。
 *
 * 启动流程：
 *   1. loadConfig()     → 读取环境配置（mock/dev/prod）
 *   2. createLogger()   → 注入日志级别
 *   3. createDbClient() → 根据环境选择真实 Supabase 或 Mock 数据库
 *   4. createApp()      → 注入 db + logger → 返回 Hono 实例
 *   5. serve()          → 启动 HTTP 服务器
 */

import { serve } from "@hono/node-server"
import { createDbClient, createMockDbClient } from "@ps/db"
import { loadConfig } from "@ps/env-config"
import { createLogger, LEVEL_VALUES } from "@ps/log"

import { createApp } from "./app"

// ---------- 1. 加载环境配置 ----------
const config = loadConfig({ overrides: process.env as Record<string, string | undefined> })

// ---------- 2. 初始化日志 ----------
const logger = createLogger({
  level: LEVEL_VALUES[config.logLevel],
})

logger.info("环境配置加载完成", { env: config.env, appName: config.appName })

// ---------- 3. 初始化数据库客户端 ----------
// mock 环境使用内存模拟数据库，dev/prod 连接真实 Supabase
const db =
  config.env === "mock"
    ? createMockDbClient()
    : createDbClient(
        { url: config.supabaseUrl, anonKey: config.supabaseAnonKey },
        logger
      )

logger.info("数据库客户端初始化完成", { env: config.env })

// ---------- 4. 创建 Hono 应用（DI 注入） ----------
const app = createApp({ db })

// ---------- 5. 启动 HTTP 服务 ----------
serve({ fetch: app.fetch, port: 3000 }, (info) => {
  logger.info("服务启动成功", {
    port: info.port,
    env: config.env,
  })
})
