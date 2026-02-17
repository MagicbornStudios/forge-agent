import fs from 'node:fs';
import path from 'node:path';

export type DependencyHealth = {
  dockviewPackageResolved: boolean;
  dockviewCssResolved: boolean;
  sharedStylesResolved: boolean;
  cssPackagesResolved: boolean;
  cssPackageStatus: Array<{
    packageName: string;
    resolved: boolean;
    resolvedPath: string | null;
  }>;
  messages: string[];
  details: {
    repoRoot: string;
    appRoot: string;
    dockviewPackagePath: string | null;
    dockviewCssPath: string | null;
    sharedStylePaths: string[];
  };
};

const SHARED_STYLE_RELATIVE_PATHS = [
  'packages/shared/src/shared/styles/editor-surface.css',
  'packages/shared/src/shared/styles/dockview-overrides.css',
  'packages/shared/src/shared/styles/themes.css',
  'packages/shared/src/shared/styles/contexts.css',
];

const REQUIRED_CSS_PACKAGES = ['tw-animate-css', 'tailwindcss-animate'];

function exists(filePath: string) {
  try {
    fs.accessSync(filePath);
    return true;
  } catch {
    return false;
  }
}

function resolveRepoRoot(cwd = process.cwd()) {
  const direct = path.resolve(cwd);
  if (exists(path.join(direct, 'pnpm-workspace.yaml'))) return direct;

  const parent = path.resolve(direct, '..');
  if (exists(path.join(parent, 'pnpm-workspace.yaml'))) return parent;

  const grandParent = path.resolve(direct, '..', '..');
  if (exists(path.join(grandParent, 'pnpm-workspace.yaml'))) return grandParent;

  return direct;
}

function resolveAppRoot(repoRoot: string, cwd = process.cwd()) {
  const canonical = path.join(repoRoot, 'apps', 'repo-studio');
  if (exists(path.join(canonical, 'package.json'))) return canonical;

  const direct = path.resolve(cwd);
  if (exists(path.join(direct, 'package.json')) && direct.endsWith(path.join('apps', 'repo-studio'))) {
    return direct;
  }
  return canonical;
}

function resolveDockviewInstall(repoRoot: string, appRoot: string) {
  const directCandidates = [
    path.join(appRoot, 'node_modules', 'dockview'),
    path.join(repoRoot, 'node_modules', 'dockview'),
  ];

  for (const candidate of directCandidates) {
    const pkgPath = path.join(candidate, 'package.json');
    const cssPath = path.join(candidate, 'dist', 'styles', 'dockview.css');
    if (exists(pkgPath) && exists(cssPath)) {
      return {
        packagePath: pkgPath,
        cssPath,
      };
    }
  }

  const pnpmStore = path.join(repoRoot, 'node_modules', '.pnpm');
  if (!exists(pnpmStore)) {
    return { packagePath: null, cssPath: null };
  }

  try {
    const entries = fs.readdirSync(pnpmStore, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (!entry.name.startsWith('dockview@')) continue;
      const candidate = path.join(pnpmStore, entry.name, 'node_modules', 'dockview');
      const pkgPath = path.join(candidate, 'package.json');
      const cssPath = path.join(candidate, 'dist', 'styles', 'dockview.css');
      if (exists(pkgPath) && exists(cssPath)) {
        return {
          packagePath: pkgPath,
          cssPath,
        };
      }
    }
  } catch {
    return { packagePath: null, cssPath: null };
  }

  return { packagePath: null, cssPath: null };
}

function resolvePackageInstall(packageName: string, repoRoot: string, appRoot: string): string | null {
  const directCandidates = [
    path.join(appRoot, 'node_modules', packageName, 'package.json'),
    path.join(repoRoot, 'node_modules', packageName, 'package.json'),
  ];
  for (const candidate of directCandidates) {
    if (exists(candidate)) return candidate;
  }

  const pnpmStore = path.join(repoRoot, 'node_modules', '.pnpm');
  if (!exists(pnpmStore)) return null;

  const pnpmPrefix = packageName.replace('/', '+');
  try {
    const entries = fs.readdirSync(pnpmStore, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (!entry.name.startsWith(`${pnpmPrefix}@`)) continue;
      const candidate = path.join(pnpmStore, entry.name, 'node_modules', packageName, 'package.json');
      if (exists(candidate)) return candidate;
    }
  } catch {
    return null;
  }

  return null;
}

export function getDependencyHealth(startCwd = process.cwd()): DependencyHealth {
  const repoRoot = resolveRepoRoot(startCwd);
  const appRoot = resolveAppRoot(repoRoot, startCwd);
  const messages: string[] = [];

  const resolvedDockview = resolveDockviewInstall(repoRoot, appRoot);
  const dockviewPackagePath = resolvedDockview.packagePath;
  const dockviewCssPath = resolvedDockview.cssPath;
  const sharedStylePaths = SHARED_STYLE_RELATIVE_PATHS.map((relativePath) => path.join(repoRoot, relativePath));

  const dockviewPackageResolved = dockviewPackagePath != null;
  if (!dockviewPackageResolved) {
    messages.push(`Unable to resolve dockview package from ${appRoot}.`);
  }

  const dockviewCssResolved = dockviewCssPath != null;
  if (!dockviewCssResolved) {
    messages.push(`Unable to resolve dockview CSS import "dockview/dist/styles/dockview.css" from ${appRoot}.`);
  }

  const missingShared = sharedStylePaths.filter((filePath) => !exists(filePath));
  const sharedStylesResolved = missingShared.length === 0;
  if (!sharedStylesResolved) {
    messages.push(`Missing shared style files: ${missingShared.join(', ')}`);
  }

  const cssPackageStatus = REQUIRED_CSS_PACKAGES.map((packageName) => {
    const resolvedPath = resolvePackageInstall(packageName, repoRoot, appRoot);
    return {
      packageName,
      resolved: resolvedPath != null,
      resolvedPath,
    };
  });
  const cssPackagesResolved = cssPackageStatus.every((item) => item.resolved);
  if (!cssPackagesResolved) {
    const missingPackages = cssPackageStatus
      .filter((item) => !item.resolved)
      .map((item) => item.packageName);
    messages.push(
      `Missing RepoStudio CSS packages: ${missingPackages.join(', ')}. Add to apps/repo-studio/package.json, run pnpm install, then pnpm --filter @forge/repo-studio-app build.`,
    );
  }

  if (messages.length === 0) {
    messages.push('Dockview package/CSS, shared styles, and required CSS packages resolved.');
  }

  return {
    dockviewPackageResolved,
    dockviewCssResolved,
    sharedStylesResolved,
    cssPackagesResolved,
    cssPackageStatus,
    messages,
    details: {
      repoRoot,
      appRoot,
      dockviewPackagePath,
      dockviewCssPath,
      sharedStylePaths,
    },
  };
}
