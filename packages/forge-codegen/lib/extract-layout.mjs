/**
 * Extract workspace layout from TSX source: WORKSPACE_ID, WORKSPACE_LABEL, WorkspaceLayout.Panel id/title + rail.
 * No React; parses source text only.
 */

import fs from 'node:fs';
import path from 'node:path';

const RAIL_MAP = { Main: 'main', Left: 'left', Right: 'right', Bottom: 'bottom' };

export function extractWorkspaceMeta(source) {
  const idMatch = source.match(/export\s+const\s+WORKSPACE_ID\s*=\s*['"]([^'"]+)['"]/);
  const labelMatch = source.match(/export\s+const\s+WORKSPACE_LABEL\s*=\s*['"]([^'"]+)['"]/);
  return {
    workspaceId: idMatch ? idMatch[1] : null,
    label: labelMatch ? labelMatch[1] : null,
  };
}

export function extractPanelsWithRails(source) {
  const panels = [];
  let currentRail = null;
  const lines = source.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const slotMatch = line.match(/WorkspaceLayout\.(Main|Left|Right|Bottom)/);
    if (slotMatch) {
      currentRail = RAIL_MAP[slotMatch[1]];
    }
    const panelMatch =
      line.match(/WorkspaceLayout\.Panel\s+id=["']([^"']+)["'][^>]*title=["']([^"']+)["']/) ||
      line.match(/WorkspaceLayout\.Panel\s+title=["']([^"']+)["'][^>]*id=["']([^"']+)["']/);
    if (panelMatch && currentRail) {
      panels.push({ id: panelMatch[1], title: panelMatch[2], rail: currentRail });
    }
    // Studio also uses WorkspacePanel panelId="workspaceId-panelId"; extract panelId segment for key
    const workspacePanelMatch = line.match(/WorkspacePanel\s+panelId=["']([^"']+)["']/);
    if (workspacePanelMatch && currentRail) {
      const fullId = workspacePanelMatch[1];
      const panelId = fullId.includes('-') ? fullId.split('-').pop() : fullId;
      const titleMatch = line.match(/title=["']([^"']+)["']/);
      panels.push({ id: panelId, title: titleMatch ? titleMatch[1] : panelId, rail: currentRail });
    }
  }
  return panels;
}

/**
 * Parse one workspace file. Returns { workspaceId, label, panels } or null.
 */
export function parseWorkspaceFile(filePath) {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) return null;
  const source = fs.readFileSync(resolved, 'utf8');
  const meta = extractWorkspaceMeta(source);
  const panels = extractPanelsWithRails(source);
  return {
    workspaceId: meta.workspaceId ?? null,
    label: meta.label ?? null,
    panels,
  };
}

/**
 * Extract layout from multiple workspace files.
 * @param {Array<{ workspaceId: string, filePath: string }>} workspaceFiles - list of { workspaceId, filePath } (paths relative to cwd)
 * @param {string} cwd - base path for resolving filePath
 * @returns {Array<{ workspaceId: string, label: string, panels: Array<{ id: string, title: string, rail: string }> }>}
 */
export function extractLayoutFromWorkspaceFiles(workspaceFiles, cwd) {
  const results = [];
  for (const { workspaceId, filePath } of workspaceFiles) {
    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(cwd, filePath);
    const data = parseWorkspaceFile(fullPath);
    if (!data) continue;
    results.push({
      workspaceId: data.workspaceId ?? workspaceId,
      label: data.label ?? workspaceId,
      panels: data.panels,
    });
  }
  return results;
}
