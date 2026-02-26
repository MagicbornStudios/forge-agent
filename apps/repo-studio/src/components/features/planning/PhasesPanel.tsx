'use client';

import { Layers } from 'lucide-react';
import { Badge } from '@forge/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@forge/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@forge/ui/table';
import type { PlanningSnapshot } from '@/lib/repo-data';

export interface PhasesPanelProps {
  planning: PlanningSnapshot;
}

export function PhasesPanel({ planning }: PhasesPanelProps) {
  return (
    <div className="h-full min-h-0 overflow-auto p-2">
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
    </div>
  );
}
