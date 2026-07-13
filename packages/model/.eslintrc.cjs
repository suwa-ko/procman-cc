/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: "../../.eslintrc.cjs",
  parserOptions: {
    project: "./tsconfig.lint.json",
    tsconfigRootDir: __dirname,
  },
  rules: {
    // @ps/model 仅依赖 zod + @ps/types-base，不能引用上层包
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["@ps/db", "@ps/db/*"],
            message: "@ps/model 禁止引用 @ps/db",
          },
          {
            group: ["@ps/pdf", "@ps/pdf/*"],
            message: "@ps/model 禁止引用 @ps/pdf",
          },
          {
            group: ["@ps/web-kit", "@ps/web-kit/*"],
            message: "@ps/model 禁止引用 @ps/web-kit",
          },
          {
            group: ["@ps/contracts", "@ps/contracts/*"],
            message: "@ps/model 禁止引用 @ps/contracts（上层包，使用 model 替代）",
          },
          {
            group: ["@ps/mock", "@ps/mock/*"],
            message: "@ps/model 禁止引用 @ps/mock（上层包）",
          },
        ],
      },
    ],
  },
}
