import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const rootDir = process.cwd();
const matrixPath = path.join(
  rootDir,
  "scripts",
  "github-installability-matrix.json",
);
const matrix = JSON.parse(fs.readFileSync(matrixPath, "utf8"));
const matrixEntries = new Map(
  matrix.entries.map((entry) => [entry.name, entry]),
);

function loadWorkspacePackageFiles() {
  const result = spawnSync("pnpm", ["m", "ls", "--depth", "-1", "--json"], {
    cwd: rootDir,
    encoding: "utf8",
    stdio: "pipe",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    throw new Error(
      result.stderr || result.stdout || "failed to load workspace packages",
    );
  }

  const rows = JSON.parse(result.stdout);
  const files = [];
  for (const row of rows) {
    if (!row?.path || row.path === rootDir) continue;
    const packageJsonPath = path.join(row.path, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      files.push(packageJsonPath);
    }
  }
  return files;
}

const packageFiles = loadWorkspacePackageFiles();
packageFiles.sort();

const packages = packageFiles.map((packageJsonPath) => {
  const manifest = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  return {
    dir: path.dirname(packageJsonPath),
    relDir: path
      .relative(rootDir, path.dirname(packageJsonPath))
      .replaceAll("\\", "/"),
    manifest,
  };
});

const internalByName = new Map(packages.map((pkg) => [pkg.manifest.name, pkg]));
const findings = [];

function hasExportKey(exportsMap, exportKey) {
  if (exportKey in exportsMap) {
    return true;
  }

  for (const key of Object.keys(exportsMap)) {
    if (!key.includes("*")) continue;
    const [prefix, suffix] = key.split("*");
    if (!exportKey.startsWith(prefix)) continue;
    if (suffix && !exportKey.endsWith(suffix)) continue;
    return true;
  }

  return false;
}

function addFinding(level, relDir, message) {
  findings.push({ level, relDir, message });
}

function getManifestDeps(manifest) {
  const sections = [
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies",
  ];
  const pairs = [];
  for (const section of sections) {
    const deps = manifest[section] ?? {};
    for (const [name, value] of Object.entries(deps)) {
      pairs.push({ section, name, value: String(value) });
    }
  }
  return pairs;
}

for (const pkg of packages) {
  const { manifest, relDir } = pkg;
  const deps = getManifestDeps(manifest);
  const files = Array.isArray(manifest.files) ? manifest.files : [];
  const scripts = manifest.scripts ?? {};
  const exportsMap =
    manifest.exports && typeof manifest.exports === "object"
      ? manifest.exports
      : null;
  const matrixEntry = matrixEntries.get(manifest.name);

  if (!matrixEntry) {
    addFinding(
      "error",
      relDir,
      `package is missing from github-installability-matrix.json (${manifest.name})`,
    );
  } else {
    if (matrixEntry.path !== relDir) {
      addFinding(
        "error",
        relDir,
        `matrix path mismatch for ${manifest.name}: expected ${matrixEntry.path}, found ${relDir}`,
      );
    }
  }

  for (const dep of deps) {
    if (dep.value.startsWith("workspace:")) {
      addFinding(
        "error",
        relDir,
        `${dep.section} uses workspace protocol for ${dep.name}`,
      );
    }
  }

  if (files.includes("dist")) {
    const hasPrepare =
      typeof scripts.prepare === "string" && scripts.prepare.trim().length > 0;
    if (!hasPrepare) {
      addFinding(
        "error",
        relDir,
        "files includes dist but no prepare script is defined",
      );
    }
  }

  if (exportsMap) {
    const exportValues = Object.values(exportsMap)
      .flatMap((entry) => {
        if (typeof entry === "string") return [entry];
        if (entry && typeof entry === "object")
          return Object.values(entry).filter(
            (value) => typeof value === "string",
          );
        return [];
      })
      .map((value) => String(value));

    const exportsSourceFiles = exportValues.some((value) =>
      value.startsWith("./src/"),
    );
    if (exportsSourceFiles && !files.includes("src")) {
      addFinding(
        "error",
        relDir,
        "exports reference src files but files does not include src",
      );
    }
  }

  if (manifest.private === true && matrixEntry?.mode !== "dedicated_repo_app") {
    addFinding(
      "warning",
      relDir,
      "package remains private; verify this is intentional for the chosen GitHub install path",
    );
  }
}

for (const [name, entry] of matrixEntries) {
  if (!internalByName.has(name)) {
    addFinding(
      "error",
      entry.path,
      `matrix entry references missing package ${name}`,
    );
  }
}

const sourceRoots = [
  "apps",
  "packages",
  "scripts",
  "vendor/repo-studio/apps",
  "vendor/repo-studio/packages",
  "vendor/platform/apps",
];
const importRegexes = [
  /from\s+['"](@forge\/[^'"]+)['"]/g,
  /import\s*\(\s*['"](@forge\/[^'"]+)['"]\s*\)/g,
  /require\(\s*['"](@forge\/[^'"]+)['"]\s*\)/g,
];

for (const sourceRoot of sourceRoots) {
  const absSourceRoot = path.join(rootDir, sourceRoot);
  if (!fs.existsSync(absSourceRoot)) continue;

  const stack = [absSourceRoot];
  while (stack.length > 0) {
    const currentDir = stack.pop();
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        if (
          entry.name === "node_modules" ||
          entry.name === ".next" ||
          entry.name === "dist"
        )
          continue;
        stack.push(fullPath);
        continue;
      }
      if (!/\.(mjs|cjs|js|ts|tsx)$/.test(entry.name)) continue;

      const relFile = path.relative(rootDir, fullPath).replaceAll("\\", "/");
      const content = fs.readFileSync(fullPath, "utf8");
      for (const importRegex of importRegexes) {
        let match;
        while ((match = importRegex.exec(content)) !== null) {
          const fullImport = match[1];
          const packageName = fullImport.split("/").slice(0, 2).join("/");
          const subpath = fullImport.slice(packageName.length + 1);
          const targetPkg = internalByName.get(packageName);
          if (!targetPkg || !subpath) continue;

          const targetExports = targetPkg.manifest.exports;
          if (!targetExports || typeof targetExports !== "object") {
            addFinding(
              "warning",
              relFile,
              `${fullImport} uses a subpath import but ${packageName} has no exports map`,
            );
            continue;
          }

          const exportKey = `./${subpath}`;
          if (!hasExportKey(targetExports, exportKey)) {
            addFinding(
              "error",
              relFile,
              `${fullImport} is used but ${packageName} does not export ${exportKey}`,
            );
          }
        }
      }
    }
  }
}

const errors = findings.filter((finding) => finding.level === "error");
const warnings = findings.filter((finding) => finding.level === "warning");

if (findings.length === 0) {
  console.log("GitHub installability doctor: no issues found.");
  process.exit(0);
}

console.log("GitHub installability doctor:");
for (const finding of findings) {
  console.log(`- [${finding.level}] ${finding.relDir}: ${finding.message}`);
}

console.log(`Errors: ${errors.length}`);
console.log(`Warnings: ${warnings.length}`);

if (errors.length > 0) {
  process.exit(1);
}
