/**
 * Deep links and cross-workspace navigation. Chat says "go to that character" /
 * "open this node in Forge". Host app provides the router; workspaces emit requests.
 */

export type DeepLink =
  | { scheme: 'workspace'; workspace: 'forge'; path: ['graph', string, 'node', string] }
  | { scheme: 'workspace'; workspace: 'forge'; path: ['graph', string] }
  | { scheme: 'workspace'; workspace: 'writer'; path: ['page', string] }
  | { scheme: 'workspace'; workspace: 'characters'; path: ['char', string] }
  | { scheme: 'workspace'; workspace: 'video'; path: ['template', string] }
  | { scheme: 'workspace'; workspace: string; path: string[] };

export interface NavRequest {
  deepLink?: DeepLink;
  /** Optional: scroll/zoom to selection after navigate */
  reveal?: boolean;
}

export function deepLinkToString(link: DeepLink): string {
  const path = Array.isArray(link.path) ? link.path.join('/') : link.path;
  return `${link.scheme}://${link.workspace}/${path}`;
}
