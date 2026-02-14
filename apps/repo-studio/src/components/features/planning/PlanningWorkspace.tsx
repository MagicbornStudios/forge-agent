'use client';

import * as React from 'react';
import { Badge } from '@forge/ui/badge';
import { Button } from '@forge/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@forge/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@forge/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@forge/ui/table';
import type { PlanningSnapshot } from '@/lib/repo-data';

function normalizeStatus(status: string) {
  return String(status || '').toLowerCase().replace(/\s+/g, '-');
}

export interface PlanningWorkspaceProps {
  planning: PlanningSnapshot;
  selectedDocId: string | null;
  onSelectDoc: (docId: string) => void;
  onAttachSelected: () => void;
  onCopyText: (text: string) => void;
  onOpenAssistant: () => void;
  selectedDocContent: string;
}

export function PlanningWorkspace({
  planning,
  selectedDocId,
  onSelectDoc,
  onAttachSelected,
  onCopyText,
  onOpenAssistant,
  selectedDocContent,
}: PlanningWorkspaceProps) {
  const selectedDoc = planning.docs.find((doc) => doc.id === selectedDocId) || null;

  return (
    <div className="h-full min-h-0 space-y-3 overflow-auto p-2">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Loop Progress</CardTitle>
          </CardHeader>
          <CardContent className="text-xs">
            <div className="font-semibold">{planning.percent}%</div>
            <div className="mt-1 text-muted-foreground">{planning.rows.length} phases tracked</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Next Action</CardTitle>
          </CardHeader>
          <CardContent className="text-xs">
            <code className="block whitespace-normal break-all">{planning.nextAction}</code>
            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => onCopyText(planning.nextAction)}>
                Copy
              </Button>
              <Button size="sm" variant="outline" onClick={onOpenAssistant}>
                Open Assistant
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Artifacts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-xs">
            <div>Summaries: {planning.summaries}</div>
            <div>Verifications: {planning.verifications}</div>
            <div>Docs loaded: {planning.docs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Open Issues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-xs">
            <div>Decisions open: {planning.decisionOpen}</div>
            <div>Errors open: {planning.errorOpen}</div>
            <div>Tasks: {planning.tasks.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Phases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-56 overflow-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Phase</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Plans</TableHead>
                  <TableHead>Summaries</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {planning.rows.map((row) => (
                  <TableRow key={`${row.phaseNumber}-${row.phaseName}`}>
                    <TableCell className="font-medium">{row.phaseNumber} - {row.phaseName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{row.status}</Badge>
                    </TableCell>
                    <TableCell>{row.plans}</TableCell>
                    <TableCell>{row.summaries}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Task Registry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-72 overflow-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {planning.tasks.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-xs">{row.id}</TableCell>
                    <TableCell>{row.title}</TableCell>
                    <TableCell>{row.area}</TableCell>
                    <TableCell>
                      <Badge variant={normalizeStatus(row.status) === 'complete' ? 'default' : 'secondary'}>
                        {row.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Planning Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={selectedDocId || ''} onValueChange={onSelectDoc}>
              <SelectTrigger className="w-full md:w-[460px]">
                <SelectValue placeholder="Select planning doc" />
              </SelectTrigger>
              <SelectContent>
                {planning.docs.map((doc) => (
                  <SelectItem key={doc.id} value={doc.id}>
                    {doc.filePath}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedDoc ? (
              <Button size="sm" variant="outline" onClick={onAttachSelected}>
                Attach To Assistant
              </Button>
            ) : null}
            {selectedDoc ? (
              <Button size="sm" variant="outline" onClick={() => onCopyText(selectedDoc.content)}>
                Copy Doc
              </Button>
            ) : null}
          </div>

          <pre className="max-h-[42vh] overflow-auto rounded-md border border-border bg-background p-3 text-xs">
            {selectedDocContent || 'No planning document selected.'}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

