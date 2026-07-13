/**
 * 认证 Mock 存储，模拟 token 管理
 */

import type { LoginRequest, LoginResponse, RegisterRequest } from "@ps/contracts"

/** 注册用户记录（内部使用） */
interface AuthUser {
  id: string
  username: string
  password: string
  personId: string
  personName: string
}

export class AuthStore {
  private users: Map<string, AuthUser> = new Map()
  private tokens: Map<string, AuthUser> = new Map()
  private idGen: () => string

  constructor(idGen: () => string) {
    this.idGen = idGen
    // 默认管理员账户
    this.users.set("admin", {
      id: "admin-001",
      username: "admin",
      password: "admin123",
      personId: "person-admin-001",
      personName: "系统管理员",
    })
  }

  /** 注册 */
  register(req: RegisterRequest): LoginResponse {
    if (this.users.has(req.username)) {
      throw new Error("用户名已存在")
    }
    const user: AuthUser = {
      id: this.idGen(),
      username: req.username,
      password: req.password,
      personId: req.personId,
      personName: req.username,
    }
    this.users.set(req.username, user)
    return this.generateToken(user)
  }

  /** 登录 */
  login(req: LoginRequest): LoginResponse {
    const user = this.users.get(req.username)
    if (!user || user.password !== req.password) {
      throw new Error("用户名或密码错误")
    }
    return this.generateToken(user)
  }

  /** 清空所有会话数据并重置默认账户 */
  clear(): void {
    this.users.clear()
    this.tokens.clear()
    this.users.set("admin", {
      id: "admin-001",
      username: "admin",
      password: "admin123",
      personId: "person-admin-001",
      personName: "系统管理员",
    })
  }

  private generateToken(user: AuthUser): LoginResponse {
    const token = `mock-token-${user.id}-${Date.now()}`
    this.tokens.set(token, user)
    return {
      token,
      person: {
        id: user.personId,
        name: user.personName,
      },
    }
  }
}
