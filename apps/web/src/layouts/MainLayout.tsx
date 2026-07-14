/**
 * 主布局 — 侧边栏 + 顶栏 + 内容区。
 */

import {
  AppstoreOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  DollarOutlined,
  TeamOutlined,
  UserOutlined,
  SettingOutlined,
} from "@ant-design/icons"
import type { MenuProps } from "antd"
import { Layout, Menu, theme, Typography } from "antd"
import React, { useMemo } from "react"
import {
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom"

const { Header, Sider, Content } = Layout
const { Text } = Typography

interface MenuItem {
  key: string
  icon: React.ReactNode
  label: string
}

const MENU_ITEMS: MenuItem[] = [
  { key: "/suppliers", icon: <TeamOutlined />, label: "供应商管理" },
  { key: "/contracts", icon: <FileTextOutlined />, label: "合同管理" },
  { key: "/pricings", icon: <DollarOutlined />, label: "定价管理" },
  { key: "/materials", icon: <DatabaseOutlined />, label: "物料管理" },
  { key: "/categories", icon: <AppstoreOutlined />, label: "品类管理" },
  { key: "/templates", icon: <SettingOutlined />, label: "模板管理" },
  { key: "/persons", icon: <UserOutlined />, label: "用户管理" },
]

export const MainLayout: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  const selectedKey = useMemo<string>(() => {
    const match = MENU_ITEMS.find(
      (item) => item.key !== "/" && location.pathname.startsWith(item.key)
    )
    return match?.key ?? "/suppliers"
  }, [location.pathname])

  const menuItems: MenuProps["items"] = MENU_ITEMS.map((item) => ({
    key: item.key,
    icon: item.icon,
    label: item.label,
  }))

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="64"
        width={200}
        style={{ background: colorBgContainer }}
      >
        <div
          style={{
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Text strong style={{ fontSize: 16 }}>
            采购管理系统
          </Text>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => {
            navigate(key)
          }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: "0 24px",
            background: colorBgContainer,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Text type="secondary">采购管理系统 v1.0</Text>
        </Header>
        <Content style={{ margin: 16 }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}
