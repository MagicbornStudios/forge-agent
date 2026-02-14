'use client';

import * as React from 'react';
import { Badge } from '@forge/ui/badge';
import { Button } from '@forge/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@forge/ui/card';
import { Input } from '@forge/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@forge/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@forge/ui/table';
import type { RepoCommandEntry } from '@/lib/repo-data';
import type { RepoCommandView } from '@/lib/types';
import type { CommandRow } from '@/components/hooks/useCommandFilters';

export interface CommandsWorkspaceProps {
  commandView: RepoCommandView;
  commandSources: Array<'all' | RepoCommandEntry['source']>;
  filteredCommands: CommandRow[];
  onSetView: (next: Partial<RepoCommandView>) => void;
  onRunCommand: (commandId: string) => void;
  onToggleCommand: (commandId: string, disabled: boolean) => void;
  onCopyText: (text: string) => void;
}

export function CommandsWorkspace({
  commandView,
  commandSources,
  filteredCommands,
  onSetView,
  onRunCommand,
  onToggleCommand,
  onCopyText,
}: CommandsWorkspaceProps) {
  return (
    <div className="h-full min-h-0 space-y-3 overflow-auto p-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Command Center</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <div className="flex gap-1 rounded-md border border-border p-1">
              <Button
                size="sm"
                variant={commandView.tab === 'recommended' ? 'default' : 'ghost'}
                onClick={() => onSetView({ tab: 'recommended' })}
              >
                Recommended
              </Button>
              <Button
                size="sm"
                variant={commandView.tab === 'all' ? 'default' : 'ghost'}
                onClick={() => onSetView({ tab: 'all' })}
              >
                All
              </Button>
              <Button
                size="sm"
                variant={commandView.tab === 'blocked' ? 'default' : 'ghost'}
                onClick={() => onSetView({ tab: 'blocked' })}
              >
                Blocked
              </Button>
            </div>

            <Input
              value={commandView.query}
              onChange={(event) => onSetView({ query: event.target.value })}
              placeholder="Search command ID/source/script"
              className="w-full md:w-80"
            />

            <Select value={commandView.source} onValueChange={(value) => onSetView({ source: value })}>
              <SelectTrigger className="w-[220px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {commandSources.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={commandView.status} onValueChange={(value) => onSetView({ status: value as RepoCommandView['status'] })}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Status: all</SelectItem>
                <SelectItem value="allowed">Status: allowed</SelectItem>
                <SelectItem value="blocked">Status: blocked</SelectItem>
              </SelectContent>
            </Select>

            <Select value={commandView.sort} onValueChange={(value) => onSetView({ sort: value as RepoCommandView['sort'] })}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id">Sort: ID</SelectItem>
                <SelectItem value="source">Sort: Source</SelectItem>
                <SelectItem value="command">Sort: Command</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="max-h-[54vh] overflow-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Command</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[320px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCommands.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-mono text-xs">{entry.id}</TableCell>
                    <TableCell>{entry.source}</TableCell>
                    <TableCell className="font-mono text-xs">{entry.command}</TableCell>
                    <TableCell>
                      <Badge variant={entry.blocked ? 'secondary' : 'outline'}>
                        {entry.blocked ? 'blocked' : 'allowed'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => onRunCommand(entry.id)} disabled={entry.blocked === true}>
                          Run
                        </Button>
                        <Button
                          size="sm"
                          variant={entry.blocked ? 'default' : 'ghost'}
                          onClick={() => onToggleCommand(entry.id, !(entry.blocked === true))}
                        >
                          {entry.blocked ? 'Enable' : 'Disable'}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => onCopyText(entry.command)}>
                          Copy
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

