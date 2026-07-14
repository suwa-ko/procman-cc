import { describe, expect, it } from "vitest"
import { z } from "zod"

import {
  compileTemplate,
  PdfValidationError,
  renderTemplate,
  validateData,
} from "../src/index"
import { buildHtmlDocument, loadDefaultTemplate } from "../src/renderer"

// ============================================================
// 场景一：纯变量替换
// ============================================================
describe("场景一：纯变量替换", () => {
  const schema = z.object({
    name: z.string().min(1),
    amount: z.number().positive(),
    date: z.string(),
  })

  const template = `<p>甲方：{{name}}</p><p>金额：{{currency amount}}</p><p>日期：{{date date}}</p>`

  it("✅ 通过 — 合法数据渲染成功", () => {
    const data = { name: "测试公司", amount: 50000, date: "2025-06-15" }

    // Schema 校验通过
    const validated = validateData(schema, data)
    expect(validated.name).toBe("测试公司")

    // Handlebars 渲染
    const html = renderTemplate(template, validated)
    expect(html).toContain("甲方：测试公司")
    expect(html).toContain("¥50000.00")
    expect(html).toContain("2025-06-15")
  })

  it("❌ 失败 — name 为空字符串应被拒绝", () => {
    const data = { name: "", amount: 50000, date: "2025-06-15" }

    expect(() => validateData(schema, data)).toThrow(PdfValidationError)
  })

  it("❌ 失败 — amount 为 0 应被拒绝", () => {
    const data = { name: "测试公司", amount: 0, date: "2025-06-15" }

    expect(() => validateData(schema, data)).toThrow(PdfValidationError)
  })

  it("✅ 通过 — 重复编译模板函数复用正确", () => {
    const compiled = compileTemplate("<h1>{{name}}</h1>")

    expect(compiled({ name: "A" })).toBe("<h1>A</h1>")
    expect(compiled({ name: "B" })).toBe("<h1>B</h1>")
  })
})

// ============================================================
// 场景二：含条件判断（{{#if}} / {{#unless}}）
// ============================================================
describe("场景二：含条件判断", () => {
  const schema = z.object({
    contract: z.object({
      code: z.string(),
      isSealed: z.boolean(),
    }),
  })

  const template = `<p>合同编号：{{contract.code}}</p>
{{#if contract.isSealed}}
<p class="status">状态：已签章生效</p>
{{else}}
<p class="status">状态：待签章</p>
{{/if}}`

  it("✅ 通过 — isSealed=true 渲染「已签章生效」", () => {
    const data = { contract: { code: "CTT-2026-0001", isSealed: true } }

    validateData(schema, data)
    const html = renderTemplate(template, data)

    expect(html).toContain("状态：已签章生效")
    expect(html).not.toContain("状态：待签章")
  })

  it("✅ 通过 — isSealed=false 渲染「待签章」", () => {
    const data = { contract: { code: "CTT-2026-0002", isSealed: false } }

    validateData(schema, data)
    const html = renderTemplate(template, data)

    expect(html).toContain("状态：待签章")
    expect(html).not.toContain("状态：已签章生效")
  })

  it("❌ 失败 — 缺少 isSealed 字段被 Schema 拒绝", () => {
    const data = { contract: { code: "CTT-2026-0003" } }

    expect(() => validateData(schema, data)).toThrow(PdfValidationError)
  })

  it("❌ 失败 — isSealed 类型错误被 Schema 拒绝", () => {
    const data = { contract: { code: "CTT-2026-0004", isSealed: "yes" } }

    expect(() => validateData(schema, data)).toThrow(PdfValidationError)
  })

  it("✅ 通过 — PdfValidationError 包含具体错误信息", () => {
    const data = { contract: { code: "CTT-2026-0003" } }

    try {
      validateData(schema, data)
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(PdfValidationError)
      if (error instanceof PdfValidationError) {
        expect(error.issues.length).toBeGreaterThan(0)
        expect(error.message).toContain("数据校验失败")
      }
    }
  })
})

// ============================================================
// 场景三：含列表循环（{{#each}}）
// ============================================================
describe("场景三：含列表循环", () => {
  const entrySchema = z.object({
    name: z.string().min(1),
    price: z.number().positive(),
    qty: z.number().int().positive(),
  })

  const schema = z.object({
    items: z.array(entrySchema).min(1),
  })

  const template = `<ul>
{{#each items}}
<li>{{name}} × {{qty}} = {{currency price}}</li>
{{/each}}
</ul>`

  it("✅ 通过 — 3 条数据正确渲染列表", () => {
    const data = {
      items: [
        { name: "CPU", price: 3200, qty: 10 },
        { name: "内存条", price: 450, qty: 20 },
        { name: "硬盘", price: 800, qty: 5 },
      ],
    }

    validateData(schema, data)
    const html = renderTemplate(template, data)

    expect(html).toContain("CPU × 10 = ¥3200.00")
    expect(html).toContain("内存条 × 20 = ¥450.00")
    expect(html).toContain("硬盘 × 5 = ¥800.00")

    // 应有恰好 3 个 <li>
    const matches = html.match(/<li>/g)
    expect(matches).toHaveLength(3)
  })

  it("✅ 通过 — 单条数据也正常渲染", () => {
    const data = { items: [{ name: "网卡", price: 120, qty: 1 }] }

    validateData(schema, data)
    const html = renderTemplate(template, data)

    expect(html).toContain("网卡 × 1 = ¥120.00")
    const matches = html.match(/<li>/g)
    expect(matches).toHaveLength(1)
  })

  it("❌ 失败 — 空数组被 Schema 拒绝", () => {
    const data = { items: [] }

    expect(() => validateData(schema, data)).toThrow(PdfValidationError)
  })

  it("❌ 失败 — price 为负数被 Schema 拒绝", () => {
    const data = { items: [{ name: "CPU", price: -100, qty: 1 }] }

    expect(() => validateData(schema, data)).toThrow(PdfValidationError)
  })

  it("✅ 通过 — 循环中使用 @index", () => {
    const templateWithIndex = `<ol>
{{#each items}}
<li>#{{inc @index}} {{name}}</li>
{{/each}}
</ol>`

    const data = {
      items: [{ name: "A" }, { name: "B" }, { name: "C" }],
    }

    const indexSchema = z.object({
      items: z.array(z.object({ name: z.string() })),
    })

    validateData(indexSchema, data)
    const html = renderTemplate(templateWithIndex, data)

    expect(html).toContain("#1 A")
    expect(html).toContain("#2 B")
    expect(html).toContain("#3 C")
  })
})

// ============================================================
// 辅助功能测试（保留）
// ============================================================
describe("auxiliary", () => {
  it("buildHtmlDocument 生成完整 HTML 文档 + 水印", () => {
    const result = buildHtmlDocument("<p>Test</p>", "DRAFT")
    expect(result).toContain("<!DOCTYPE html>")
    expect(result).toContain("<p>Test</p>")
    expect(result).toContain('content: "DRAFT"')
  })

  it("buildHtmlDocument 使用默认水印", () => {
    const result = buildHtmlDocument("<p>Hi</p>")
    expect(result).toContain('content: "CONFIDENTIAL"')
  })

  it("loadDefaultTemplate 加载 NDA 模板", async () => {
    const html = await loadDefaultTemplate("nda.default")
    expect(html).toContain("保密协议")
    expect(html).toContain("{{contract.code}}")
  })

  it("loadDefaultTemplate 加载采购合同模板", async () => {
    const html = await loadDefaultTemplate("purchase.default")
    expect(html).toContain("多物品采购合同")
    expect(html).toContain("{{#each contract.entries}}")
  })
})
