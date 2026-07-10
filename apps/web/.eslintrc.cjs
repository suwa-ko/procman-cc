/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: "../../.eslintrc.cjs",
  parserOptions: {
    project: "./tsconfig.lint.json",
    tsconfigRootDir: __dirname,
  },
  rules: {
    // R-04: apps/web 禁止引用 @ps/db、@ps/pdf（Node 专属包）
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["@ps/db", "@ps/db/*"],
            message:
              "R-04: apps/web（browser 包）禁止引用 @ps/db（Node 专属包）",
          },
          {
            group: ["@ps/pdf", "@ps/pdf/*"],
            message:
              "R-04: apps/web（browser 包）禁止引用 @ps/pdf（Node 专属包）",
          },
        ],
      },
    ],
  },
}
