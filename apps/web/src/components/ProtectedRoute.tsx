/**
 * 路由守卫组件 — 未登录自动跳转到登录页。
 */

import React from "react"
import { Navigate } from "react-router-dom"

const TOKEN_KEY = "purchase_system_token"

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token === null || token === "") {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}
