/**
 * 根组件 — React Router 路由配置 + AppProvider DI 接线。
 */

import { AppProvider } from "@ps/antd-kit"
import { loadConfig } from "@ps/env-config"
import { getHttpClient } from "@ps/web-kit"
import { ConfigProvider } from "antd"
import zhCN from "antd/locale/zh_CN"
import React from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"


import { MainLayout } from "./layouts/MainLayout"
import { CategoryPage } from "./pages/category/CategoryPage"
import { ContractPage } from "./pages/contract/ContractPage"
import { LoginPage } from "./pages/login/LoginPage"
import { MaterialPage } from "./pages/material/MaterialPage"
import { PersonPage } from "./pages/person/PersonPage"
import { PricingPage } from "./pages/pricing/PricingPage"
import { SupplierPage } from "./pages/supplier/SupplierPage"
import { TemplatePage } from "./pages/template/TemplatePage"

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
        environment={{ mode: "mock" as const, apiBaseUrl: config.apiBaseUrl }}
      >
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<MainLayout />}>
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
        </BrowserRouter>
      </AppProvider>
    </ConfigProvider>
  )
}
