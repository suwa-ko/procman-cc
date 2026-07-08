/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: "../../.eslintrc.cjs",
  parserOptions: {
    project: "./tsconfig.lint.json",
    tsconfigRootDir: __dirname,
  },
  rules: {
    // R-01 + R-07: @ps/log 禁止引用任何其他 @ps/ 包（特别是 @ps/env-config）
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["@ps/*"],
            message:
              "R-01/R-07: @ps/log 是最底层包，禁止引用任何其他 @ps/ 包（含 @ps/env-config）",
          },
        ],
      },
    ],
    // @ps/log 的 ConsoleTransport 需要调用 console.debug/info/warn/error
    "no-console": "off",
  },
}
