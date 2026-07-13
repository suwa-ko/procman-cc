/**
 * TokenManager — Token 持久化读写
 * 底层使用 localStorage，统一封装以便未来切换存储方案（如 sessionStorage / cookie）
 */

/** 从 localStorage 读取 Token，不存在返回 null */
export function getToken(storageKey: string): string | null {
  try {
    return localStorage.getItem(storageKey)
  } catch {
    // 读取失败（如无痕模式限制），返回 null
    return null
  }
}

/** 将 Token 写入 localStorage */
export function setToken(storageKey: string, token: string): void {
  try {
    localStorage.setItem(storageKey, token)
  } catch {
    // localStorage 写入失败（如无痕模式容量满），静默忽略
    // 不影响用户当前会话体验

  }
}

/** 从 localStorage 删除 Token */
export function removeToken(storageKey: string): void {
  try {
    localStorage.removeItem(storageKey)
  } catch {
    // 删除失败，静默忽略。Token 已从内存中清除（AuthProvider state），
    // 不会影响下次页面加载的安全检查

  }
}
