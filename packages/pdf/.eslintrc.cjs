/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: "../../.eslintrc.cjs",
  parserOptions: {
    project: "./tsconfig.lint.json",
    tsconfigRootDir: __dirname,
  },
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["@ps/db"],
            message:
              "R-08: @ps/pdf 禁止引用 @ps/db，数据由调用方 apps/api 注入",
          },
        ],
      },
    ],
  },
}
