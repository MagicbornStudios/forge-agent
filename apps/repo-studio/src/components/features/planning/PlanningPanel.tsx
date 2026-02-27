'use client';

import * as React from 'react';
import {
  BookOpen,
  Bot,
  ClipboardCopy,
  FileText,
  Layers,
  ListTodo,
  Loader2,
} from 'lucide-react';
import { Badge } from '@forge/ui/badge';
import { Button } from '@forge/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@forge/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@forge/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@forge/ui/tabs';
import { toErrorMessage } from '@/lib/api/http';
import { fetchPlanningModel } from '@/lib/api/services';
import type { PlanningStructuredModelResponse } from '@/lib/api/types';
import type { PlanningSnapshot, RepoLoopEntry } from '@/lib/repo-data';

type PlanningTabId = 'phases' | 'tasks' | 'documents';

function normalizeStatus(status: string) {
  return String(status || '').toLowerCase().replace(/\s+/g, '-');
}

export interface PlanningPanelProps {
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

export function PlanningPanel({
  planning,
  activeLoopId,
  selectedDocId,
  onSelectDoc,
  onCopyMentionToken,
  onCopyText,
  onOpenAssistant,
  selectedDocContent,
}: PlanningPanelProps) {
  const [planningTab, setPlanningTab] = React.useState<PlanningTabId>('phases');
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

  const tabContentClass = 'min-h-0 flex-1 overflow-auto data-[state=inactive]:hidden';

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden p-2">
      <Tabs
        value={planningTab}
        onValueChange={(v) => setPlanningTab(v as PlanningTabId)}
        className="flex min-h-0 flex-1 flex-col"
      >
        <TabsList className="w-full shrink-0 justify-start gap-1">
          <TabsTrigger value="phases" className="gap-1.5">
            <Layers size={14} />
            Phases
          </TabsTrigger>
          <TabsTrigger value="tasks" className="gap-1.5">
            <ListTodo size={14} />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-1.5">
            <FileText size={14} />
            Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="phases" className={tabContentClass}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Layers size={14} />
                Phases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[70vh] overflow-auto rounded-md border border-border">
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
                        <TableCell className="font-medium">
                          {row.phaseNumber} - {row.phaseName}
                        </TableCell>
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
        </TabsContent>

        <TabsContent value="tasks" className={tabContentClass}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <ListTodo size={14} />
                Task Registry
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[70vh] overflow-auto rounded-md border border-border">
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
                          <Badge
                            variant={
                              normalizeStatus(row.status) === 'complete' ? 'default' : 'secondary'
                            }
                          >
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
        </TabsContent>

        <TabsContent value="documents" className={tabContentClass}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <FileText size={14} />
                Planning Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {structuredLoading ? (
                  <Badge variant="secondary" className="gap-1">
                    <Loader2 size={12} className="animate-spin" />
                    loading model
                  </Badge>
                ) : null}
                {structuredMessage ? (
                  <Badge variant="destructive">{structuredMessage}</Badge>
                ) : null}
                {selectedDoc ? (
                  <>
                    <Button size="sm" variant="outline" onClick={onCopyMentionToken}>
                      <ClipboardCopy size={12} className="mr-1" />
                      Copy @ token
                    </Button>
                    <Button size="sm" variant="outline" onClick={onOpenAssistant}>
                      <Bot size={12} className="mr-1" />
                      Assistant
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onCopyText(selectedDoc.content)}
                    >
                      <ClipboardCopy size={12} className="mr-1" />
                      Copy Doc
                    </Button>
                  </>
                ) : null}
              </div>

              <div className="grid min-h-0 grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                <div className="flex min-h-0 flex-col">
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <FileText size={12} />
                    Doc list
                  </div>
                  <div className="min-h-[40vh] flex-1 overflow-auto rounded-md border border-border">
                    <ul className="p-1">
                      {planning.docs.map((doc) => (
                        <li key={doc.id}>
                          <button
                            type="button"
                            onClick={() => onSelectDoc(doc.id)}
                            className={`w-full cursor-pointer truncate rounded px-2 py-1.5 text-left text-xs hover:bg-accent ${
                              selectedDocId === doc.id ? 'bg-accent font-medium' : ''
                            }`}
                            title={doc.filePath}
                          >
                            {doc.filePath}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="flex min-h-0 min-w-0 flex-col">
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <BookOpen size={12} />
                    Viewport
                  </div>
                  <pre className="min-h-[40vh] flex-1 overflow-auto rounded-md border border-border bg-muted/30 p-3 text-xs">
                    {selectedDocContent || 'Select a planning document from the list.'}
                  </pre>
                </div>
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
                              checklist {selectedStructuredDoc.checklists.open}/
                              {selectedStructuredDoc.checklists.total} open
                            </Badge>
                            {selectedStructuredDoc.warnings.length > 0 ? (
                              <Badge variant="destructive">
                                {selectedStructuredDoc.warnings.length} warning(s)
                              </Badge>
                            ) : null}
                          </div>
                          {selectedStructuredDoc.planModel ? (
                            <div className="rounded-md border border-border p-2">
                              <div className="font-semibold">Plan Metadata</div>
                              <div>phase: {selectedStructuredDoc.planModel.phase}</div>
                              <div>plan: {selectedStructuredDoc.planModel.plan}</div>
                              <div>wave: {selectedStructuredDoc.planModel.wave}</div>
                              <div>
                                depends: {selectedStructuredDoc.planModel.dependsOn.join(', ') || '(none)'}
                              </div>
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
                        <p className="text-muted-foreground">
                          Select a planning document to view structured details.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
