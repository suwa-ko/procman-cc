/**
 * 登录页 — 毛玻璃卡片 + 渐变背景。
 * 使用 @ps/web-kit HttpClient 统一请求（不直接调用 fetch）。
 */

import { LockOutlined, UserOutlined } from "@ant-design/icons"
import type { LoginRequest } from "@ps/contracts"
import { getHttpClient } from "@ps/web-kit"
import { Button, Card, Form, Input, message, Typography } from "antd"
import React, { useCallback, useState } from "react"
import { useNavigate } from "react-router-dom"

const { Title, Text } = Typography

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onFinish = useCallback(
    async (values: LoginRequest) => {
      setLoading(true)
      try {
        const httpClient = getHttpClient()
        const data = await httpClient.post<{
          token: string
          user: unknown
        }>("/api/auth/login", values)
        localStorage.setItem("purchase_system_token", data.token)
        message.success("登录成功").then(() => {}, () => {})
        navigate("/suppliers")
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "网络错误"
        message.error(msg).then(() => {}, () => {})
      } finally {
        setLoading(false)
      }
    },
    [navigate]
  )

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #e8eaf6 0%, #f3e5f5 30%, #e0f2f1 60%, #e3f2fd 100%)",
        backgroundSize: "400% 400%",
        animation: "gradientShift 20s ease infinite",
      }}
    >
      {/* 装饰光斑 — 带浮动动画 */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "15%",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
          animation: "floatUpDown 6s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          right: "10%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
          animation: "floatUpDown 8s ease-in-out infinite reverse",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "60%",
          left: "60%",
          width: 200,
          height: 200,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
          animation: "floatUpDown 7s ease-in-out infinite 2s",
        }}
      />

      <Card
        style={{
          width: 420,
          background: "rgba(255, 255, 255, 0.72)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          border: "1px solid rgba(255, 255, 255, 0.5)",
          borderRadius: 24,
          boxShadow:
            "0 24px 64px rgba(99, 102, 241, 0.12), 0 4px 16px rgba(0, 0, 0, 0.06)",
          animation: "scaleIn 0.5s ease-out",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
        }}
        bodyStyle={{ padding: 36 }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Title
            level={2}
            style={{
              marginBottom: 4,
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 700,
            }}
          >
            采购管理系统
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Purchase Management System
          </Text>
        </div>

        <Form<LoginRequest>
          layout="vertical"
          onFinish={(values) => {
            onFinish(values).catch(() => {})
          }}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="admin@example.com" />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              style={{
                height: 44,
                borderRadius: 12,
                fontWeight: 600,
                fontSize: 15,
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                border: "none",
              }}
            >
              登 录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
