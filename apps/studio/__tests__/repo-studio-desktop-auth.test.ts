import { sanitizeRequestedScopes } from '@/lib/server/api-keys';
import { buildRepoStudioCapabilities } from '@/lib/server/repo-studio-desktop-auth';

describe('repo-studio desktop auth scope contracts', () => {
  it('retains AI default fallback when no scopes are requested', () => {
    expect(sanitizeRequestedScopes(undefined)).toEqual(['ai.*']);
  });

  it('accepts repo-studio scopes and filters unknown values', () => {
    expect(
      sanitizeRequestedScopes([
        'repo-studio.connect',
        'repo-studio.read',
        'repo-studio.write',
        'repo-studio.*',
        'unknown.scope',
      ]),
    ).toEqual([
      'repo-studio.connect',
      'repo-studio.read',
      'repo-studio.write',
      'repo-studio.*',
    ]);
  });

  it('maps repo-studio capability envelope correctly', () => {
    expect(buildRepoStudioCapabilities(['repo-studio.connect', 'repo-studio.read'])).toEqual({
      connect: true,
      read: true,
      write: false,
    });

    expect(buildRepoStudioCapabilities(['repo-studio.write'])).toEqual({
      connect: false,
      read: true,
      write: true,
    });

    expect(buildRepoStudioCapabilities(['repo-studio.*'])).toEqual({
      connect: true,
      read: true,
      write: true,
    });
  });
});
