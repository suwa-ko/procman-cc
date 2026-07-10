/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: "../../.eslintrc.cjs",
  parserOptions: {
    project: "./tsconfig.lint.json",
    tsconfigRootDir: __dirname,
  },
  rules: {
    // R-02: @ps/contracts 只能引用 @ps/types-base，不能引用 db/pdf/web-kit/apps
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["@ps/db", "@ps/db/*"],
            message: "R-02: @ps/contracts 禁止引用 @ps/db",
          },
          {
            group: ["@ps/pdf", "@ps/pdf/*"],
            message: "R-02: @ps/contracts 禁止引用 @ps/pdf",
          },
          {
            group: ["@ps/web-kit", "@ps/web-kit/*"],
            message: "R-02: @ps/contracts 禁止引用 @ps/web-kit",
          },
          {
            group: ["@ps/mock", "@ps/mock/*"],
            message: "R-02: @ps/contracts 禁止引用 @ps/mock（逆向依赖）",
          },
        ],
      },
    ],
  },
}
