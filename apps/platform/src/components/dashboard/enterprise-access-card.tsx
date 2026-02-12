'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { EnterpriseRequestType, OrganizationMembership } from '@/lib/api/studio';
import { useCreateEnterpriseRequest, useEnterpriseRequests } from '@/lib/data/hooks/use-dashboard-data';

type EnterpriseAccessCardProps = {
  orgId: number | null;
  activeOrganization: OrganizationMembership | null;
};

const requestButtons: Array<{ label: string; type: EnterpriseRequestType }> = [
  { label: 'Request source access', type: 'source_access' },
  { label: 'Request premium support', type: 'premium_support' },
  { label: 'Request custom editor', type: 'custom_editor' },
];

export function EnterpriseAccessCard({
  orgId,
  activeOrganization,
}: EnterpriseAccessCardProps) {
  const [error, setError] = useState<string | null>(null);
  const requestsQuery = useEnterpriseRequests(orgId, orgId != null);
  const mutation = useCreateEnterpriseRequest();

  async function handleRequest(type: EnterpriseRequestType) {
    if (!orgId) return;
    setError(null);
    try {
      await mutation.mutateAsync({ type, orgId });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Failed to submit enterprise request',
      );
    }
  }

  const sourceAccess = Boolean(activeOrganization?.enterpriseSourceAccess);
  const premiumSupport = Boolean(activeOrganization?.enterprisePremiumSupport);
  const customEditors = Boolean(activeOrganization?.enterpriseCustomEditors);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enterprise access</CardTitle>
        <CardDescription>
          Request gated enterprise capabilities for your organization.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p>Source access: {sourceAccess ? 'Enabled' : 'Not enabled'}</p>
          <p>Premium support: {premiumSupport ? 'Enabled' : 'Not enabled'}</p>
          <p>Custom editors: {customEditors ? 'Enabled' : 'Not enabled'}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {requestButtons.map((item) => (
            <Button
              key={item.type}
              variant="outline"
              disabled={!orgId || mutation.isPending}
              onClick={() => void handleRequest(item.type)}
            >
              {item.label}
            </Button>
          ))}
        </div>

        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : null}

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Recent enterprise requests
          </p>
          {requestsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading requests...</p>
          ) : (requestsQuery.data?.requests ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No enterprise requests submitted yet.
            </p>
          ) : (
            <ul className="space-y-1 text-sm text-muted-foreground">
              {(requestsQuery.data?.requests ?? []).slice(0, 5).map((request) => (
                <li key={request.id}>
                  {request.type.replace('_', ' ')} - {request.status}
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
