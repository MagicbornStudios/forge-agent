'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { Button } from '@forge/ui/button';
import { exportToYarn, createMinimalContext } from '@forge/yarn-converter';
import { exportYarnFull } from '@/lib/api-client/forge-yarn';
import type { ForgeGraphDoc } from '@forge/types';
import { Download } from 'lucide-react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const YARN_PANEL_ID = 'yarn';

interface YarnPanelProps {
  /** Current graph for preview (current-graph-only) */
  graph: ForgeGraphDoc | null;
  /** Graph id for full download (resolves storylet/detour server-side) */
  graphId: number | null;
}

export function YarnPanel({ graph, graphId }: YarnPanelProps) {
  const [yarnPreview, setYarnPreview] = useState('');
  const [isLoadingFull, setIsLoadingFull] = useState(false);

  const refreshPreview = useCallback(async () => {
    if (!graph) {
      setYarnPreview('');
      return;
    }
    try {
      const yarn = await exportToYarn(graph, createMinimalContext());
      setYarnPreview(yarn || '// No nodes to export');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Preview failed';
      setYarnPreview(`// Error: ${msg}`);
    }
  }, [graph]);

  useEffect(() => {
    refreshPreview();
  }, [refreshPreview]);

  const handleDownload = useCallback(async () => {
    if (!graphId) {
      toast.error('No graph loaded');
      return;
    }
    setIsLoadingFull(true);
    try {
      const { yarn } = await exportYarnFull(graphId);
      const blob = new Blob([yarn], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${graph?.title ?? 'dialogue'}.yarn`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Yarn file downloaded');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Download failed';
      toast.error(msg);
    } finally {
      setIsLoadingFull(false);
    }
  }, [graphId, graph?.title]);

  const editorOptions = useMemo(
    () => ({
      readOnly: true,
      minimap: { enabled: false },
      fontSize: 12,
      lineNumbers: 'on' as const,
      wordWrap: 'on' as const,
      scrollBeyondLastLine: false,
    }),
    []
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-editor-border px-[var(--panel-padding)] py-[var(--control-padding-y)]">
        <span className="text-xs font-medium text-foreground">Yarn</span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={!graphId || isLoadingFull}
          className="gap-1"
        >
          <Download size={12} />
          {isLoadingFull ? 'Exporting…' : 'Download (.yarn)'}
        </Button>
      </div>
      <div className="flex-1 min-h-0">
        {graph ? (
          <MonacoEditor
            height="100%"
            language="plaintext"
            value={yarnPreview}
            options={editorOptions}
            theme="vs-dark"
            loading={
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                Loading…
              </div>
            }
          />
        ) : (
          <div className="flex h-full items-center justify-center p-4 text-center text-xs text-muted-foreground">
            Select a graph to view Yarn preview
          </div>
        )}
      </div>
    </div>
  );
}

export { YARN_PANEL_ID };
