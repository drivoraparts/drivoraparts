import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { POLICY_PATHS } from "../lib/seo/constants.ts";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

for (const policyPath of POLICY_PATHS) {
  const rel = policyPath.replace(/^\/policies\//, "");
  const file = path.join(root, "app/policies", rel, "page.tsx");
  if (!fs.existsSync(file)) {
    console.warn("skip missing", file);
    continue;
  }

  let src = fs.readFileSync(file, "utf8");
  if (src.includes("buildPolicyMetadata")) {
    console.log("already patched", rel);
    continue;
  }

  const injection = `import { buildPolicyMetadata } from "@/lib/seo/policy-metadata";\n\nexport const metadata = buildPolicyMetadata("${policyPath}");\n\n`;
  src = injection + src;
  fs.writeFileSync(file, src);
  console.log("patched", rel);
}

console.log("Done");
