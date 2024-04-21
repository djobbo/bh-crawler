// @ts-check

import js from "@eslint/js"
import prettier from "eslint-plugin-prettier/recommended"
import tseslint from "typescript-eslint"

export default tseslint.config(
  js.configs.recommended,
  prettier,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
)
