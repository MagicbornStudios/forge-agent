'use client';

import { ListTodo } from 'lucide-react';
import { Badge } from '@forge/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@forge/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@forge/ui/table';
import type { PlanningSnapshot } from '@/lib/repo-data';

function normalizeStatus(status: string) {
  return String(status || '').toLowerCase().replace(/\s+/g, '-');
}

export interface TasksPanelProps {
  planning: PlanningSnapshot;
}

export function TasksPanel({ planning }: TasksPanelProps) {
  return (
    <div className="h-full min-h-0 overflow-auto p-2">
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
    </div>
  );
}
