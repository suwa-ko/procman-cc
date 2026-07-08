/**
 * 字符串工具 — 脱敏、截断等
 */

/**
 * 脱敏字符串，保留首尾字符，中间用 * 替换
 * @param input 原始字符串
 * @param keepStart 头部保留字符数（默认 1）
 * @param keepEnd 尾部保留字符数（默认 1）
 * @example mask("13800138000", 3, 4) // "138****8000"
 * @example mask("admin@example.com", 2, 4) // "ad****.com"
 */
export function mask(input: string, keepStart = 1, keepEnd = 1): string {
  if (typeof input !== "string" || input.length === 0) {
    return ""
  }
  if (keepStart < 0 || keepEnd < 0) {
    throw new Error("keepStart 和 keepEnd 必须非负")
  }
  if (input.length <= keepStart + keepEnd) {
    // 字符串过短时全部脱敏
    return "*".repeat(input.length)
  }
  const start = input.slice(0, keepStart)
  const end = input.slice(input.length - keepEnd)
  const maskedLength = input.length - keepStart - keepEnd
  return `${start}${"*".repeat(maskedLength)}${end}`
}

/**
 * 脱敏手机号：保留前 3 位和后 4 位
 * @example maskPhone("13800138000") // "138****8000"
 */
export function maskPhone(phone: string): string {
  if (!/^\d{11}$/.test(phone)) {
    throw new Error(`非法的手机号: ${phone}`)
  }
  return mask(phone, 3, 4)
}

/**
 * 脱敏邮箱：保留用户名首字符和域名
 * @example maskEmail("admin@example.com") // "a****@example.com"
 */
export function maskEmail(email: string): string {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error(`非法的邮箱: ${email}`)
  }
  const [user, domain] = email.split("@") as [string, string]
  const maskedUser =
    user.length <= 1 ? "*" : `${user[0]}${"*".repeat(user.length - 1)}`
  return `${maskedUser}@${domain}`
}

/**
 * 脱敏身份证号：保留前 6 位和后 4 位
 * @example maskIdCard("110101199001011234") // "110101********1234"
 */
export function maskIdCard(idCard: string): string {
  if (!/^\d{17}[\dXx]$/.test(idCard)) {
    throw new Error(`非法的身份证号: ${idCard}`)
  }
  return mask(idCard, 6, 4)
}

/**
 * 脱敏统一社会信用代码：保留前 4 位和后 4 位
 * @example maskCreditCode("91110108MA01ABCDXX") // "9110************CDXX"
 */
export function maskCreditCode(code: string): string {
  if (!/^[0-9A-HJ-NPQRTUWXY]{18}$/.test(code)) {
    throw new Error(`非法的统一社会信用代码: ${code}`)
  }
  return mask(code, 4, 4)
}

/**
 * 安全截断字符串，超出长度添加省略号
 * @example truncate("这是一段很长的文本", 5) // "这是一段..."
 */
export function truncate(input: string, maxLen: number): string {
  if (typeof input !== "string") {
    return ""
  }
  if (maxLen < 0) {
    throw new Error("maxLen 必须非负")
  }
  if (input.length <= maxLen) {
    return input
  }
  return `${input.slice(0, maxLen)}...`
}
