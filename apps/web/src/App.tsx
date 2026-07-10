/**
 * 根组件 — 应用启动界面。
 * 后续迭代接入 React Router 与业务页面路由。
 */

import type { FC } from "react"

export const App: FC = () => {
  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>采购管理系统</h1>
      <p>应用已启动 — DI 接线完成。</p>
    </div>
  )
}
