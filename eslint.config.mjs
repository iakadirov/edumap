import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Ignore scripts folder (utility scripts, not production code)
    "scripts/**",
  ]),
  // Custom rules
  {
    rules: {
      // Disable unescaped entities rule - not critical for Uzbek/Russian text
      "react/no-unescaped-entities": "off",
      // Warn instead of error for unused vars (helps during development)
      "@typescript-eslint/no-unused-vars": ["warn", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
      // Warn instead of error for explicit any (gradual migration to strict types)
      "@typescript-eslint/no-explicit-any": "warn",
      // Disable React Compiler strict mode warnings (false positives for async operations)
      "react-compiler/react-compiler": "off",
    },
  },
]);

export default eslintConfig;
