#!/usr/bin/env node

import fs from "node:fs/promises";
import process from "node:process";

const checks = [
  {
    file: "apps/studio/app/docs/layout.tsx",
    forbidden: [
      "from 'fumadocs-ui/layouts/docs'",
      'from "fumadocs-ui/layouts/docs"',
      "from 'fumadocs-core/framework/next'",
      'from "fumadocs-core/framework/next"',
      "from 'fumadocs-ui/provider/next'",
      'from "fumadocs-ui/provider/next"',
      "<RootProvider",
      "<NextProvider",
    ],
    required: ["./docs.css"],
    requiredMode: "all",
  },
  {
    file: "apps/studio/app/docs/[[...slug]]/page.tsx",
    forbidden: ["from 'fumadocs-ui/page'", 'from "fumadocs-ui/page"'],
    required: ["DocsShell", "DOCS_ARTICLE_CLASS"],
    requiredMode: "all",
  },
  {
    file: "apps/platform/src/app/docs/layout.tsx",
    forbidden: [
      "from 'fumadocs-ui/layouts/docs'",
      'from "fumadocs-ui/layouts/docs"',
      "from 'fumadocs-core/framework/next'",
      'from "fumadocs-core/framework/next"',
      "from 'fumadocs-ui/provider/next'",
      'from "fumadocs-ui/provider/next"',
      "<RootProvider",
      "<NextProvider",
    ],
    required: ["./docs.css"],
    requiredMode: "all",
  },
  {
    file: "apps/platform/src/app/docs/[[...slug]]/page.tsx",
    forbidden: ["from 'fumadocs-ui/page'", 'from "fumadocs-ui/page"'],
    required: ["DocsShell", "DOCS_ARTICLE_CLASS"],
    requiredMode: "all",
  },
];

async function main() {
  const failures = [];

  for (const check of checks) {
    let text = "";
    try {
      text = await fs.readFile(check.file, "utf8");
    } catch (error) {
      failures.push(`${check.file}: could not read file (${error.message})`);
      continue;
    }

    for (const forbidden of check.forbidden ?? []) {
      if (text.includes(forbidden)) {
        failures.push(`${check.file}: forbidden pattern "${forbidden}"`);
      }
    }

    if (check.required?.length) {
      const matches = check.required.filter((required) => text.includes(required));
      const hasRequired =
        check.requiredMode === "all"
          ? matches.length === check.required.length
          : matches.length > 0;
      if (!hasRequired) {
        failures.push(
          `${check.file}: missing required pattern (${check.required.join(" OR ")})`,
        );
      }
    }
  }

  if (failures.length > 0) {
    console.error("[docs-runtime-doctor] FAIL:");
    failures.forEach((failure) => console.error(`  - ${failure}`));
    process.exit(1);
  }

  console.log("[docs-runtime-doctor] PASS: Studio and platform docs runtime guardrails satisfied");
}

main().catch((error) => {
  console.error("[docs-runtime-doctor] Unhandled error:", error);
  process.exit(1);
});
