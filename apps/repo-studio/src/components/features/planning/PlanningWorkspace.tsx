'use client';

import * as React from 'react';
import { Badge } from '@forge/ui/badge';
import { Button } from '@forge/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@forge/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@forge/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@forge/ui/table';
import { toErrorMessage } from '@/lib/api/http';
import { fetchPlanningModel } from '@/lib/api/services';
import type { PlanningStructuredModelResponse } from '@/lib/api/types';
import type { PlanningSnapshot, RepoLoopEntry } from '@/lib/repo-data';

function normalizeStatus(status: string) {
  return String(status || '').toLowerCase().replace(/\s+/g, '-');
}

export interface PlanningWorkspaceProps {
  planning: PlanningSnapshot;
  loops: RepoLoopEntry[];
  activeLoopId: string;
  switchingLoop?: boolean;
  selectedDocId: string | null;
  onSelectDoc: (docId: string) => void;
  onSwitchLoop: (loopId: string) => void;
  onCopyMentionToken: () => void;
  onCopyText: (text: string) => void;
  onOpenAssistant: () => void;
  selectedDocContent: string;
}

export function PlanningWorkspace({
  planning,
  loops,
  activeLoopId,
  switchingLoop = false,
  selectedDocId,
  onSelectDoc,
  onSwitchLoop,
  onCopyMentionToken,
  onCopyText,
  onOpenAssistant,
  selectedDocContent,
}: PlanningWorkspaceProps) {
  const selectedDoc = planning.docs.find((doc) => doc.id === selectedDocId) || null;
  const [structuredModel, setStructuredModel] = React.useState<PlanningStructuredModelResponse | null>(null);
  const [structuredLoading, setStructuredLoading] = React.useState(false);
  const [structuredMessage, setStructuredMessage] = React.useState('');

  React.useEffect(() => {
    let mounted = true;
    async function loadModel() {
      setStructuredLoading(true);
      try {
        const payload = await fetchPlanningModel(activeLoopId);
        if (!mounted) return;
        if (!payload.ok) {
          setStructuredMessage(payload.message || 'Unable to load structured planning model.');
          setStructuredModel(null);
          return;
        }
        setStructuredModel(payload);
        setStructuredMessage('');
      } catch (error) {
        if (!mounted) return;
        setStructuredModel(null);
        setStructuredMessage(toErrorMessage(error, 'Unable to load structured planning model.'));
      } finally {
        if (mounted) setStructuredLoading(false);
      }
    }

    loadModel().catch(() => {});
    return () => {
      mounted = false;
    };
  }, [activeLoopId, planning.docs]);

  const selectedStructuredDoc = structuredModel?.docs?.find((doc) => doc.id === selectedDocId) || null;

  return (
    <div className="h-full min-h-0 space-y-3 overflow-auto p-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Loop Selection</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2 text-xs">
          <Select value={activeLoopId} onValueChange={onSwitchLoop}>
            <SelectTrigger className="w-full md:w-[320px]">
              <SelectValue placeholder="Select active loop" />
            </SelectTrigger>
            <SelectContent>
              {loops.map((loop) => (
                <SelectItem key={loop.id} value={loop.id}>
                  {loop.name} ({loop.id})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="outline">active: {activeLoopId}</Badge>
          <Badge variant="secondary">root: {planning.planningRoot}</Badge>
          {switchingLoop ? <Badge variant="secondary">switching...</Badge> : null}
        </CardContent>
      </Card>

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
              <Button size="sm" variant="outline" onClick={onCopyMentionToken}>
                Copy @ token
              </Button>
            ) : null}
            {selectedDoc ? (
              <Button size="sm" variant="outline" onClick={onOpenAssistant}>
                Open Assistant
              </Button>
            ) : null}
            {selectedDoc ? (
              <Button size="sm" variant="outline" onClick={() => onCopyText(selectedDoc.content)}>
                Copy Doc
              </Button>
            ) : null}
            {structuredLoading ? <Badge variant="secondary">loading structured model</Badge> : null}
            {structuredMessage ? <Badge variant="destructive">{structuredMessage}</Badge> : null}
          </div>

          {structuredModel ? (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs">Structured Docs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-xs">
                  <div>Docs: {structuredModel.aggregate.docCount}</div>
                  <div>Plan Docs: {structuredModel.aggregate.planDocCount}</div>
                  <div>Warnings: {structuredModel.aggregate.warningCount}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs">Checklist Totals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-xs">
                  <div>Total: {structuredModel.aggregate.checklist.total}</div>
                  <div>Open: {structuredModel.aggregate.checklist.open}</div>
                  <div>Closed: {structuredModel.aggregate.checklist.closed}</div>
                </CardContent>
              </Card>
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs">Selected Document Model</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  {selectedStructuredDoc ? (
                    <>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{selectedStructuredDoc.filePath}</Badge>
                        <Badge variant="secondary">
                          checklist {selectedStructuredDoc.checklists.open}/{selectedStructuredDoc.checklists.total} open
                        </Badge>
                        {selectedStructuredDoc.warnings.length > 0 ? (
                          <Badge variant="destructive">{selectedStructuredDoc.warnings.length} warning(s)</Badge>
                        ) : null}
                      </div>
                      {selectedStructuredDoc.planModel ? (
                        <div className="rounded-md border border-border p-2">
                          <div className="font-semibold">Plan Metadata</div>
                          <div>phase: {selectedStructuredDoc.planModel.phase}</div>
                          <div>plan: {selectedStructuredDoc.planModel.plan}</div>
                          <div>wave: {selectedStructuredDoc.planModel.wave}</div>
                          <div>depends: {selectedStructuredDoc.planModel.dependsOn.join(', ') || '(none)'}</div>
                        </div>
                      ) : null}
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                        <div className="rounded-md border border-border p-2">
                          <div className="font-semibold">Objective</div>
                          <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                            {selectedStructuredDoc.sections.objective || 'n/a'}
                          </p>
                        </div>
                        <div className="rounded-md border border-border p-2">
                          <div className="font-semibold">Context</div>
                          <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                            {selectedStructuredDoc.sections.context || 'n/a'}
                          </p>
                        </div>
                        <div className="rounded-md border border-border p-2">
                          <div className="font-semibold">Tasks</div>
                          <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                            {selectedStructuredDoc.sections.tasks || 'n/a'}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-muted-foreground">Select a planning document to view structured details.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : null}

          <details>
            <summary className="cursor-pointer text-xs text-muted-foreground">Raw Markdown (debug)</summary>
            <pre className="mt-2 max-h-[42vh] overflow-auto rounded-md border border-border bg-background p-3 text-xs">
              {selectedDocContent || 'No planning document selected.'}
            </pre>
          </details>
        </CardContent>
      </Card>
    </div>
  );
}
