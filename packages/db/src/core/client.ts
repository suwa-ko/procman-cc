import type { Logger } from "@ps/log"
import { createClient } from "@supabase/supabase-js"

import type { DbClient, DbConfig, DbSupabase } from "./types"

/**
 * 创建数据库客户端。
 * config 与 logger 由 apps 层注入，@ps/db 不直接引用 @ps/env-config（依赖注入）。
 * 显式关闭会话持久化：本包仅在 Node 服务端使用，无需也不应使用浏览器存储。
 */
export function createDbClient(config: DbConfig, logger: Logger): DbClient {
  const supabase = createClient(config.url, config.anonKey, {
    auth: { persistSession: false },
  })
  return {
    supabase: supabase as unknown as DbSupabase,
    logger,
  }
}
