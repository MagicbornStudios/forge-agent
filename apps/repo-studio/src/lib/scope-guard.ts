import { isPathWithinRoots, listScopeRoots, normalizeRelPath, resolveRepoRoot } from '@/lib/repo-files';
import { readRepoStudioConfig, storyRootsFromConfig, storyScopePolicyFromConfig } from '@/lib/repo-studio-config';
import { getScopeOverrideStatus } from '@/lib/scope-overrides';

export type ScopeGuardInput = {
  operation: string;
  paths: string[];
  domain?: string;
  loopId?: string;
  overrideToken?: string;
};

function normalizePaths(paths: string[]) {
  return (paths || [])
    .map((value) => normalizeRelPath(String(value || '')))
    .filter(Boolean);
}

function resolveDomainRoots(domain: string | undefined, storyRoots: string[]) {
  const normalized = String(domain || '').trim().toLowerCase();
  if (!normalized) return [];
  if (normalized === 'story') return storyRoots;
  return [];
}

export async function resolveScopeGuardContext(input: {
  domain?: string;
  loopId?: string;
  overrideToken?: string;
}) {
  const config = await readRepoStudioConfig();
  const storyRoots = storyRootsFromConfig(config);
  const domain = String(input.domain || '').trim().toLowerCase() || undefined;
  const domainRoots = resolveDomainRoots(domain, storyRoots);
  const loopRoots = input.loopId
    ? await listScopeRoots(resolveRepoRoot(), 'loop', input.loopId)
    : [];

  const policy = domain === 'story'
    ? storyScopePolicyFromConfig(config)
    : 'soft';

  let overrideActive = false;
  let overrideRoots: string[] = [];
  if (input.overrideToken) {
    const status = await getScopeOverrideStatus({ token: input.overrideToken, domain });
    const active = status.active[0];
    if (active) {
      overrideActive = true;
      overrideRoots = active.roots;
    }
  }

  const allowedRoots = domainRoots.length > 0 ? domainRoots : (loopRoots.length > 0 ? loopRoots : ['.']);
  const effectiveRoots = overrideActive && overrideRoots.length > 0
    ? [...new Set([...allowedRoots, ...overrideRoots])]
    : allowedRoots;

  return {
    domain,
    policy,
    allowedRoots: effectiveRoots,
    overrideActive,
    loopRoots,
    domainRoots,
  };
}

export async function enforceScopeGuard(input: ScopeGuardInput) {
  const normalizedPaths = normalizePaths(input.paths);
  if (normalizedPaths.length === 0) {
    return {
      ok: true,
      skipped: true,
      message: 'No scoped paths provided.',
      context: await resolveScopeGuardContext({
        domain: input.domain,
        loopId: input.loopId,
        overrideToken: input.overrideToken,
      }),
    };
  }

  const context = await resolveScopeGuardContext({
    domain: input.domain,
    loopId: input.loopId,
    overrideToken: input.overrideToken,
  });

  if (context.policy === 'soft') {
    return {
      ok: true,
      skipped: false,
      context,
      outOfScope: normalizedPaths.filter((value) => !isPathWithinRoots(value, context.allowedRoots)),
    };
  }

  const outOfScope = normalizedPaths.filter((value) => !isPathWithinRoots(value, context.allowedRoots));
  if (outOfScope.length === 0) {
    return {
      ok: true,
      skipped: false,
      context,
      outOfScope: [],
    };
  }

  return {
    ok: false,
    skipped: false,
    context,
    outOfScope,
    message: [
      `${input.operation} blocked by scope policy.`,
      `domain=${context.domain || 'none'}`,
      `allowedRoots=${context.allowedRoots.join(', ') || '(none)'}`,
      `outOfScope=${outOfScope.join(', ')}`,
      context.overrideActive
        ? 'overrideToken is active but does not include requested path(s).'
        : 'start a scope override token to allow temporary expansion.',
    ].join(' '),
  };
}
