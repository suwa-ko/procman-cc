/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: "../../.eslintrc.cjs",
  parserOptions: {
    project: "./tsconfig.lint.json",
    tsconfigRootDir: __dirname,
  },
  rules: {
    // R-02: @ps/mock 只能引用 @ps/contracts、@ps/types-base，不能引用 db/pdf/web-kit/apps
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["@ps/db", "@ps/db/*"],
            message: "R-02: @ps/mock 禁止引用 @ps/db",
          },
          {
            group: ["@ps/pdf", "@ps/pdf/*"],
            message: "R-02: @ps/mock 禁止引用 @ps/pdf",
          },
          {
            group: ["@ps/web-kit", "@ps/web-kit/*"],
            message: "R-02: @ps/mock 禁止引用 @ps/web-kit",
          },
        ],
      },
    ],
  },
}
