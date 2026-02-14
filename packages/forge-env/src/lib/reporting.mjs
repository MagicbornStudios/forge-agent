export function discoveryLines(discovery) {
  if (!discovery) return [];

  const lines = [
    '',
    '## Discovery',
    `- source: ${discovery.source || 'unknown'}`,
    `- manifest targets: ${discovery.manifestCount ?? 0}`,
    `- discovered targets: ${discovery.discoveredCount ?? 0}`,
    `- merged targets: ${discovery.mergedCount ?? 0}`,
    `- selected targets: ${discovery.selectedCount ?? 0}`,
  ];

  if (Array.isArray(discovery.workspaceGlobs) && discovery.workspaceGlobs.length > 0) {
    lines.push(`- workspace globs: ${discovery.workspaceGlobs.join(', ')}`);
  }
  if (Array.isArray(discovery.addedByDiscovery) && discovery.addedByDiscovery.length > 0) {
    lines.push(`- added by discovery: ${discovery.addedByDiscovery.join(', ')}`);
  }
  if (Array.isArray(discovery.manifestMissingDirs) && discovery.manifestMissingDirs.length > 0) {
    lines.push(`- manifest dirs missing: ${discovery.manifestMissingDirs.join(', ')}`);
  }
  if (Array.isArray(discovery.discoveredWithoutManifest) && discovery.discoveredWithoutManifest.length > 0) {
    lines.push(`- discovered not in manifest: ${discovery.discoveredWithoutManifest.join(', ')}`);
  }
  if (Array.isArray(discovery.idCollisions) && discovery.idCollisions.length > 0) {
    lines.push(`- id collisions: ${discovery.idCollisions.join(', ')}`);
  }

  return lines;
}
