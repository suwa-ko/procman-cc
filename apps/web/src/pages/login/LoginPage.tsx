/**
 * 登录页 — 用户名 + 密码登录。
 */

import { LockOutlined, UserOutlined } from "@ant-design/icons"
import type { LoginRequest } from "@ps/contracts"
import { Button, Card, Form, Input, message, Typography } from "antd"
import React, { useCallback, useState } from "react"
import { useNavigate } from "react-router-dom"

const { Title } = Typography

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onFinish = useCallback(
    async (values: LoginRequest) => {
      setLoading(true)
      try {
        const resp = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        })
        const data = (await resp.json()) as {
          code: number
          data: { token: string } | null
          message: string
        }
        if (data.code === 0 && data.data !== null) {
          localStorage.setItem("token", data.data.token)
          message.success("登录成功").then(() => {}, () => {})
          navigate("/suppliers")
        } else {
          message.error(data.message || "登录失败").then(() => {}, () => {})
        }
      } catch {
        message.error("网络错误").then(() => {}, () => {})
      } finally {
        setLoading(false)
      }
    },
    [navigate],
  )

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#f5f5f5",
      }}
    >
      <Card style={{ width: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Title level={3}>采购管理系统</Title>
        </div>
        <Form<LoginRequest>
          layout="vertical"
          onFinish={(values) => {
  onFinish(values).catch(() => {})
}}
          autoComplete="off"
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
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
