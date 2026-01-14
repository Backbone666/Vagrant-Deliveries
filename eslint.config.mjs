import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/**", "client/**", "node_modules/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.mocha,
        ...globals.es2021,
      },
      parserOptions: {
        sourceType: "module",
      },
    },
    rules: {
      "no-console": "off",
      "indent": ["error", 2],
      "quotes": ["warn", "double"],
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
);
