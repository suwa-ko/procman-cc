/**
 * 主布局 — 毛玻璃侧边栏 + 动效顶栏 + 内容区。
 */

import {
  AppstoreOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  DollarOutlined,
  TeamOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons"
import type { MenuProps } from "antd"
import { Button, Layout, Menu, theme, Typography } from "antd"
import React, { useCallback, useMemo, useRef } from "react"
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
  const { token } = theme.useToken()
  const contentKey = useRef(0)
  contentKey.current += 1

  const selectedKey = useMemo<string>(() => {
    const match = MENU_ITEMS.find(
      (item) => item.key !== "/" && location.pathname.startsWith(item.key),
    )
    return match?.key ?? "/suppliers"
  }, [location.pathname])

  const menuItems: MenuProps["items"] = MENU_ITEMS.map((item, idx) => ({
    key: item.key,
    icon: item.icon,
    label: (
      <span style={{ animationDelay: `${0.1 + idx * 0.05}s` }} className="menu-item-label">
        {item.label}
      </span>
    ),
  }))

  const handleLogout = useCallback(() => {
    localStorage.removeItem("purchase_system_token")
    navigate("/login")
  }, [navigate])

  return (
    <Layout style={{ minHeight: "100vh", background: "transparent" }}>
      {/* ===== 毛玻璃侧边栏 ===== */}
      <Sider
        breakpoint="lg"
        collapsedWidth="64"
        width={220}
        style={{
          background: "rgba(255, 255, 255, 0.55)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          borderRight: "1px solid rgba(255, 255, 255, 0.5)",
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "1px solid rgba(99, 102, 241, 0.1)",
            marginBottom: 8,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <span
            className="logo-gradient"
            style={{ letterSpacing: 1, animation: "gradientShift 6s ease infinite" }}
          >
            采购管理系统
          </span>
        </div>

        {/* 菜单 */}
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          style={{
            background: "transparent",
            borderInlineEnd: "none",
          }}
          onClick={({ key }) => {
            navigate(key)
          }}
        />
      </Sider>

      <Layout style={{ background: "transparent" }}>
        {/* ===== 毛玻璃顶栏 ===== */}
        <Header
          style={{
            padding: "0 24px",
            margin: "12px 12px 0 12px",
            background: "rgba(255, 255, 255, 0.55)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            border: "1px solid rgba(255, 255, 255, 0.5)",
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 16,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* 光轨装饰 */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "-100%",
              width: "60%",
              height: "100%",
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
              animation: "headerGlow 4s ease-in-out infinite",
            }}
          />

          <Text type="secondary" style={{ fontWeight: 500, position: "relative", zIndex: 1 }}>
            采购管理系统 v1.0
          </Text>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={() => {
              handleLogout()
            }}
            style={{ color: token.colorTextSecondary, position: "relative", zIndex: 1 }}
          >
            退出登录
          </Button>
        </Header>

        {/* ===== 毛玻璃内容区 ===== */}
        <Content style={{ margin: "12px 12px 12px 12px" }}>
          <div
            key={contentKey.current}
            className="glass-card"
            style={{
              padding: 24,
              minHeight: 360,
              animation: "fadeInUp 0.4s ease-out",
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}
