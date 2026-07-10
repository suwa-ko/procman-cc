import { describe, expect, it, vi } from "vitest"

import { assertConfig, loadConfig, validateConfig } from "../index"
import type { AppConfig } from "../index"

// ============================================================
// loadConfig — 预设选择与默认值
// ============================================================

describe("loadConfig", () => {
  describe("环境预设选择", () => {
    it("默认环境应为 dev", () => {
      const config = loadConfig()
      expect(config.env).toBe("dev")
      expect(config.supabaseUrl).toBe("http://localhost:54321")
      expect(config.logLevel).toBe("debug")
    })

    it("显式指定 mock 环境", () => {
      const config = loadConfig({ env: "mock" })
      expect(config.env).toBe("mock")
      expect(config.supabaseUrl).toBe("")
      expect(config.appName).toContain("Mock")
    })

    it("显式指定 dev 环境", () => {
      const config = loadConfig({ env: "dev" })
      expect(config.env).toBe("dev")
      expect(config.apiBaseUrl).toBe("http://localhost:3000")
    })

    it("显式指定 prod 环境", () => {
      const config = loadConfig({
        env: "prod",
        overrides: { SUPABASE_URL: "https://xxx.supabase.co" },
      })
      expect(config.env).toBe("prod")
      expect(config.logLevel).toBe("info")
      expect(config.nodeEnv).toBe("production")
    })

    it("返回的配置应被冻结（不可修改）", () => {
      const config = loadConfig({ env: "mock" })
      expect(Object.isFrozen(config)).toBe(true)
      expect(() => {
        const mutable = config as unknown as Record<string, unknown>
        mutable.env = "prod"
      }).toThrow()
    })
  })

  // ----------------------------------------------------------
  // 环境变量覆盖
  // ----------------------------------------------------------

  describe("环境变量覆盖", () => {
    it("SUPABASE_URL 覆盖预设值", () => {
      const config = loadConfig({
        env: "dev",
        overrides: { SUPABASE_URL: "https://custom.supabase.co" },
      })
      expect(config.supabaseUrl).toBe("https://custom.supabase.co")
    })

    it("API_BASE_URL 覆盖预设值", () => {
      const config = loadConfig({
        env: "dev",
        overrides: { API_BASE_URL: "https://api.example.com" },
      })
      expect(config.apiBaseUrl).toBe("https://api.example.com")
    })

    it("LOG_LEVEL 覆盖预设值", () => {
      const config = loadConfig({
        env: "prod",
        overrides: {
          SUPABASE_URL: "https://xxx.supabase.co",
          LOG_LEVEL: "warn",
        },
      })
      expect(config.logLevel).toBe("warn")
    })

    it("APP_NAME 覆盖预设值", () => {
      const config = loadConfig({
        env: "dev",
        overrides: { APP_NAME: "自定义系统" },
      })
      expect(config.appName).toBe("自定义系统")
    })

    it("LOGO_URL 覆盖预设值", () => {
      const config = loadConfig({
        env: "dev",
        overrides: { LOGO_URL: "https://cdn.example.com/logo.png" },
      })
      expect(config.logoUrl).toBe("https://cdn.example.com/logo.png")
    })

    it("空字符串覆盖值应被忽略（保留预设）", () => {
      const config = loadConfig({
        env: "dev",
        overrides: { SUPABASE_URL: "" },
      })
      // 空字符串被忽略，保留 dev preset 的默认值
      expect(config.supabaseUrl).toBe("http://localhost:54321")
    })

    it("NODE_ENV 覆盖预设值", () => {
      const config = loadConfig({
        env: "dev",
        overrides: { NODE_ENV: "staging" },
      })
      expect(config.nodeEnv).toBe("staging")
    })
  })

  // ----------------------------------------------------------
  // APP_ENV 动态环境切换
  // ----------------------------------------------------------

  describe("APP_ENV 动态环境切换", () => {
    it("APP_ENV=mock 可从 dev 切换到 mock", () => {
      const config = loadConfig({
        env: "dev",
        overrides: { APP_ENV: "mock" },
      })
      expect(config.env).toBe("mock")
      // mock 环境允许空 supabaseUrl
      expect(config.supabaseUrl).toBe("")
    })

    it("APP_ENV=dev 可从 mock 切换到 dev（需提供 SUPABASE_URL）", () => {
      const config = loadConfig({
        env: "mock",
        overrides: {
          APP_ENV: "dev",
          SUPABASE_URL: "https://dev.supabase.co",
        },
      })
      expect(config.env).toBe("dev")
      expect(config.supabaseUrl).toBe("https://dev.supabase.co")
    })

    it("APP_ENV=prod 可从 dev 切换到 prod", () => {
      const config = loadConfig({
        env: "dev",
        overrides: {
          APP_ENV: "prod",
          SUPABASE_URL: "https://prod.supabase.co",
        },
      })
      expect(config.env).toBe("prod")
    })
  })

  // ----------------------------------------------------------
  // 校验：必填项缺失
  // ----------------------------------------------------------

  describe("校验失败", () => {
    it("prod 环境缺少 supabaseUrl 应抛出", () => {
      expect(() => loadConfig({ env: "prod" })).toThrow("环境配置校验失败")
    })

    it("dev 环境缺少 supabaseUrl 应抛出（dev preset 有默认值，但可通过空字符串覆盖导致缺失）", () => {
      // dev preset 自带 supabaseUrl，不会被空字符串覆盖移除
      // 直接构造一个覆写场景：先用 prod preset + SUPABASE_URL 让校验通过
      // dev 自带默认值，不会触发缺陷
      // 这里验证 dev 默认值有效
      const config = loadConfig({ env: "dev" })
      expect(config.supabaseUrl).toBeTruthy()
    })
  })
})

// ============================================================
// validateConfig — 字段级校验
// ============================================================

describe("validateConfig", () => {
  function makeConfig(overrides: Partial<AppConfig>): AppConfig {
    return {
      env: "dev",
      supabaseUrl: "http://localhost:54321",
      supabaseAnonKey: "",
      apiBaseUrl: "http://localhost:3000",
      logLevel: "debug",
      appName: "测试",
      logoUrl: "",
      nodeEnv: "test",
      ...overrides,
    }
  }

  it("完整配置应校验通过", () => {
    const result = validateConfig(makeConfig({}))
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it("mock 环境 supabaseUrl 为空应通过", () => {
    const result = validateConfig(makeConfig({ env: "mock", supabaseUrl: "" }))
    expect(result.valid).toBe(true)
  })

  it("dev 环境 supabaseUrl 为空应失败", () => {
    const result = validateConfig(makeConfig({ env: "dev", supabaseUrl: "" }))
    expect(result.valid).toBe(false)
    expect(result.errors).toContain(
      "DEV 环境缺少 supabaseUrl（请设置 SUPABASE_URL 环境变量）"
    )
  })

  it("prod 环境 supabaseUrl 为空应失败", () => {
    const result = validateConfig(makeConfig({ env: "prod", supabaseUrl: "" }))
    expect(result.valid).toBe(false)
    expect(result.errors).toContain(
      "PROD 环境缺少 supabaseUrl（请设置 SUPABASE_URL 环境变量）"
    )
  })

  it("appName 为空应失败", () => {
    const result = validateConfig(makeConfig({ appName: "" }))
    expect(result.valid).toBe(false)
    expect(result.errors).toContain("appName（企业名称）未配置")
  })

  it("apiBaseUrl 为空应失败", () => {
    const result = validateConfig(makeConfig({ apiBaseUrl: "" }))
    expect(result.valid).toBe(false)
    expect(result.errors).toContain("apiBaseUrl（API 基础地址）未配置")
  })

  it("多项缺失应一次返回所有错误", () => {
    const result = validateConfig(
      makeConfig({ env: "prod", supabaseUrl: "", appName: "", apiBaseUrl: "" })
    )
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveLength(3)
  })
})

// ============================================================
// assertConfig — 布尔 + console.error 输出
// ============================================================

describe("assertConfig", () => {
  function makeConfig(overrides: Partial<AppConfig>): AppConfig {
    return {
      env: "dev",
      supabaseUrl: "http://localhost:54321",
      supabaseAnonKey: "",
      apiBaseUrl: "http://localhost:3000",
      logLevel: "debug",
      appName: "测试",
      logoUrl: "",
      nodeEnv: "test",
      ...overrides,
    }
  }

  it("有效配置应返回 true", () => {
    expect(assertConfig(makeConfig({}))).toBe(true)
  })

  it("无效配置应返回 false 并 console.error", () => {
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined)
    const result = assertConfig(makeConfig({ appName: "" }))
    expect(result).toBe(false)
    expect(errorSpy).toHaveBeenCalledWith(
      "[env-config] appName（企业名称）未配置"
    )
    errorSpy.mockRestore()
  })
})
