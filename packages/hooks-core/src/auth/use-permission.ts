/**
 * usePermission — 权限检查 Hook
 *
 * 基于当前登录用户的 roles 字段，检查是否拥有指定角色。
 * 支持「任一角色」与「全部角色」两种匹配模式。
 */

import { useMemo } from "react"

import { useAuth } from "./use-auth"

/**
 * 权限检查 Hook。
 *
 * @param allowedRoles - 允许的角色列表
 * @param mode          - "any"（拥有任一角色即通过）| "all"（必须拥有全部角色）
 * @returns hasPermission 为 true 时当前用户拥有所需权限
 *
 * 用法：
 * ```tsx
 * const { hasPermission } = usePermission(["admin", "manager"])
 * if (!hasPermission) return <Forbidden />
 * ```
 */
export function usePermission(
  allowedRoles: readonly string[],
  mode: "any" | "all" = "any"
): { readonly hasPermission: boolean } {
  const { user, isLoading } = useAuth()

  const hasPermission = useMemo(() => {
    if (isLoading || user === null) {
      return false
    }
    if (allowedRoles.length === 0) {
      return true
    }
    if (mode === "any") {
      return allowedRoles.some((role) => user.roles.includes(role))
    }
    return allowedRoles.every((role) => user.roles.includes(role))
  }, [user, isLoading, allowedRoles, mode])

  return { hasPermission }
}
