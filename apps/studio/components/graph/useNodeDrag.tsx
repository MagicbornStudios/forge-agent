'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';

interface NodeDragContextValue {
  draggedType: string | null;
  setDraggedType: (type: string | null) => void;
  isDragging: boolean;
}

const NodeDragContext = createContext<NodeDragContextValue | null>(null);

export function NodeDragProvider({ children }: { children: React.ReactNode }) {
  const [draggedType, setDraggedTypeState] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const setDraggedType = useCallback((type: string | null) => {
    setDraggedTypeState(type);
    setIsDragging(type !== null);
  }, []);

  return (
    <NodeDragContext.Provider value={{ draggedType, setDraggedType, isDragging }}>
      {children}
    </NodeDragContext.Provider>
  );
}

export function useNodeDrag() {
  const ctx = useContext(NodeDragContext);
  if (!ctx) throw new Error('useNodeDrag must be used within NodeDragProvider');
  return ctx;
}
