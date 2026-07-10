/** 编码前缀常量（PRD 1.4 系统编码规则） */
export const CODE_PREFIX = {
  SUPPLIER: "SUP",
  MATERIAL: "MAT",
  PRICE: "PRC",
  CONTRACT: "CTT",
  TEMPLATE: "TPL",
} as const

export type CodePrefix = (typeof CODE_PREFIX)[keyof typeof CODE_PREFIX]
