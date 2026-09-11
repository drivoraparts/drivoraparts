import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier/flat";

/*
 * eslint-config-next@15 ships a legacy (.eslintrc-style) config -- its default
 * export is { extends: [...] }, not a flat-config array -- while this project
 * runs ESLint 9 flat config. The old eslint.config.mjs did `...next` on that
 * object, which cannot work: first it imported the wrong path (missing .js),
 * and once that was fixed it failed with "next is not iterable". Lint had
 * therefore never run at all.
 *
 * FlatCompat is the supported bridge for a legacy shareable config into flat
 * config. compat.config("next/core-web-vitals") loads exactly what Next
 * intends, translated to flat form.
 */
const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

export default defineConfig([
  ...compat.config({ extends: ["next/core-web-vitals"] }),
  prettier,
  /*
   * Build output, not source. The list was missing .open-next and .wrangler,
   * so ESLint linted the compiled Worker bundle and the Turbopack runtime
   * chunks -- all 40 "errors" (rules-of-hooks, no-assign-module-variable,
   * no-explicit-any, unused-vars) came from that generated code, none from a
   * real file. Ignoring these leaves only genuine source findings.
   */
  globalIgnores([
    ".next/**",
    ".open-next/**",
    ".wrangler/**",
    "out/**",
    "build/**",
    "node_modules/**",
  ]),
]);
