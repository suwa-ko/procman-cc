import type { UpdateContractInput } from "@ps/contracts"
import { ContractStatus } from "@ps/contracts"
import type {
  CodeSequenceRepo,
  ContractEntryRepo,
  ContractRepo,
  ContractRow,
} from "@ps/db"

/**
 * 业务层错误：合同操作被拒绝。
 */
export class ContractServiceError extends Error {
  public readonly code: string

  public constructor(code: string, message: string) {
    super(message)
    this.name = "ContractServiceError"
    this.code = code
  }
}

/**
 * 合同服务。
 *
 * 业务规则：
 * - 合同生效后，合同主表、content 及采购条目全部锁定，不可编辑
 * - 锁定检查：任何更新操作前，先查询当前状态，若为 Effective/Archived/Void 则拒绝
 * - 状态流转：Draft → Effective（确认生效），Effective → Draft（退回草稿），
 *   Effective → Void（作废），Effective → Archived（归档）
 */
export class ContractService {
  /**
   * 锁定状态集合：不可编辑的状态。
   * 草稿状态可编辑，其余状态均不可编辑。
   */
  private static readonly LOCKED_STATUSES: readonly string[] = [
    ContractStatus.Effective,
    ContractStatus.Archived,
    ContractStatus.Void,
  ]

  private readonly contractRepo: ContractRepo
  private readonly entryRepo: ContractEntryRepo
  private readonly codeRepo: CodeSequenceRepo

  public constructor(
    contractRepo: ContractRepo,
    entryRepo: ContractEntryRepo,
    codeRepo: CodeSequenceRepo
  ) {
    this.contractRepo = contractRepo
    this.entryRepo = entryRepo
    this.codeRepo = codeRepo
  }

  /**
   * 更新合同。
   * 先检查合同是否被锁定，锁定则拒绝；否则执行更新。
   *
   * @throws ContractServiceError 当合同已锁定
   */
  public async update(
    id: string,
    data: UpdateContractInput
  ): Promise<ContractRow | null> {
    const contract = await this.getOrThrow(id)
    this.assertNotLocked(contract)

    return this.contractRepo.update(id, data)
  }

  /**
   * 确认生效 — 将合同从 Draft 变为 Effective。
   * 生效后合同数据将被锁定。
   */
  public async activate(id: string): Promise<ContractRow | null> {
    const contract = await this.getOrThrow(id)

    if (contract.status !== ContractStatus.Draft) {
      throw new ContractServiceError(
        "CONTRACT_NOT_DRAFT",
        "只有草稿状态的合同可确认生效"
      )
    }

    return this.contractRepo.update(id, {
      status: ContractStatus.Effective,
    })
  }

  /**
   * 退回草稿 — 将已生效合同退回 Draft，允许重新编辑。
   */
  public async returnToDraft(id: string): Promise<ContractRow | null> {
    const contract = await this.getOrThrow(id)

    if (contract.status !== ContractStatus.Effective) {
      throw new ContractServiceError(
        "CONTRACT_NOT_EFFECTIVE",
        "只有已生效的合同可退回草稿"
      )
    }

    return this.contractRepo.update(id, {
      status: ContractStatus.Draft,
    })
  }

  /**
   * 作废 — 不可逆操作，作废后仅可查看。
   */
  public async voidContract(id: string): Promise<ContractRow | null> {
    const contract = await this.getOrThrow(id)

    if (
      contract.status === ContractStatus.Void ||
      contract.status === ContractStatus.Archived
    ) {
      throw new ContractServiceError(
        "CONTRACT_TERMINAL",
        "已作废或已归档的合同不可再次作废"
      )
    }

    return this.contractRepo.update(id, {
      status: ContractStatus.Void,
    })
  }

  /**
   * 检查合同是否被锁定（非草稿状态不可编辑）。
   * 锁定则抛出 ContractServiceError。
   */
  public async checkEditable(id: string): Promise<ContractRow> {
    const contract = await this.getOrThrow(id)
    this.assertNotLocked(contract)
    return contract
  }

  // ========================================
  // private helpers
  // ========================================

  /**
   * 按 ID 查询合同，不存在则抛出错误。
   */
  private async getOrThrow(id: string): Promise<ContractRow> {
    const contract = await this.contractRepo.findById(id)
    if (contract === null) {
      throw new ContractServiceError(
        "CONTRACT_NOT_FOUND",
        "合同不存在"
      )
    }
    return contract
  }

  /**
   * 断言合同未被锁定，锁定则抛出错误。
   */
  private assertNotLocked(contract: ContractRow): void {
    if (
      ContractService.LOCKED_STATUSES.includes(contract.status)
    ) {
      throw new ContractServiceError(
        "CONTRACT_LOCKED",
        `合同 ${contract.code} 当前状态为「${contract.status}」，不可编辑`
      )
    }
  }
}
