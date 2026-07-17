/**
 * 根组件 — React Router 路由配置 + AppProvider DI 接线 + 路由守卫。
 */

import { AppProvider } from "@ps/antd-kit"
import { loadConfig } from "@ps/env-config"
import { getHttpClient } from "@ps/web-kit"
import { ConfigProvider } from "antd"
import zhCN from "antd/locale/zh_CN"
import React, { lazy, Suspense } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import { ProtectedRoute } from "./components/ProtectedRoute"
import { MainLayout } from "./layouts/MainLayout"

// 懒加载页面组件（代码分割，减少首屏体积）
const LoginPage = lazy(() =>
  import("./pages/login/LoginPage").then((m) => ({ default: m.LoginPage }))
)
const SupplierPage = lazy(() =>
  import("./pages/supplier/SupplierPage").then((m) => ({
    default: m.SupplierPage,
  }))
)
const ContractPage = lazy(() =>
  import("./pages/contract/ContractPage").then((m) => ({
    default: m.ContractPage,
  }))
)
const PricingPage = lazy(() =>
  import("./pages/pricing/PricingPage").then((m) => ({
    default: m.PricingPage,
  }))
)
const MaterialPage = lazy(() =>
  import("./pages/material/MaterialPage").then((m) => ({
    default: m.MaterialPage,
  }))
)
const CategoryPage = lazy(() =>
  import("./pages/category/CategoryPage").then((m) => ({
    default: m.CategoryPage,
  }))
)
const TemplatePage = lazy(() =>
  import("./pages/template/TemplatePage").then((m) => ({
    default: m.TemplatePage,
  }))
)
const PersonPage = lazy(() =>
  import("./pages/person/PersonPage").then((m) => ({
    default: m.PersonPage,
  }))
)

const PageLoader: React.FC = () =>
  <div style={{ padding: 24, textAlign: "center" }}>加载中...</div>


export const App: React.FC = () => {
  const httpClient = getHttpClient()
  const config = loadConfig()

  if (httpClient === undefined) {
    return <div>初始化中...</div>
  }

  return (
    <ConfigProvider locale={zhCN}>
      <AppProvider
        httpClient={httpClient}
        environment={{ mode: config.env, apiBaseUrl: config.apiBaseUrl }}
      >
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/suppliers" replace />} />
                <Route path="suppliers" element={<SupplierPage />} />
                <Route path="contracts" element={<ContractPage />} />
                <Route path="pricings" element={<PricingPage />} />
                <Route path="materials" element={<MaterialPage />} />
                <Route path="categories" element={<CategoryPage />} />
                <Route path="templates" element={<TemplatePage />} />
                <Route path="persons" element={<PersonPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AppProvider>
    </ConfigProvider>
  )
}
