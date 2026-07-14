/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: "../../.eslintrc.cjs",
  parserOptions: {
    project: "./tsconfig.lint.json",
    tsconfigRootDir: __dirname,
  },
  rules: {
    // R-03: 前端包禁止引用 Node 专属包
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["@ps/db", "@ps/pdf", "apps/*"],
            message:
              "R-03: @ps/antd-kit 禁止引用 Node 专属包(@ps/db、@ps/pdf)或 apps",
          },
        ],
      },
    ],
    // R-06: 前端包禁止使用 Node.js 全局变量
    "no-restricted-globals": ["error", "process", "Buffer", "global"],
  },
}
