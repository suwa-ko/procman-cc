import { faker } from "@faker-js/faker"
import type { CategoryDTO, CategoryTreeNode } from "@ps/contracts"

import { fakeCode, fakeId } from "./helpers"

/**
 * 创建单个品类 mock 数据
 * @param overrides 覆盖字段
 */
export function createCategory(overrides?: Partial<CategoryDTO>): CategoryDTO {
  const id = fakeId()
  return {
    id,
    code: fakeCode("CAT"),
    name: faker.commerce.department(),
    parentId: null,
    sortOrder: faker.number.int({ min: 1, max: 100 }),
    ...overrides,
  }
}

/**
 * 创建品类树节点（包含 children）
 * @param overrides 覆盖字段
 */
export function createCategoryTreeNode(
  overrides?: Partial<CategoryTreeNode>
): CategoryTreeNode {
  return {
    id: fakeId(),
    code: fakeCode("CAT"),
    name: faker.commerce.department(),
    parentId: null,
    sortOrder: faker.number.int({ min: 1, max: 100 }),
    children: [],
    ...overrides,
  }
}

/**
 * 创建品类列表
 * @param count 数量
 * @param overrides 覆盖字段
 */
export function createCategoryList(
  count: number,
  overrides?: Partial<CategoryDTO>
): CategoryDTO[] {
  return Array.from({ length: count }, () => createCategory(overrides))
}

/**
 * 创建品类树结构（按 parentId 层级构建）
 * @param depth 树深度
 * @param childrenPerNode 每节点子节点数
 */
export function createCategoryTree(
  depth: number,
  childrenPerNode: number
): CategoryTreeNode[] {
  function buildLevel(
    parentId: string | null,
    level: number
  ): CategoryTreeNode[] {
    if (level > depth) {
      return []
    }
    return Array.from({ length: childrenPerNode }, () => {
      const node = createCategoryTreeNode({ parentId })
      node.children = buildLevel(node.id, level + 1)
      return node
    })
  }
  return buildLevel(null, 1)
}
