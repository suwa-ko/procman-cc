/**
 * 品类 Mock 存储，支持树结构查询
 */

import type { CategoryDTO, CategoryTreeNode } from "@ps/contracts"

import { BaseMockStore } from "./base.store"

export class CategoryStore extends BaseMockStore<CategoryDTO> {
  constructor(idGen: () => string) {
    super("category", idGen)
  }

  /** 获取品类树 */
  getTree(): CategoryTreeNode[] {
    const all = this.getAll()
    const nodeMap = new Map<string, CategoryTreeNode>()

    // 先创建所有节点
    for (const cat of all) {
      nodeMap.set(cat.id, {
        ...cat,
        parentId: cat.parentId ?? null,
        children: [],
      })
    }

    const roots: CategoryTreeNode[] = []
    for (const cat of all) {
      const node = nodeMap.get(cat.id)
      if (!node) {
        continue
      }
      if (cat.parentId) {
        const parent = nodeMap.get(cat.parentId)
        if (parent) {
          parent.children.push(node)
        } else {
          roots.push(node)
        }
      } else {
        roots.push(node)
      }
    }

    return roots
  }
}
