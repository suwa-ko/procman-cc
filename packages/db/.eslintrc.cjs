/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: "../../.eslintrc.cjs",
  parserOptions: {
    project: "./tsconfig.lint.json",
    tsconfigRootDir: __dirname,
  },
  rules: {
    // R-02/R-03: @ps/db 禁止引用上层包（web-kit）与同层 Node 包（pdf），禁止引用 apps
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["@ps/web-kit", "@ps/pdf", "apps/*"],
            message:
              "R-02/R-03: @ps/db 禁止引用上层包(@ps/web-kit)、同层包(@ps/pdf)或 apps",
          },
        ],
      },
    ],
  },
}
