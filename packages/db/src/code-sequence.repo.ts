import type { DbClient } from "./core/types"

/**
 * 编码流水号仓储。
 * 跨实体表查询当前年份某前缀下的最大流水号，用于全局唯一编码生成。
 * 不继承 BaseRepository（跨表操作，非单表 CRUD）。
 */
export class CodeSequenceRepo {
  private readonly client: DbClient

  public constructor(client: DbClient) {
    this.client = client
  }

  /**
   * 获取指定表、指定前缀、指定年份的下一个可用流水号。
   *
   * 编码格式：PREFIX-YYYY-0001
   * 查询逻辑：SELECT 当前年份下以 prefix 开头的最大 code，取流水号 +1
   *
   * @param table - 数据库表名（如 "suppliers"、"pricings"、"contracts"）
   * @param prefix - 编码前缀（如 "PRC"、"CTT"）
   * @param year - 年份（4 位数字，如 2026）
   */
  public async getNextSequence(
    table: string,
    prefix: string,
    year: number
  ): Promise<number> {
    const codePrefix = `${prefix}-${year}-`
    const { data, error } = await this.client.supabase
      .from(table)
      .select("code")
      .like("code", `${codePrefix}%`)
      .order("code", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      this.client.logger.error("查询最大编码失败", {
        table,
        prefix,
        year,
        error: error.message,
      })
      throw error
    }

    if (data === null || data === undefined || typeof data !== "object") {
      return 1
    }

    const row = data as Record<string, unknown>
    const maxCode = typeof row.code === "string" ? row.code : ""

    if (maxCode.length === 0 || !maxCode.startsWith(codePrefix)) {
      return 1
    }

    const seqStr = maxCode.slice(codePrefix.length)
    const seq = Number.parseInt(seqStr, 10)

    if (Number.isNaN(seq) || seq < 1) {
      return 1
    }

    return seq + 1
  }
}
