/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: "../../.eslintrc.cjs",
  parserOptions: {
    project: "./tsconfig.lint.json",
    tsconfigRootDir: __dirname,
  },
  rules: {
    // apps/api 可引用所有合法下层包，禁止引用 apps/web
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["@ps/web-kit", "@ps/web-kit/*"],
            message:
              "apps/api（Node 服务端）禁止引用 @ps/web-kit（browser 包）",
          },
        ],
      },
    ],
  },
}
