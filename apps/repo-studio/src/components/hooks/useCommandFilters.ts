'use client';

import * as React from 'react';
import { useRepoStudioShellStore } from '@/lib/app-shell/store';
import type { RepoCommandEntry } from '@/lib/repo-data';

export type CommandRow = RepoCommandEntry & {
  blocked?: boolean;
  blockedBy?: string | null;
  recommended?: boolean;
};

function normalizeRows(rows: RepoCommandEntry[]) {
  return rows as CommandRow[];
}

export function useCommandFilters(commandRows: RepoCommandEntry[]) {
  const commandView = useRepoStudioShellStore((state) => state.commandView);
  const setCommandView = useRepoStudioShellStore((state) => state.setCommandView);
  const [rows, setRows] = React.useState<CommandRow[]>(normalizeRows(commandRows));

  React.useEffect(() => {
    setRows(normalizeRows(commandRows));
  }, [commandRows]);

  const commandSources = React.useMemo(
    () => ['all', ...new Set(rows.map((entry) => entry.source))] as Array<'all' | RepoCommandEntry['source']>,
    [rows],
  );

  const filteredCommands = React.useMemo(() => {
    const query = commandView.query.trim().toLowerCase();
    const sorted = [...rows].sort((a, b) => {
      if (commandView.sort === 'source') return a.source.localeCompare(b.source) || a.id.localeCompare(b.id);
      if (commandView.sort === 'command') return a.command.localeCompare(b.command);
      return a.id.localeCompare(b.id);
    });

    return sorted.filter((entry) => {
      if (commandView.tab === 'recommended' && entry.recommended !== true) return false;
      if (commandView.tab === 'blocked' && entry.blocked !== true) return false;
      if (commandView.status === 'allowed' && entry.blocked === true) return false;
      if (commandView.status === 'blocked' && entry.blocked !== true) return false;
      if (commandView.source !== 'all' && entry.source !== commandView.source) return false;
      if (!query) return true;
      return `${entry.id} ${entry.command} ${entry.source}`.toLowerCase().includes(query);
    });
  }, [rows, commandView]);

  return {
    commandView,
    setCommandView,
    commandRows: rows,
    setCommandRows: setRows,
    commandSources,
    filteredCommands,
  };
}

