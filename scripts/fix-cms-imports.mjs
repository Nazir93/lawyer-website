import fs from "fs";

const files = [
  "src/app/api/services/route.ts",
  "src/app/api/services/[id]/route.ts",
  "src/app/api/news/route.ts",
  "src/app/api/news/[id]/route.ts",
  "src/app/api/cases/route.ts",
  "src/app/api/cases/[id]/route.ts",
  "src/app/api/pricing/route.ts",
  "src/app/api/pricing/[id]/route.ts",
  "src/app/api/sections/route.ts",
  "src/app/api/sections/[id]/route.ts",
  "src/app/api/sections/reorder/route.ts",
  "src/app/api/reviews/[id]/route.ts",
  "src/app/api/hero/route.ts",
];

const IMP = `import { requirePlatformAdmin } from "@/lib/auth/auth";
import { authErrorResponse } from "@/lib/auth/api-guard";
`;

for (const f of files) {
  let s = fs.readFileSync(f, "utf8");
  if (!s.includes("@/lib/auth/auth")) {
    s = s.replace(/from "next\/server";\n/, (m) => m + IMP);
    fs.writeFileSync(f, s);
    console.log("fixed", f);
  } else {
    console.log("ok", f);
  }
}
