import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const rootDir = process.cwd();
const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
const matrixPath = path.join(
  rootDir,
  "scripts",
  "github-installability-matrix.json",
);
const matrix = JSON.parse(fs.readFileSync(matrixPath, "utf8"));
const matrixEntries = new Map(
  matrix.entries.map((entry) => [entry.name, entry]),
);

function shellQuote(value) {
  if (!/[ \t"]/u.test(value)) {
    return value;
  }

  return `"${value.replaceAll('"', '\\"')}"`;
}

function run(command, args, cwd) {
  const options = {
    cwd,
    encoding: "utf8",
    stdio: "pipe",
  };

  const result =
    process.platform === "win32"
      ? spawnSync(
          process.env.ComSpec || "cmd.exe",
          ["/d", "/s", "/c", [command, ...args].map(shellQuote).join(" ")],
          options,
        )
      : spawnSync(command, args, options);

  return result;
}

function fail(message, detail) {
  console.error(message);
  if (detail) {
    console.error(detail);
  }
  process.exit(1);
}

function extractPackJson(stdout) {
  const trimmed = stdout.trim();
  const startIndex = Math.max(trimmed.lastIndexOf("\n["), trimmed.indexOf("["));
  if (startIndex === -1) {
    return trimmed;
  }

  const normalizedStart =
    trimmed[startIndex] === "[" ? startIndex : startIndex + 1;
  return trimmed.slice(normalizedStart);
}

function loadPackageEntries() {
  const listResult = run(
    "pnpm",
    ["m", "ls", "--depth", "-1", "--json"],
    rootDir,
  );
  if (listResult.status !== 0) {
    fail(
      "Smoke failed while loading workspace package list",
      listResult.stderr || listResult.stdout,
    );
  }

  const rows = JSON.parse(listResult.stdout);
  const entries = [];
  for (const row of rows) {
    if (!row?.path || row.path === rootDir) continue;
    const packageJsonPath = path.join(row.path, "package.json");
    if (!fs.existsSync(packageJsonPath)) continue;

    const manifest = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const relDir = path.relative(rootDir, row.path).replaceAll("\\", "/");
    entries.push({
      root: relDir.split("/")[0] ?? "",
      dir: row.path,
      relDir,
      manifest,
    });
  }

  entries.sort((a, b) => a.relDir.localeCompare(b.relDir));
  return entries;
}

function getInternalFileDeps(manifest) {
  const sections = ["dependencies", "devDependencies", "optionalDependencies"];
  const deps = [];

  for (const section of sections) {
    const values = manifest[section] ?? {};
    for (const [name, spec] of Object.entries(values)) {
      const stringSpec = String(spec);
      if (name.startsWith("@forge/") && stringSpec.startsWith("file:")) {
        deps.push({ name, spec: stringSpec });
      }
    }
  }

  return deps;
}

const entries = loadPackageEntries();
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "forge-github-smoke-"));
const packedArtifacts = [];
const skipped = [];
const passed = [];
const matrixErrors = [];

for (const entry of entries) {
  const { manifest, dir, relDir, root } = entry;
  const matrixEntry = matrixEntries.get(manifest.name);
  if (!matrixEntry) {
    matrixErrors.push(`Missing matrix entry for ${manifest.name} (${relDir})`);
    continue;
  }
  if (matrixEntry.path !== relDir) {
    matrixErrors.push(
      `Matrix path mismatch for ${manifest.name}: matrix=${matrixEntry.path}, discovered=${relDir}`,
    );
    continue;
  }

  const internalFileDeps = getInternalFileDeps(manifest);

  if (matrixEntry.mode === "dedicated_repo_app") {
    skipped.push(
      `${manifest.name} (${relDir}): dedicated app repo surface (${matrixEntry.repo})`,
    );
    continue;
  }

  if (matrixEntry.mode === "repo_coupled_package") {
    if (internalFileDeps.length === 0) {
      matrixErrors.push(
        `${manifest.name} (${relDir}) is marked repo_coupled_package but has no internal file deps`,
      );
      continue;
    }
    skipped.push(
      `${manifest.name} (${relDir}): repo-coupled internal file deps (${internalFileDeps
        .map((dep) => dep.name)
        .join(", ")})`,
    );
    continue;
  }

  if (matrixEntry.mode !== "standalone_package") {
    matrixErrors.push(
      `${manifest.name} (${relDir}) has unknown mode ${matrixEntry.mode}`,
    );
    continue;
  }

  if (root === "apps") {
    matrixErrors.push(
      `${manifest.name} (${relDir}) cannot be standalone_package because it is under apps/`,
    );
    continue;
  }

  if (internalFileDeps.length > 0) {
    matrixErrors.push(
      `${manifest.name} (${relDir}) is marked standalone_package but has internal file deps (${internalFileDeps
        .map((dep) => dep.name)
        .join(", ")})`,
    );
    continue;
  }

  const packResult = run(npmCmd, ["pack", "--json"], dir);
  if (packResult.status !== 0) {
    fail(
      `Smoke failed while packing ${manifest.name} (${relDir})`,
      packResult.stderr || packResult.stdout,
    );
  }

  let packInfo;
  try {
    packInfo = JSON.parse(extractPackJson(packResult.stdout));
  } catch (error) {
    fail(
      `Smoke failed while parsing pack output for ${manifest.name} (${relDir})`,
      packResult.stdout,
    );
  }

  const tarballName = packInfo?.[0]?.filename;
  if (!tarballName) {
    fail(
      `Smoke failed: npm pack did not return a filename for ${manifest.name} (${relDir})`,
      packResult.stdout,
    );
  }

  const tarballPath = path.join(dir, tarballName);
  const stagedTarballPath = path.join(tempRoot, tarballName);
  fs.copyFileSync(tarballPath, stagedTarballPath);
  fs.rmSync(tarballPath, { force: true });
  packedArtifacts.push(stagedTarballPath);

  const consumerDir = path.join(
    tempRoot,
    manifest.name.replace(/^@/, "").replaceAll("/", "__").replaceAll("\\", "_"),
  );
  fs.mkdirSync(consumerDir, { recursive: true });
  fs.writeFileSync(
    path.join(consumerDir, "package.json"),
    JSON.stringify(
      { name: "github-installability-smoke", private: true },
      null,
      2,
    ),
  );

  const installResult = run(
    npmCmd,
    ["install", "--ignore-scripts", stagedTarballPath],
    consumerDir,
  );
  if (installResult.status !== 0) {
    fail(
      `Smoke failed while installing ${manifest.name} (${relDir}) into a clean consumer project`,
      installResult.stderr || installResult.stdout,
    );
  }

  passed.push(`${manifest.name} (${relDir})`);
}

if (matrixErrors.length > 0) {
  fail(
    "GitHub installability smoke failed matrix validation",
    matrixErrors.join("\n"),
  );
}

console.log("GitHub installability smoke:");
for (const item of passed) {
  console.log(`- [pass] ${item}`);
}
for (const item of skipped) {
  console.log(`- [skip] ${item}`);
}
console.log(`Passed: ${passed.length}`);
console.log(`Skipped: ${skipped.length}`);
console.log(`Temp root: ${tempRoot}`);
