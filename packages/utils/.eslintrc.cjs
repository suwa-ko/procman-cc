/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: "../../.eslintrc.cjs",
  parserOptions: {
    project: "./tsconfig.lint.json",
    tsconfigRootDir: __dirname,
  },
  rules: {
    // R-01: @ps/utils 禁止引用任何其他 @ps/ 包
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["@ps/*"],
            message: "R-01: @ps/utils 是最底层包，禁止引用任何其他 @ps/ 包",
          },
        ],
      },
    ],
  },
}
