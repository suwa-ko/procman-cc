/**
 * createMockDbClient — Mock 数据库客户端工厂。
 *
 * 纯内存实现 DbClient，不依赖任何外部服务。
 * filters / sorts / range / limit 均在内存执行，用于开发体验与自动化测试。
 *
 * @example
 * const db = createMockDbClient({
 *   suppliers: [{ id: 's1', name: 'ACME', createdAt: '', updatedAt: '' }]
 * })
 * const repo = new SupplierRepository(db)  // BaseRepository 零修改
 */

import { MockQueryChain } from "./mock-query-chain"
import { makeId } from "./mock-query-engine"
import type { DbClient, DbSupabase, DbQueryChain } from "./types"


type InMemoryStore = Map<string, Map<string, Record<string, unknown>>>

/**
 * 创建 Mock 数据库客户端。
 * 纯内存实现，不连接任何外部服务。
 *
 * @param seedData - 可选的预置数据，格式为 { tableName: [records] }
 * @returns 实现 DbClient 接口的 mock 客户端
 */
export function createMockDbClient(
  seedData?: Record<string, Record<string, unknown>[]>
): DbClient {
  const store: InMemoryStore = new Map()

  // 注入预置数据
  if (seedData) {
    for (const [table, records] of Object.entries(seedData)) {
      const tableMap = new Map<string, Record<string, unknown>>()
      for (const record of records) {
        const id = (record.id as string) ?? makeId()
        tableMap.set(id, record)
      }
      store.set(table, tableMap)
    }
  }

  const supabase: DbSupabase = {
    from: (table: string): DbQueryChain =>
      new MockQueryChain(table, store) as unknown as DbQueryChain,
  }

  return {
    supabase,
    logger: {
      debug: () => undefined,
      info: () => undefined,
      warn: () => undefined,
      error: () => undefined,
    },
  } as unknown as DbClient
}
