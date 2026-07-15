/**
 * 集成测试 — 全局 setup。
 *
 * 在测试运行前检查 Supabase 连接可用性。
 * 若环境变量未设置或连接失败，通过环境变量标记跳过测试。
 */

export async function setup(): Promise<void> {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY

  if (!url || !key) {
    console.warn(
      "[integration-setup] SUPABASE_URL 或 SUPABASE_ANON_KEY 未设置，集成测试将跳过"
    )
    process.env.INTEGRATION_SKIP = "1"
    return
  }

  try {
    const res = await fetch(`${url}/rest/v1/`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    })
    if (!res.ok && res.status !== 200) {
      // Supabase REST API 通常返回 200 或特定错误
      // 如果连接不通，标记跳过
      console.warn(
        `[integration-setup] Supabase 连接测试返回 ${res.status}，将尝试运行测试`
      )
    }
    process.env.INTEGRATION_SKIP = "0"
    console.log("[integration-setup] Supabase 连接正常")
  } catch {
    console.warn(
      "[integration-setup] 无法连接到 Supabase，集成测试将跳过"
    )
    process.env.INTEGRATION_SKIP = "1"
  }
}
