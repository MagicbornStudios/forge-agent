import { requestJson } from './client';
import type { OrganizationsResponse } from './types';

export async function fetchOrganizations(
  credentials: RequestCredentials = 'include',
): Promise<OrganizationsResponse> {
  return requestJson<OrganizationsResponse>({
    path: '/api/me/orgs',
    credentials,
  });
}

export async function setActiveOrganization(
  organizationId: number,
  credentials: RequestCredentials = 'include',
): Promise<OrganizationsResponse> {
  return requestJson<OrganizationsResponse>({
    path: '/api/me/orgs/active',
    method: 'POST',
    credentials,
    body: { organizationId },
  });
}
