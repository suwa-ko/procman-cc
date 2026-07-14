/**
 * 根 ESLint 配置
 * 严格代码风格约束 — 防止 AI 写出不规范、依赖反转、跨层引用代码
 *
 * 依赖方向强制规则（R-01 ~ R-07）在各 package 的 .eslintrc.cjs 中通过
 * no-restricted-paths 配置实现
 */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "import"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier",
  ],
  rules: {
    // ============================================================
    // TypeScript 严格规则
    // ============================================================

    // 禁止 any 类型（铁则）
    "@typescript-eslint/no-explicit-any": "error",
    // 禁止将 any 赋值给其他类型
    "@typescript-eslint/no-unsafe-assignment": "error",
    // 禁止调用 any 类型的成员
    "@typescript-eslint/no-unsafe-member-access": "error",
    // 禁止调用 any 类型的函数
    "@typescript-eslint/no-unsafe-call": "error",
    // 禁止将 any 作为返回值
    "@typescript-eslint/no-unsafe-return": "error",
    // 禁止将 any 作为参数
    "@typescript-eslint/no-unsafe-argument": "error",
    // 未使用变量报错（下划线前缀豁免）
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
    // 类型导入与值导入分离
    "@typescript-eslint/consistent-type-imports": [
      "error",
      { prefer: "type-imports", fixStyle: "separate-type-imports" },
    ],
    // 导出函数必须显式返回类型
    "@typescript-eslint/explicit-function-return-type": [
      "error",
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
      },
    ],
    // 导出函数的参数必须显式类型（含回调）
    "@typescript-eslint/explicit-module-boundary-types": "error",
    // 禁止不安全的断言（as）
    "@typescript-eslint/consistent-type-assertions": [
      "error",
      { assertionStyle: "as", objectLiteralTypeAssertions: "never" },
    ],
    // 禁止非空断言（!）— 强制处理 null/undefined
    "@typescript-eslint/no-non-null-assertion": "error",
    // 禁止无意义的类型断言
    "@typescript-eslint/no-confusing-non-null-assertion": "error",
    // 禁止无意义的 void 运算符
    "@typescript-eslint/no-useless-constructor": "error",
    // 禁止重复的类成员
    "@typescript-eslint/no-dupe-class-members": "error",
    // 禁止不必要的可选链（如 a?.b.c 当 a 不可能为 null）
    "@typescript-eslint/no-unnecessary-condition": "off", // 误报较多，暂关闭
    // 禁止不必要的类型参数
    "@typescript-eslint/no-unnecessary-type-arguments": "error",
    // 禁止不必要的类型断言
    "@typescript-eslint/no-unnecessary-type-assertion": "error",
    // 强制数组使用 T[] 而非 Array<T>
    "@typescript-eslint/array-type": [
      "error",
      { default: "array", readonly: "array" },
    ],
    // 强制使用一致的方法签名顺序
    "@typescript-eslint/method-signature-style": "error",
    // 强制类的成员排序：static > abstract > 实例
    "@typescript-eslint/member-ordering": [
      "error",
      {
        default: [
          "public-static-field",
          "protected-static-field",
          "private-static-field",
          "public-static-method",
          "protected-static-method",
          "private-static-method",
          "public-instance-field",
          "protected-instance-field",
          "private-instance-field",
          "public-constructor",
          "protected-constructor",
          "private-constructor",
          "public-instance-method",
          "protected-instance-method",
          "private-instance-method",
        ],
      },
    ],
    // 强制使用 interface 定义对象形状，type 用于联合/交叉/工具类型
    "@typescript-eslint/consistent-type-definitions": ["error", "interface"],

    // ============================================================
    // import 规则（强制导入顺序 + 禁止危险导入）
    // ============================================================

    // 导入顺序：内置 > 外部 > 内部 > 父级 > 兄弟 > 索引，组间空行，组内字母序
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
        ],
        "newlines-between": "always",
        alphabetize: { order: "asc", caseInsensitive: true },
      },
    ],
    // 禁止默认导出（统一命名导出，便于重构与 AI 理解）
    "import/no-default-export": "error",
    // 禁止整个包导入（必须具名导入）
    "import/no-named-default": "error",
    // 禁止循环引用
    "import/no-cycle": ["error", { maxDepth: 10 }],
    // 禁止导入未在 package.json dependencies 中声明的包
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: [
          "**/*.test.ts",
          "**/*.test.tsx",
          "**/*.spec.ts",
          "**/*.spec.tsx",
          "**/vitest.config.ts",
          "**/vite.config.ts",
          "**/.eslintrc.cjs",
        ],
        peerDependencies: true,
      },
    ],
    // 禁止使用已弃用的导入路径
    "import/no-deprecated": "error",
    // 禁止重复导入同一模块
    "import/no-duplicates": "error",
    // 禁止使用 require（统一 ESM）
    "import/no-commonjs": "error",
    // 禁止导入 Node.js 内置模块到前端包（由各包 no-restricted-paths 细化）
    // 禁止空导入语句
    "import/no-empty-named-blocks": "error",
    // 禁止自引用（包内导入自身）
    "import/no-self-import": "error",
    // 禁止绝对路径导入
    "import/no-absolute-path": "error",
    // 禁止动态导入（除非显式允许）
    "import/no-dynamic-require": "error",
    // 禁止使用 webpack 特定语法
    "import/no-webpack-loader-syntax": "error",
    // 必须提供文件扩展名（便于 AI 与构建工具解析）
    "import/extensions": [
      "error",
      "always",
      {
        ignorePackages: true,
        pattern: {
          js: "never",
          jsx: "never",
          ts: "never",
          tsx: "never",
        },
      },
    ],

    // ============================================================
    // 代码质量规则（严格）
    // ============================================================

    // 禁止空块语句（包括 catch）
    "no-empty": ["error", { allowEmptyCatch: false }],
    // 禁止空函数（除非显式标注）
    "no-empty-function": [
      "error",
      { allow: ["arrowFunctions", "functions", "methods"] },
    ],
    // 禁止 console（仅允许 warn 和 error，调试日志应使用 @ps/log）
    "no-console": ["error", { allow: ["warn", "error"] }],
    // 禁止 debugger
    "no-debugger": "error",
    // 禁止 eval
    "no-eval": "error",
    // 禁止 alert / confirm / prompt（前端应使用组件库反馈）
    "no-alert": "error",
    // 强制使用 const（let 仅用于重新赋值）
    "prefer-const": [
      "error",
      { destructuring: "all", ignoreReadBeforeAssign: false },
    ],
    // 禁止 var
    "no-var": "error",
    // 强制严格相等（=== 和 !==）
    eqeqeq: ["error", "always"],
    // 禁止在 case 语句中声明变量
    "no-case-declarations": "error",
    // 禁止条件表达式中的赋值
    "no-cond-assign": "error",
    // 禁止重复的 case 标签
    "no-duplicate-case": "error",
    // 禁止重复的对象属性键
    "no-dupe-keys": "error",
    // 禁止函数参数重复
    "no-dupe-args": "error",
    // 禁止 else 块在 return 之后
    "no-else-return": "error",
    // 禁止空解构模式
    "no-empty-pattern": "error",
    // 禁止不必要的布尔类型转换
    "no-extra-boolean-cast": "error",
    // 禁止不必要的括号（多行 JSX 包裹括号是标准模式，允许）
    "no-extra-parens": ["error", "all", { ignoreJSX: "multi-line" }],
    // 禁止不必要的分号
    "no-extra-semi": "error",
    // 禁止浮点小数前后缺失数字（如 .5 或 5.）
    "no-floating-decimal": "error",
    // 禁止不可达代码
    "no-unreachable": "error",
    // 禁止在 return 之前不必要的 await
    "no-return-await": "error",
    // 禁止使用逗号运算符
    "no-sequences": "error",
    // 禁止与 -0 比较
    "no-compare-neg-zero": "error",
    // 禁止与 NaN 比较（应使用 isNaN）
    "use-isnan": "error",
    // 强制 valid typeof 比较
    "valid-typeof": "error",
    // 禁止将 Symbol 转为字符串
    "symbol-description": "error",
    // 禁止使用 constructor 构造字面量（应使用字面量语法）
    "no-new-wrappers": "error",
    "no-new-object": "error",
    "no-array-constructor": "error",
    // 强制单行 if/else 使用大括号
    curly: ["error", "all"],
    // 强制 switch 必须有 default
    "default-case": "error",
    // 强制 default 放在 switch 最后
    "default-case-last": "error",
    // 强制点号与对象同行
    "dot-location": ["error", "property"],
    // 强制使用点号访问属性（而非方括号）
    "dot-notation": "error",
    // 禁止函数声明块内嵌套
    "no-inner-declarations": "error",
    // 禁止不规则空格
    "no-irregular-whitespace": "error",
    // 禁止多行字符串
    "no-multi-str": "error",
    // 禁止使用八进制字面量
    "no-octal": "error",
    // 禁止八进制转义序列
    "no-octal-escape": "error",
    // 禁止重新声明变量
    "no-redeclare": "error",
    // 禁止在正则中使用空字符类
    "no-empty-character-class": "error",
    // 禁止不必要的字符类转义
    "no-useless-escape": "error",
    // 强制分号后不留空格，分号前不留空格
    "semi-spacing": "error",
    // 强制在空格周围使用空格
    "space-infix-ops": "error",
    // 强制函数标识符与调用之间不留空格
    "func-call-spacing": "error",
    // 强制块语句前后留空格
    "space-before-blocks": "error",
    // 强制括号内不留空格
    "space-in-parens": ["error", "never"],
    // 禁止行尾空格
    "no-trailing-spaces": "error",
    // 强制使用单引号（对齐 prettier）
    quotes: ["off"], // 由 prettier 控制
    // 禁止使用 void 运算符
    "no-void": "error",
    // 禁止使用 with 语句
    "no-with": "error",
    // 强制块语句使用大括号
    "brace-style": ["error", "1tbs", { allowSingleLine: false }],
    // 强制驼峰命名
    camelcase: [
      "error",
      {
        properties: "always",
        ignoreDestructuring: false,
        ignoreImports: false,
        ignoreGlobals: false,
      },
    ],
    // 强制构造函数首字母大写
    "new-cap": "error",
    // 强制 new 时调用括号
    "new-parens": "error",
    // 禁止遗留的 ES5 调用方式（arguments.caller / arguments.callee）
    "no-caller": "error",
    // 禁止删除变量
    "no-delete-var": "error",
    // 禁止标签语句
    "no-labels": "error",
    // 禁止不必要的标签
    "no-unused-labels": "error",
    // 禁止未使用的表达式
    "no-unused-expressions": "error",
    // 禁止不必要的构造函数
    "no-useless-constructor": "off", // 已由 @typescript-eslint 处理
    // 禁止不必要的拼接
    "no-useless-concat": "error",
    // 禁止不必要的 return
    "no-useless-return": "error",
    // 强制 IIFE 包裹
    "wrap-iife": "error",
    // 强制 yield 表达式包裹
    "yield-star-spacing": "error",
    // 禁止 Yoda 条件
    yoda: "error",
  },
  ignorePatterns: [
    "dist",
    "build",
    "node_modules",
    "coverage",
    "pnpm-workspace.yaml",
  ],
  overrides: [
    {
      // 测试文件放宽部分规则
      files: ["**/*.test.ts", "**/*.spec.ts", "**/__tests__/**/*.ts"],
      rules: {
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "no-console": "off",
        "max-lines": "off",
        "max-lines-per-function": "off",
      },
    },
    {
      // 配置文件允许 default export
      files: ["*.config.ts", "*.config.cjs", "*.config.js"],
      rules: {
        "import/no-default-export": "off",
        "import/no-commonjs": "off",
        "no-console": "off",
      },
    },
  ],
}
