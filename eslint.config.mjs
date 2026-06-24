import { defineConfig, globalIgnores } from "eslint/config";
import next from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier/flat";

export default defineConfig([
  ...next,
  prettier,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "node_modules/**",
  ]),
]);