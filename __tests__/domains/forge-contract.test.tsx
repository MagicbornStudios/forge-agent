import React from 'react';
import { renderHook } from '@testing-library/react';
import { useForgeContract } from '@/lib/domains/forge/copilot';

const mockApplyOperations = jest.fn();
const mockOpenOverlay = jest.fn();
const mockRevealSelection = jest.fn();
const mockOnAIHighlight = jest.fn();
const mockClearHighlights = jest.fn();

function wrapper({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

describe('useForgeContract', () => {
  it('returns a contract with domain, getContextSnapshot, createActions, getSuggestions', () => {
    const { result } = renderHook(
      () =>
        useForgeContract({
          graph: null,
          selection: { type: 'none' },
          isDirty: false,
          applyOperations: mockApplyOperations,
          openOverlay: mockOpenOverlay,
          revealSelection: mockRevealSelection,
          onAIHighlight: mockOnAIHighlight,
          clearAIHighlights: mockClearHighlights,
          createNodeOverlayId: 'create-node',
        }),
      { wrapper },
    );

    const contract = result.current;
    expect(contract.domain).toBe('forge');
    expect(typeof contract.getContextSnapshot).toBe('function');
    expect(typeof contract.createActions).toBe('function');
    expect(typeof contract.getSuggestions).toBe('function');
    expect(typeof contract.getInstructions).toBe('function');
    expect(typeof contract.onAIHighlight).toBe('function');
    expect(typeof contract.clearAIHighlights).toBe('function');
  });

  it('getContextSnapshot returns domain and workspaceId', () => {
    const { result } = renderHook(
      () =>
        useForgeContract({
          graph: null,
          selection: { type: 'none' },
          isDirty: false,
          applyOperations: mockApplyOperations,
          openOverlay: mockOpenOverlay,
          revealSelection: mockRevealSelection,
          onAIHighlight: mockOnAIHighlight,
          clearAIHighlights: mockClearHighlights,
          createNodeOverlayId: 'create-node',
        }),
      { wrapper },
    );

    const snapshot = result.current.getContextSnapshot();
    expect(snapshot.domain).toBe('forge');
    expect(snapshot.workspaceId).toBe('forge');
  });

  it('createActions returns actions with forge_ prefix', () => {
    const { result } = renderHook(
      () =>
        useForgeContract({
          graph: null,
          selection: { type: 'none' },
          isDirty: false,
          applyOperations: mockApplyOperations,
          openOverlay: mockOpenOverlay,
          revealSelection: mockRevealSelection,
          onAIHighlight: mockOnAIHighlight,
          clearAIHighlights: mockClearHighlights,
          createNodeOverlayId: 'create-node',
        }),
      { wrapper },
    );

    const actions = result.current.createActions();
    expect(Array.isArray(actions)).toBe(true);
    const names = actions.map((a) => a.name);
    expect(names.some((n) => n.startsWith('forge_'))).toBe(true);
    expect(names).toContain('forge_createNode');
    expect(names).toContain('forge_getGraph');
  });
});
