'use client';

import * as React from 'react';
import { syncDataLoaderFeature } from '@headless-tree/core';
import { useTree } from '@headless-tree/react';
import { FileText } from 'lucide-react';
import { toErrorMessage } from '@/lib/api/http';
import { fetchEnvScopes, fetchEnvFiles } from '@/lib/api/services';
import type { EnvScopeEntry, EnvFileEntry } from '@/lib/api/types';
import { Tree, TreeItem, TreeItemLabel } from '@/components/ui/tree';
import {
  buildEnvScopeTreeData,
  ENV_SCOPES_ROOT_ITEM_ID,
  type EnvScopeTreeNode,
} from './env-scope-tree-data';

export interface EnvScopeListPanelProps {
  selectedFilePath: string | null;
  onOpenFile: (filePath: string) => void;
}

const TREE_INDENT = 20;

export function EnvScopeListPanel({
  selectedFilePath,
  onOpenFile,
}: EnvScopeListPanelProps) {
  const [scopes, setScopes] = React.useState<EnvScopeEntry[]>([]);
  const [filesByDir, setFilesByDir] = React.useState<Record<string, EnvFileEntry[]>>({});
  const [loading, setLoading] = React.useState(true);
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setMessage('');
    (async () => {
      try {
        const scopesRes = await fetchEnvScopes();
        if (!scopesRes.ok || !Array.isArray(scopesRes.scopes)) {
          setScopes([]);
          setLoading(false);
          return;
        }
        const scopeList = scopesRes.scopes;
        if (cancelled) return;
        setScopes(scopeList);

        const results = await Promise.all(
          scopeList.map((s) => fetchEnvFiles(s.dir)),
        );
        if (cancelled) return;
        const byDir: Record<string, EnvFileEntry[]> = {};
        for (let i = 0; i < scopeList.length; i++) {
          const res = results[i];
          if (res?.ok && Array.isArray(res.files)) {
            byDir[scopeList[i]!.dir] = res.files;
          } else {
            byDir[scopeList[i]!.dir] = [];
          }
        }
        setFilesByDir(byDir);
      } catch (err) {
        if (!cancelled) {
          setMessage(toErrorMessage(err, 'Unable to load env scopes.'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const treeData = React.useMemo(
    () => buildEnvScopeTreeData(scopes, filesByDir),
    [scopes, filesByDir],
  );

  const defaultExpanded = React.useMemo(
    () => [ENV_SCOPES_ROOT_ITEM_ID, ...scopes.map((s) => s.id)],
    [scopes],
  );

  const tree = useTree<EnvScopeTreeNode>({
    dataLoader: {
      getItem: treeData.getItem,
      getChildren: treeData.getChildren,
    },
    features: [syncDataLoaderFeature],
    getItemName: (item) => item.getItemData().name,
    indent: TREE_INDENT,
    initialState: { expandedItems: defaultExpanded },
    isItemFolder: (item) => item.getItemData().docId === undefined,
    rootItemId: treeData.rootItemId,
  });

  if (loading) {
    return (
      <div className="flex h-full min-h-0 flex-col overflow-auto p-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <FileText size={12} />
          Env
        </div>
        <div className="py-4 text-center text-xs text-muted-foreground">
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-auto p-2">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <FileText size={12} />
          Env
        </div>
        {message ? (
          <p className="mb-2 text-xs text-destructive">{message}</p>
        ) : null}
        <div className="min-h-0 flex-1 overflow-auto rounded-md border border-border p-1">
          <Tree tree={tree} indent={TREE_INDENT}>
            {tree.getItems().map((item) => (
              <TreeItem item={item} key={item.getId()}>
                <TreeItemLabel
                  item={item}
                  onLeafClick={onOpenFile}
                  className={
                    item.getItemData().docId &&
                    selectedFilePath === item.getItemData().docId
                      ? 'bg-accent font-medium'
                      : ''
                  }
                />
              </TreeItem>
            ))}
          </Tree>
        </div>
      </div>
    </div>
  );
}
