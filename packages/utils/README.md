# @ps/utils

> 纯函数工具包 — 编码生成、金额计算、日期格式化、字符串脱敏。零依赖，无副作用。

## 定位

- **层级**：第一层（零内部依赖）
- **运行环境**：universal（浏览器与 Node 均可）
- **依赖**：无任何 `@ps/` 包依赖

## 导出内容

### 编码生成（`code-generator`）

业务编码统一格式：`前缀-年份-4位流水号`。

| 函数           | 说明                                                            |
| -------------- | --------------------------------------------------------------- |
| `generateCode` | 生成编码，如 `generateCode("SUP", 2026, 1)` → `"SUP-2026-0001"` |
| `parseCode`    | 解析编码为 `{ prefix, year, seq }`                              |
| `isValidCode`  | 校验编码合法性                                                  |

合法前缀：`SUP`（供应商）、`MAT`（物料）、`PRC`（定价）、`CTT`（合同）、`TPL`（模板）。

### 金额计算（`money`）

所有金额单位为元（CNY），精度保留两位小数。

| 函数            | 说明                                |
| --------------- | ----------------------------------- |
| `roundTo2`      | 四舍五入到两位小数                  |
| `multiplyPrice` | 单价 × 数量                         |
| `sumMoney`      | 多金额求和                          |
| `isValidMoney`  | 校验金额（非负、有限、精度 ≤ 2 位） |

### 日期格式化（`date`）

基于原生 `Date`，不依赖第三方库。

| 函数         | 说明                                            |
| ------------ | ----------------------------------------------- |
| `formatDate` | 按模式格式化，支持 `YYYY MM DD HH mm ss` 占位符 |
| `toISO`      | 转 ISO 8601 字符串（数据库时间戳）              |
| `fromISO`    | 从 ISO 8601 字符串解析为 `Date`                 |

常量：`DATE_FORMAT`（`YYYY-MM-DD`）、`DATETIME_FORMAT`（`YYYY-MM-DD HH:mm:ss`）。

### 字符串脱敏（`string`）

| 函数             | 说明                                  |
| ---------------- | ------------------------------------- |
| `mask`           | 通用脱敏，保留首尾字符                |
| `maskPhone`      | 手机号脱敏（保留前 3 后 4）           |
| `maskEmail`      | 邮箱脱敏                              |
| `maskIdCard`     | 身份证号脱敏（保留前 6 后 4）         |
| `maskCreditCode` | 统一社会信用代码脱敏（保留前 4 后 4） |
| `truncate`       | 安全截断并添加省略号                  |

## 使用示例

```ts
import { generateCode, multiplyPrice, formatDate, maskPhone } from "@ps/utils"

generateCode("CTT", 2026, 42) // "CTT-2026-0042"
multiplyPrice(12.34, 3) // 37.02
formatDate(new Date(), "YYYY-MM-DD") // "2026-07-09"
maskPhone("13800138000") // "138****8000"
```

## 开发命令

```bash
pnpm --filter @ps/utils build       # 构建
pnpm --filter @ps/utils typecheck   # 类型检查
pnpm --filter @ps/utils test        # 测试
pnpm --filter @ps/utils lint        # lint
```
