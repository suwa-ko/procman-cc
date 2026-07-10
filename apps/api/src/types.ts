/**
 * 应用层共享类型。
 * 提取 AppDependencies 避免 app.ts ↔ routes/ 循环引用。
 */

import type { DbClient } from "@ps/db"

/** 应用依赖（由 apps/api/src/index.ts 通过 DI 注入） */
export interface AppDependencies {
  db: DbClient
}
