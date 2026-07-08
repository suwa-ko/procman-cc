/**
 * 金额计算工具
 * 所有金额单位为元（人民币 CNY），精度保留两位小数
 * 对应 PRD 2.4 定价管理、2.6 合同管理
 */

/** 金额精度：保留两位小数 */
const MONEY_PRECISION = 2

/**
 * 将数值四舍五入到两位小数
 * @example roundTo2(3.14159) // 3.14
 * @example roundTo2(3.145)   // 3.15
 */
export function roundTo2(n: number): number {
  if (!Number.isFinite(n)) {
    throw new Error(`非法的金额数值: ${n}`)
  }
  return Math.round((n + Number.EPSILON) * 100) / 100
}

/**
 * 单价 × 数量，结果保留两位小数
 * @example multiplyPrice(12.34, 3) // 37.02
 */
export function multiplyPrice(price: number, qty: number): number {
  if (!Number.isFinite(price) || price < 0) {
    throw new Error(`非法的单价: ${price}`)
  }
  if (!Number.isFinite(qty) || qty <= 0) {
    throw new Error(`非法的数量: ${qty}`)
  }
  return roundTo2(price * qty)
}

/**
 * 多个金额求和，结果保留两位小数
 * @example sumMoney([1.1, 2.2, 3.3]) // 6.6
 */
export function sumMoney(amounts: number[]): number {
  if (!Array.isArray(amounts) || amounts.length === 0) {
    return 0
  }
  const total = amounts.reduce((acc, n) => {
    if (!Number.isFinite(n) || n < 0) {
      throw new Error(`非法的金额: ${n}`)
    }
    return acc + n
  }, 0)
  return roundTo2(total)
}

/**
 * 校验金额是否合法（非负、有限、精度不超过两位小数）
 */
export function isValidMoney(n: number): boolean {
  if (!Number.isFinite(n) || n < 0) {
    return false
  }
  // 检查精度：乘以 100 后应为整数
  const scaled = n * 100
  return Math.abs(scaled - Math.round(scaled)) < Number.EPSILON
}

export { MONEY_PRECISION }
