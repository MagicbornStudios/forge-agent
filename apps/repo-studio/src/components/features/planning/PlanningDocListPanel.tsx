'use client';

import * as React from 'react';
import { syncDataLoaderFeature } from '@headless-tree/core';
import { useTree } from '@headless-tree/react';
import { FileText } from 'lucide-react';
import type { PlanningSnapshot } from '@/lib/repo-data';
import type { PlanningDocTreeNode } from './planning-doc-tree-data';
import { buildPlanningDocTreeData } from './planning-doc-tree-data';
import { Tree, TreeItem, TreeItemLabel } from '@/components/ui/tree';

export interface PlanningDocListPanelProps {
  planning: PlanningSnapshot;
  selectedDocId: string | null;
  onOpenDoc: (docId: string) => void;
}

const TREE_INDENT = 20;

export function PlanningDocListPanel({
  planning,
  selectedDocId,
  onOpenDoc,
}: PlanningDocListPanelProps) {
  const treeData = React.useMemo(
    () => buildPlanningDocTreeData(planning.docs),
    [planning.docs],
  );

  const rootItemId = treeData.rootItemId || '.planning';
  const defaultExpanded = React.useMemo(() => {
    const expanded = [rootItemId];
    const phasesId = '.planning/phases';
    if (rootItemId === '.planning' && treeData.getChildren('.planning').includes(phasesId)) {
      expanded.push(phasesId);
    }
    return expanded;
  }, [rootItemId, treeData]);

  const tree = useTree<PlanningDocTreeNode>({
    dataLoader: {
      getItem: treeData.getItem,
      getChildren: treeData.getChildren,
    },
    features: [syncDataLoaderFeature],
    getItemName: (item) => item.getItemData().name,
    indent: TREE_INDENT,
    initialState: { expandedItems: defaultExpanded },
    isItemFolder: (item) => item.getItemData().docId === undefined,
    rootItemId,
  });

  return (
    <div className="flex h-full min-h-0 flex-col overflow-auto p-2">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <FileText size={12} />
          Doc list
        </div>
        <div className="min-h-0 flex-1 overflow-auto rounded-md border border-border p-1">
          <Tree tree={tree} indent={TREE_INDENT}>
            {tree.getItems().map((item) => (
              <TreeItem item={item} key={item.getId()}>
                <TreeItemLabel
                  item={item}
                  onLeafClick={onOpenDoc}
                  className={
                    item.getItemData().docId && selectedDocId === item.getItemData().docId
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
