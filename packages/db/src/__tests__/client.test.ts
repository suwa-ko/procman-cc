import type { Logger } from "@ps/log"
import { createClient } from "@supabase/supabase-js"
import { describe, it, expect, vi } from "vitest"

import { createDbClient } from "../core/client"

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({ from: vi.fn() })),
}))

describe("createDbClient", () => {
  it("应返回包含 supabase 与 logger 的客户端", () => {
    const logger = { error: vi.fn() } as unknown as Logger
    const config = { url: "http://localhost:5432", anonKey: "test-anon-key" }

    const client = createDbClient(config, logger)

    expect(client.supabase).toBeDefined()
    expect(client.logger).toBe(logger)
    expect(createClient).toHaveBeenCalledWith(
      "http://localhost:5432",
      "test-anon-key",
      { auth: { persistSession: false } }
    )
  })

  it("应将配置透传给 supabase createClient", () => {
    const logger = { error: vi.fn() } as unknown as Logger
    const config = {
      url: "https://example.supabase.co",
      anonKey: "another-key",
    }

    createDbClient(config, logger)

    expect(createClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "another-key",
      { auth: { persistSession: false } }
    )
  })
})
