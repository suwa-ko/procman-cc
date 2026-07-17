/**
 * 根组件 — React Router 路由配置 + AppProvider DI 接线 + 路由守卫。
 */

import { AppProvider } from "@ps/antd-kit"
import { loadConfig } from "@ps/env-config"
import { getHttpClient } from "@ps/web-kit"
import { App as AntdApp, ConfigProvider, theme } from "antd"
import zhCN from "antd/locale/zh_CN"
import React, { lazy, Suspense } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import { ProtectedRoute } from "./components/ProtectedRoute"
import { MainLayout } from "./layouts/MainLayout"
import "./styles/global.css"

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

const CUSTOM_THEME: theme.ThemeConfig = {
  token: {
    colorPrimary: "#6366f1",
    colorInfo: "#6366f1",
    colorSuccess: "#10b981",
    colorWarning: "#f59e0b",
    colorError: "#ef4444",
    borderRadius: 12,
    borderRadiusLG: 16,
    borderRadiusSM: 8,
    fontFamily:
      `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Microsoft YaHei", sans-serif`,
    colorBgContainer: "rgba(255, 255, 255, 0.72)",
    colorBorder: "rgba(99, 102, 241, 0.12)",
    colorBorderSecondary: "rgba(99, 102, 241, 0.08)",
    boxShadow:
      "0 8px 24px rgba(99, 102, 241, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)",
    boxShadowSecondary:
      "0 4px 12px rgba(0, 0, 0, 0.04)",
  },
  components: {
    Button: {
      borderRadius: 10,
      borderRadiusLG: 14,
      borderRadiusSM: 8,
      controlHeight: 36,
      fontWeight: 500,
    },
    Input: {
      borderRadius: 10,
      borderRadiusLG: 14,
      colorBgContainer: "rgba(255, 255, 255, 0.55)",
    },
    InputNumber: {
      borderRadius: 10,
      colorBgContainer: "rgba(255, 255, 255, 0.55)",
    },
    Select: {
      borderRadius: 10,
      borderRadiusLG: 14,
      colorBgContainer: "rgba(255, 255, 255, 0.55)",
    },
    DatePicker: {
      borderRadius: 10,
      colorBgContainer: "rgba(255, 255, 255, 0.55)",
    },
    Table: {
      borderRadius: 16,
      borderRadiusLG: 16,
      headerBg: "rgba(99, 102, 241, 0.04)",
      headerColor: "#4338ca",
      headerSplitColor: "rgba(99, 102, 241, 0.12)",
      rowHoverBg: "rgba(99, 102, 241, 0.03)",
      rowSelectedBg: "rgba(99, 102, 241, 0.06)",
      cellPaddingInline: 16,
      cellPaddingBlock: 12,
    },
    Menu: {
      itemBorderRadius: 10,
      itemMarginInline: 8,
      itemHeight: 40,
      iconSize: 18,
      collapsedIconSize: 18,
      itemHoverBg: "rgba(99, 102, 241, 0.06)",
      itemSelectedBg: "rgba(99, 102, 241, 0.1)",
      itemSelectedColor: "#4f46e5",
    },
    Card: {
      borderRadiusLG: 20,
      paddingLG: 28,
    },
    Tag: {
      borderRadiusSM: 8,
    },
    Layout: {
      siderBg: "transparent",
      headerBg: "transparent",
      bodyBg: "transparent",
      triggerBg: "rgba(255, 255, 255, 0.45)",
      triggerColor: "#6366f1",
    },
    Tabs: {
      itemSelectedColor: "#4f46e5",
      inkBarColor: "#6366f1",
      itemHoverColor: "#818cf8",
    },
    Steps: {
      colorPrimary: "#6366f1",
      colorTextDescription: "#9ca3af",
    },
  },
}

export const App: React.FC = () => {
  const httpClient = getHttpClient()
  const config = loadConfig()

  if (httpClient === undefined) {
    return <div>初始化中...</div>
  }

  return (
    <ConfigProvider locale={zhCN} theme={CUSTOM_THEME}>
      <AntdApp>
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
      </AntdApp>
    </ConfigProvider>
  )
}
