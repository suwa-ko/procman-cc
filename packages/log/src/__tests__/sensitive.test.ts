import { describe, it, expect } from "vitest"

import { isSensitiveKey, maskSensitive } from "../sensitive"

describe("sensitive", () => {
  describe("isSensitiveKey", () => {
    it("应识别 password", () => {
      expect(isSensitiveKey("password")).toBe(true)
      expect(isSensitiveKey("userPassword")).toBe(true)
      expect(isSensitiveKey("PASSWORD")).toBe(true)
    })

    it("应识别 token", () => {
      expect(isSensitiveKey("token")).toBe(true)
      expect(isSensitiveKey("accessToken")).toBe(true)
      expect(isSensitiveKey("refresh_token")).toBe(true)
    })

    it("应识别 secret", () => {
      expect(isSensitiveKey("secret")).toBe(true)
      expect(isSensitiveKey("clientSecret")).toBe(true)
    })

    it("应识别 apiKey / api_key", () => {
      expect(isSensitiveKey("apiKey")).toBe(true)
      expect(isSensitiveKey("api_key")).toBe(true)
    })

    it("应识别 privateKey / private_key", () => {
      expect(isSensitiveKey("privateKey")).toBe(true)
      expect(isSensitiveKey("private_key")).toBe(true)
    })

    it("应识别 authorization", () => {
      expect(isSensitiveKey("authorization")).toBe(true)
      expect(isSensitiveKey("Authorization")).toBe(true)
    })

    it("应识别 cookie", () => {
      expect(isSensitiveKey("cookie")).toBe(true)
    })

    it("不应误判普通字段", () => {
      expect(isSensitiveKey("name")).toBe(false)
      expect(isSensitiveKey("email")).toBe(false)
      expect(isSensitiveKey("port")).toBe(false)
      expect(isSensitiveKey("userName")).toBe(false)
    })

    it("不应误判含 'port' 但非敏感的字段", () => {
      // 'port' 不在敏感列表中，应返回 false
      expect(isSensitiveKey("port")).toBe(false)
      expect(isSensitiveKey("support")).toBe(false)
    })
  })

  describe("maskSensitive", () => {
    it("应脱敏 password 字段", () => {
      const result = maskSensitive({ name: "alice", password: "123456" })
      expect(result.name).toBe("alice")
      expect(result.password).toBe("***")
    })

    it("应脱敏 token 字段", () => {
      const result = maskSensitive({ token: "abc123", user: "bob" })
      expect(result.token).toBe("***")
      expect(result.user).toBe("bob")
    })

    it("应脱敏多个敏感字段", () => {
      const result = maskSensitive({
        username: "admin",
        password: "secret",
        token: "xyz",
        apiKey: "key123",
      })
      expect(result.username).toBe("admin")
      expect(result.password).toBe("***")
      expect(result.token).toBe("***")
      expect(result.apiKey).toBe("***")
    })

    it("非敏感字段应原样保留", () => {
      const result = maskSensitive({
        name: "test",
        count: 42,
        active: true,
        nested: { foo: "bar" },
      })
      expect(result.name).toBe("test")
      expect(result.count).toBe(42)
      expect(result.active).toBe(true)
      expect(result.nested).toEqual({ foo: "bar" })
    })

    it("空对象应返回空对象", () => {
      expect(maskSensitive({})).toEqual({})
    })

    it("应不递归处理嵌套对象中的敏感字段", () => {
      const result = maskSensitive({
        user: { password: "nested-secret" },
      })
      // 嵌套对象中的 password 不被脱敏（仅一层）
      expect(result.user).toEqual({ password: "nested-secret" })
    })
  })
})
