import { useAppShellStore } from '@/lib/app-shell/store';

describe('App Shell store', () => {
  beforeEach(() => {
    useAppShellStore.setState({
      route: {
        activeWorkspaceId: 'forge',
        openWorkspaceIds: ['forge'],
        globalModals: [],
      },
    });
  });

  it('setActiveWorkspace switches active and opens workspace if not open', () => {
    const { setActiveWorkspace, route } = useAppShellStore.getState();
    setActiveWorkspace('video');
    const next = useAppShellStore.getState().route;
    expect(next.activeWorkspaceId).toBe('video');
    expect(next.openWorkspaceIds).toContain('video');
    expect(next.openWorkspaceIds).toContain('forge');
  });

  it('openWorkspace adds tab and switches to it', () => {
    const { openWorkspace } = useAppShellStore.getState();
    openWorkspace('video');
    const next = useAppShellStore.getState().route;
    expect(next.openWorkspaceIds).toContain('video');
    expect(next.activeWorkspaceId).toBe('video');
  });

  it('openWorkspace when already open just switches active', () => {
    const { openWorkspace, setActiveWorkspace } = useAppShellStore.getState();
    openWorkspace('video');
    setActiveWorkspace('forge');
    openWorkspace('video');
    const next = useAppShellStore.getState().route;
    expect(next.openWorkspaceIds).toHaveLength(2);
    expect(next.activeWorkspaceId).toBe('video');
  });

  it('closeWorkspace removes tab and switches to another', () => {
    const { openWorkspace, closeWorkspace } = useAppShellStore.getState();
    openWorkspace('video');
    closeWorkspace('video');
    const next = useAppShellStore.getState().route;
    expect(next.openWorkspaceIds).not.toContain('video');
    expect(next.openWorkspaceIds).toContain('forge');
    expect(next.activeWorkspaceId).toBe('forge');
  });

  it('closeWorkspace when active switches to first remaining', () => {
    const { openWorkspace, closeWorkspace } = useAppShellStore.getState();
    openWorkspace('video');
    closeWorkspace('forge');
    const next = useAppShellStore.getState().route;
    expect(next.activeWorkspaceId).toBe('video');
    expect(next.openWorkspaceIds).toEqual(['video']);
  });
});
