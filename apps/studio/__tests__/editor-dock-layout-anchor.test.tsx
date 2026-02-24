import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { WorkspaceLayout } from '@forge/shared/components/editor';

jest.mock('dockview', () => {
  const React = require('react');

  const state: {
    api: any;
    addPanelCalls: any[];
  } = {
    api: null,
    addPanelCalls: [],
  };

  const createApi = () => {
    const panels = new Map<string, any>();
    const removeListeners = new Set<(panel: { id: string }) => void>();
    const layoutListeners = new Set<() => void>();

    return {
      addPanel: jest.fn((panel: any) => {
        const ref = panel.position?.referencePanel as string | undefined;
        if (ref && !panels.has(ref)) {
          throw new Error(`referencePanel '${ref}' does not exist`);
        }
        const panelState = {
          id: panel.id as string,
          api: {
            close: () => {
              panels.delete(panel.id as string);
              for (const listener of removeListeners) listener({ id: panel.id as string });
            },
          },
        };
        panels.set(panel.id as string, panelState);
        state.addPanelCalls.push(panel);
        for (const listener of layoutListeners) listener();
        return panelState;
      }),
      getPanel: (id: string) => panels.get(id),
      fromJSON: jest.fn(() => {
        panels.clear();
      }),
      toJSON: jest.fn(() => ({})),
      onDidRemovePanel: (callback: (panel: { id: string }) => void) => {
        removeListeners.add(callback);
        return { dispose: () => removeListeners.delete(callback) };
      },
      onDidLayoutChange: (callback: () => void) => {
        layoutListeners.add(callback);
        return { dispose: () => layoutListeners.delete(callback) };
      },
    };
  };

  const DockviewReact = React.forwardRef(function MockDockviewReact(props: any, ref: React.Ref<HTMLDivElement>) {
    React.useEffect(() => {
      const api = createApi();
      state.api = api;
      props.onReady?.({ api });
    }, [props.onReady]);
    return React.createElement('div', { ref, 'data-testid': 'mock-dockview' });
  });

  return {
    DockviewReact,
    __dockviewMock: {
      reset() {
        state.api = null;
        state.addPanelCalls = [];
      },
      getApi() {
        return state.api;
      },
      getAddPanelCalls() {
        return state.addPanelCalls;
      },
      getPanel(id: string) {
        return state.api?.getPanel(id);
      },
    },
  };
});

function getDockviewMock() {
  return (require('dockview') as { __dockviewMock: any }).__dockviewMock;
}

describe('WorkspaceLayout anchor recovery', () => {
  let storage = new Map<string, string>();
  let consoleErrorSpy: jest.SpyInstance;
  const originalConsoleError = console.error;

  const setStoredLayout = (layoutId: string, json: string) => {
    (globalThis as any).window.localStorage.setItem(`dockview-${layoutId}`, json);
  };

  const flushEffects = async () => {
    await act(async () => {
      await Promise.resolve();
    });
  };

  beforeEach(() => {
    storage = new Map<string, string>();
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    (globalThis as any).window = {
      localStorage: {
        getItem: (key: string) => (storage.has(key) ? storage.get(key)! : null),
        setItem: (key: string, value: string) => {
          storage.set(key, String(value));
        },
        removeItem: (key: string) => {
          storage.delete(key);
        },
        clear: () => {
          storage.clear();
        },
      },
    };
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
      const message = args[0];
      if (
        typeof message === 'string' &&
        (message.includes('react-test-renderer is deprecated') ||
          message.includes('The current testing environment is not configured to support act'))
      ) {
        return;
      }
      originalConsoleError(...(args as Parameters<typeof console.error>));
    });
    getDockviewMock().reset();
  });

  it('adds right rail as root fallback when main is hidden and anchor is missing', async () => {
    setStoredLayout('anchor-hide-main', '{}');

    act(() => {
      TestRenderer.create(
        <WorkspaceLayout layoutId="anchor-hide-main">
          <WorkspaceLayout.Main>
            <WorkspaceLayout.Panel id="main" title="Main">
              {undefined}
            </WorkspaceLayout.Panel>
          </WorkspaceLayout.Main>
          <WorkspaceLayout.Right>
            <WorkspaceLayout.Panel id="right" title="Inspector">
              <div>Inspector</div>
            </WorkspaceLayout.Panel>
          </WorkspaceLayout.Right>
        </WorkspaceLayout>
      );
    });
    await flushEffects();

    expect(getDockviewMock().getPanel('right')).toBeTruthy();

    const calls = getDockviewMock().getAddPanelCalls() as Array<{
      id: string;
      position?: { referencePanel?: string };
    }>;
    const rightCall = calls.find((call) => call.id === 'right');
    expect(rightCall).toBeTruthy();
    expect(rightCall?.position?.referencePanel).not.toBe('main');
  });

  it('re-adds main before right rail and anchors right to main when main is visible', async () => {
    setStoredLayout('anchor-main-visible', '{}');

    act(() => {
      TestRenderer.create(
        <WorkspaceLayout layoutId="anchor-main-visible">
          <WorkspaceLayout.Main>
            <WorkspaceLayout.Panel id="main" title="Main">
              <div>Main</div>
            </WorkspaceLayout.Panel>
          </WorkspaceLayout.Main>
          <WorkspaceLayout.Right>
            <WorkspaceLayout.Panel id="right" title="Inspector">
              <div>Inspector</div>
            </WorkspaceLayout.Panel>
          </WorkspaceLayout.Right>
        </WorkspaceLayout>
      );
    });
    await flushEffects();

    expect(getDockviewMock().getPanel('main')).toBeTruthy();
    expect(getDockviewMock().getPanel('right')).toBeTruthy();

    const calls = getDockviewMock().getAddPanelCalls() as Array<{
      id: string;
      position?: { referencePanel?: string; direction?: string };
    }>;
    const mainIndex = calls.findIndex((call) => call.id === 'main');
    const rightIndex = calls.findIndex((call) => call.id === 'right');

    expect(mainIndex).toBeGreaterThanOrEqual(0);
    expect(rightIndex).toBeGreaterThan(mainIndex);
    expect(calls[rightIndex]?.position?.referencePanel).toBe('main');
    expect(calls[rightIndex]?.position?.direction).toBe('right');
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    delete (globalThis as any).IS_REACT_ACT_ENVIRONMENT;
    delete (globalThis as any).window;
  });
});
