'use client';

import type { StorageBreakdownRow } from '@/lib/api/studio';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function formatBytes(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let amount = value;
  let unitIndex = 0;
  while (amount >= 1024 && unitIndex < units.length - 1) {
    amount /= 1024;
    unitIndex += 1;
  }
  const decimals = unitIndex <= 1 ? 0 : 2;
  return `${amount.toFixed(decimals)} ${units[unitIndex]}`;
}

type StorageBreakdownTableProps = {
  rows: StorageBreakdownRow[] | undefined;
  groupBy: 'org' | 'user' | 'project';
};

export function StorageBreakdownTable({ rows, groupBy }: StorageBreakdownTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Storage breakdown</CardTitle>
        <CardDescription>
          Grouped by {groupBy === 'org' ? 'organization' : groupBy}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!rows || rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No storage rows for this organization.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entity</TableHead>
                <TableHead className="text-right">Media</TableHead>
                <TableHead className="text-right">Project</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={`${row.entityType}:${row.entityId ?? 'none'}`}>
                  <TableCell className="font-medium">{row.label}</TableCell>
                  <TableCell className="text-right">{formatBytes(row.mediaBytes)}</TableCell>
                  <TableCell className="text-right">{formatBytes(row.projectBytes)}</TableCell>
                  <TableCell className="text-right">{formatBytes(row.totalBytes)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
