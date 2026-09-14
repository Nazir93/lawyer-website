/**
 * One-shot helper used by agent — patches CMS API mutators to require platform admin.
 * Run: node scripts/patch-cms-auth.mjs
 */
import fs from "fs";
import path from "path";

const root = path.resolve("src/app/api");
const targets = [
  "services/route.ts",
  "services/[id]/route.ts",
  "news/route.ts",
  "news/[id]/route.ts",
  "cases/route.ts",
  "cases/[id]/route.ts",
  "pricing/route.ts",
  "pricing/[id]/route.ts",
  "sections/route.ts",
  "sections/[id]/route.ts",
  "sections/reorder/route.ts",
  "reviews/[id]/route.ts",
  "hero/route.ts",
];

const IMPORT_AUTH = `import { requirePlatformAdmin } from "@/lib/auth/auth";
import { authErrorResponse } from "@/lib/auth/api-guard";`;

function ensureImports(src) {
  if (src.includes("requirePlatformAdmin")) return src;
  if (src.includes('from "next/server"')) {
    return src.replace(
      /from "next\/server";\n/,
      `from "next/server";\n${IMPORT_AUTH}\n`
    );
  }
  return `${IMPORT_AUTH}\n${src}`;
}

function wrapMutator(src, method) {
  const re = new RegExp(
    `export async function ${method}\\(([^)]*)\\)\\s*\\{\\s*try\\s*\\{`,
    "g"
  );
  return src.replace(re, (match, args) => {
    if (match.includes("requirePlatformAdmin")) return match;
    return `export async function ${method}(${args}) {\n  try {\n    await requirePlatformAdmin();`;
  });
}

function fixCatch(src) {
  // Add authErrorResponse to generic catch returns where missing — light touch
  return src.replace(
    /return NextResponse\.json\(\s*\{\s*error:\s*"Ошибка ([^"]+)"\s*\}\s*,\s*\{\s*status:\s*500\s*\}\s*\);/g,
    (m, what) => {
      if (m.includes("authErrorResponse")) return m;
      return `return (\n      authErrorResponse(error) ||\n      NextResponse.json({ error: "Ошибка ${what}" }, { status: 500 })\n    );`;
    }
  );
}

for (const rel of targets) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) {
    console.log("skip missing", rel);
    continue;
  }
  let src = fs.readFileSync(file, "utf8");
  src = ensureImports(src);
  for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
    src = wrapMutator(src, method);
  }
  src = fixCatch(src);
  fs.writeFileSync(file, src);
  console.log("patched", rel);
}
