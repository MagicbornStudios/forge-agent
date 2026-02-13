'use client';

import * as React from 'react';
import { Code2, RefreshCw } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@forge/ui/tabs';
import { Button } from '@forge/ui/button';
import { Separator } from '@forge/ui/separator';
import { cn } from '@forge/ui/lib/utils';
import type { BlockViewMode } from './types';

interface BlockViewToolbarProps {
  mode: BlockViewMode;
  onModeChange: (mode: BlockViewMode) => void;
}

export function BlockViewToolbar({
  mode,
  onModeChange,
}: BlockViewToolbarProps) {
  return (
    <div
      data-slot="block-view-toolbar"
    >
      <Tabs
        value={mode}
        onValueChange={(nextMode) => onModeChange(nextMode as BlockViewMode)}
        className=""
        data-slot="block-view-tabs"
      >
        <TabsList >
          <TabsTrigger value="preview" >
            Preview
          </TabsTrigger>
          <TabsTrigger value="code" >
            Code
          </TabsTrigger>
        </TabsList>
      </Tabs>


    </div>
  );
}

