'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth/AuthProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { createApiKey, revokeApiKey, type ApiKeyScope } from '@/lib/api/studio';
import { useApiKeys } from '@/lib/data/hooks/use-dashboard-data';
import { PLATFORM_QUERY_KEYS } from '@/lib/data/keys';

const SCOPE_OPTIONS: Array<{ label: string; value: ApiKeyScope; description: string }> = [
  { label: 'Assistant chat', value: 'ai.chat', description: '/api/assistant-chat' },
  { label: 'Plan generation', value: 'ai.plan', description: '/api/forge/plan' },
  { label: 'Structured output', value: 'ai.structured', description: '/api/structured-output' },
  { label: 'Image generation', value: 'ai.image', description: '/api/image-generate' },
];

function formatDate(value: string | null): string {
  if (!value) return '-';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '-';
  return date.toLocaleString();
}

function formatUsd(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 4,
  }).format(value);
}

export default function DashboardApiKeysPage() {
  const { user, isLoading: authLoading, activeOrganization, activeOrganizationId } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [includeAllScope, setIncludeAllScope] = useState(true);
  const [selectedScopes, setSelectedScopes] = useState<ApiKeyScope[]>([]);
  const [expiryPreset, setExpiryPreset] = useState<'none' | '30d' | '90d'>('none');
  const [createdApiKey, setCreatedApiKey] = useState<string | null>(null);

  const apiKeysQuery = useApiKeys(activeOrganizationId, !!user);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?returnUrl=/dashboard/api-keys');
    }
  }, [authLoading, user, router]);

  const createKeyMutation = useMutation({
    mutationFn: async () => {
      const name = keyName.trim();
      if (name.length < 3) {
        throw new Error('Key name must be at least 3 characters.');
      }

      const scopes: ApiKeyScope[] = includeAllScope
        ? ['ai.*']
        : selectedScopes.length > 0
          ? selectedScopes
          : [];
      if (scopes.length === 0) {
        throw new Error('Select at least one scope.');
      }

      const expiresAt =
        expiryPreset === 'none'
          ? null
          : new Date(
              Date.now() + (expiryPreset === '30d' ? 30 : 90) * 24 * 60 * 60 * 1000,
            ).toISOString();

      return createApiKey({
        name,
        scopes,
        expiresAt,
        organizationId: activeOrganizationId ?? undefined,
      });
    },
    onSuccess: async (data) => {
      setCreatedApiKey(data.apiKey);
      setCreateDialogOpen(false);
      setKeyName('');
      setIncludeAllScope(true);
      setSelectedScopes([]);
      setExpiryPreset('none');
      await queryClient.invalidateQueries({
        queryKey: PLATFORM_QUERY_KEYS.apiKeys(activeOrganizationId),
      });
      toast.success('API key created');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create API key');
    },
  });

  const revokeKeyMutation = useMutation({
    mutationFn: async (id: number) => revokeApiKey(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: PLATFORM_QUERY_KEYS.apiKeys(activeOrganizationId),
      });
      toast.success('API key revoked');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to revoke API key');
    },
  });

  const loading = authLoading || apiKeysQuery.isLoading;
  const error =
    apiKeysQuery.error instanceof Error
      ? apiKeysQuery.error.message
      : apiKeysQuery.error
        ? 'Failed to load API keys'
        : null;

  const rows = useMemo(() => apiKeysQuery.data?.apiKeys ?? [], [apiKeysQuery.data?.apiKeys]);

  if (loading) {
    return (
      <main className="p-6">
        <p className="text-sm text-muted-foreground">Loading API keys...</p>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">API keys</h1>
        <p className="text-sm text-muted-foreground">
          Create scoped keys for server-to-server AI usage in{' '}
          {activeOrganization?.organizationName ?? 'your workspace'}.
        </p>
      </header>

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {createdApiKey ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New key created</CardTitle>
            <CardDescription>
              Copy this key now. It is shown once and cannot be retrieved later.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <pre className="overflow-x-auto rounded-md border bg-muted/40 px-3 py-2 text-xs">
              {createdApiKey}
            </pre>
            <div className="flex gap-2">
              <Button
                onClick={async () => {
                  await navigator.clipboard.writeText(createdApiKey);
                  toast.success('API key copied');
                }}
              >
                Copy key
              </Button>
              <Button variant="outline" onClick={() => setCreatedApiKey(null)}>
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle>Key management</CardTitle>
            <CardDescription>
              Use least-privilege scopes, set expirations when possible, and revoke compromised keys immediately.
            </CardDescription>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>Create API key</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create API key</DialogTitle>
                <DialogDescription>
                  Keys are scoped to the active organization and only shown once after creation.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="api-key-name">Key name</Label>
                  <Input
                    id="api-key-name"
                    value={keyName}
                    onChange={(event) => setKeyName(event.target.value)}
                    placeholder="Production worker key"
                    maxLength={80}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Scopes</Label>
                  <div className="space-y-2 rounded-md border p-3">
                    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                      <Checkbox
                        checked={includeAllScope}
                        onCheckedChange={(checked) => {
                          const enabled = checked === true;
                          setIncludeAllScope(enabled);
                          if (enabled) setSelectedScopes([]);
                        }}
                      />
                      <span>All AI APIs (`ai.*`)</span>
                    </label>
                    {SCOPE_OPTIONS.map((scope) => (
                      <label
                        key={scope.value}
                        className="flex cursor-pointer items-start gap-2 text-sm text-muted-foreground"
                      >
                        <Checkbox
                          checked={selectedScopes.includes(scope.value)}
                          disabled={includeAllScope}
                          onCheckedChange={(checked) => {
                            if (checked === true) {
                              setSelectedScopes((current) =>
                                current.includes(scope.value) ? current : [...current, scope.value],
                              );
                              return;
                            }
                            setSelectedScopes((current) =>
                              current.filter((value) => value !== scope.value),
                            );
                          }}
                        />
                        <span>
                          {scope.label}
                          <span className="ml-2 text-xs">{scope.description}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api-key-expiry">Expiration</Label>
                  <select
                    id="api-key-expiry"
                    className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                    value={expiryPreset}
                    onChange={(event) => setExpiryPreset(event.target.value as 'none' | '30d' | '90d')}
                  >
                    <option value="none">No expiration</option>
                    <option value="30d">30 days</option>
                    <option value="90d">90 days</option>
                  </select>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                  disabled={createKeyMutation.isPending}
                >
                  Cancel
                </Button>
                <Button onClick={() => createKeyMutation.mutate()} disabled={createKeyMutation.isPending}>
                  {createKeyMutation.isPending ? 'Creating...' : 'Create key'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No keys yet. Create one to enable programmatic AI access.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Scopes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last used</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {key.keyPrefix}...{key.keyLast4}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {key.scopes.map((scope) => (
                          <Badge key={scope} variant="outline">
                            {scope}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {key.isActive ? (
                        <Badge variant="secondary">Active</Badge>
                      ) : (
                        <Badge variant="destructive">Revoked/expired</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {key.requestCount.toLocaleString()} req
                      <br />
                      {formatUsd(key.totalCostUsd)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(key.createdAt)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(key.lastUsedAt)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(key.expiresAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!key.isActive || revokeKeyMutation.isPending}
                        onClick={() => {
                          const confirmed = window.confirm(
                            `Revoke API key "${key.name}"? This cannot be undone.`,
                          );
                          if (!confirmed) return;
                          revokeKeyMutation.mutate(key.id);
                        }}
                      >
                        Revoke
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

