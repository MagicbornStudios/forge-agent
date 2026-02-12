export type MeResponse = {
  user: {
    id: string | number;
    email?: string | null;
    name?: string | null;
    role?: string | null;
    plan?: string | null;
    defaultOrganizationId?: number | null;
    stripeConnectAccountId?: string | null;
    activeOrganization?: {
      organizationId: number;
      organizationName: string;
      organizationSlug: string;
      role: 'owner' | 'member';
      planTier: 'free' | 'pro' | 'enterprise';
      storageQuotaBytes: number;
      storageUsedBytes: number;
      storageWarningThresholdPercent: number;
      enterpriseSourceAccess: boolean;
      enterprisePremiumSupport: boolean;
      enterpriseCustomEditors: boolean;
    } | null;
  } | null;
};

export type PostListItem = {
  id: string | number;
  title: string;
  slug: string;
  excerpt?: string;
  publishedAt?: string;
};

export type PostDetail = PostListItem & {
  body?: unknown;
};

export type CatalogListing = {
  id: string | number;
  title: string;
  slug: string;
  description?: string;
  listingType: 'project' | 'template' | 'strategy-core';
  cloneMode?: 'indefinite' | 'version-only';
  price: number;
  currency: string;
  category?: string;
  playUrl?: string;
  updatedAt?: string;
  thumbnailUrl?: string;
  creatorName?: string;
};

export type CloneListingResponse = {
  projectId: number;
  licenseId: number | null;
  listingId: number;
  listingTitle: string;
  mode: 'free';
};

export type CreatorListing = {
  id: number;
  title: string;
  slug: string;
  listingType: 'project' | 'template' | 'strategy-core';
  status: 'draft' | 'published';
  cloneMode: 'indefinite' | 'version-only';
  price: number;
  currency: string;
  category?: string;
  playUrl?: string;
  updatedAt?: string;
  thumbnailUrl?: string;
  projectId?: number | null;
  projectTitle?: string | null;
  organizationId?: number | null;
};

export type CreatorProject = {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  status?: string | null;
  domain?: string | null;
  updatedAt?: string;
  listing?: {
    id: number;
    slug: string;
    title: string;
    status: 'draft' | 'published';
    price: number;
    currency: string;
    cloneMode: 'indefinite' | 'version-only';
    playUrl?: string;
  } | null;
};

export type RevenueSummary = {
  totalEarningsCents: number;
  totalPlatformFeesCents: number;
  byLicense: {
    licenseId: number;
    listingTitle: string;
    amountCents: number;
    platformFeeCents: number;
    grantedAt?: string | null;
  }[];
};

export type CreateOnboardingLinkOptions = {
  orgId?: number | null;
  baseUrl?: string;
  returnUrl?: string;
  refreshUrl?: string;
};

export type OrganizationMembership = {
  organizationId: number;
  organizationName: string;
  organizationSlug: string;
  role: 'owner' | 'member';
  stripeConnectAccountId?: string | null;
  stripeConnectOnboardingComplete?: boolean | null;
  planTier?: 'free' | 'pro' | 'enterprise';
  storageQuotaBytes?: number;
  storageUsedBytes?: number;
  storageWarningThresholdPercent?: number;
  enterpriseSourceAccess?: boolean;
  enterprisePremiumSupport?: boolean;
  enterpriseCustomEditors?: boolean;
  stripeCustomerId?: string | null;
};

export type OrganizationsResponse = {
  activeOrganizationId: number;
  activeOrganization: OrganizationMembership | null;
  memberships: OrganizationMembership[];
};

export type AiUsageRange = '7d' | '30d' | '90d';

export type AiUsageSeriesRow = {
  date: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  inputCostUsd: number;
  outputCostUsd: number;
  totalCostUsd: number;
  count: number;
};

export type AiUsageSeriesResponse = {
  range: AiUsageRange;
  activeOrganizationId: number;
  series: AiUsageSeriesRow[];
};

export type AiUsageSummaryResponse = {
  range: AiUsageRange;
  activeOrganizationId: number;
  summary: {
    requestCount: number;
    successfulRequests: number;
    failedRequests: number;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    totalCostUsd: number;
  };
  topModels: Array<{
    model: string;
    totalTokens: number;
    totalCostUsd: number;
  }>;
};

export type StorageSummary = {
  organizationId: number;
  storageQuotaBytes: number;
  storageUsedBytes: number;
  storageRemainingBytes: number;
  storageUsagePercent: number;
  storageWarningThresholdPercent: number;
  warning: boolean;
  overLimit: boolean;
};

export type StorageSummaryResponse = {
  activeOrganizationId: number;
  planTier: 'free' | 'pro' | 'enterprise';
  summary: StorageSummary;
};

export type StorageBreakdownRow = {
  entityType: 'org' | 'user' | 'project';
  entityId: number | null;
  label: string;
  mediaBytes: number;
  projectBytes: number;
  totalBytes: number;
};

export type StorageBreakdownResponse = {
  activeOrganizationId: number;
  groupBy: 'org' | 'user' | 'project';
  rows: StorageBreakdownRow[];
};

export type EnterpriseRequestType = 'source_access' | 'premium_support' | 'custom_editor';

export type EnterpriseRequest = {
  id: number;
  type: EnterpriseRequestType;
  status: 'open' | 'in_review' | 'approved' | 'rejected' | 'completed';
  notes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  resolvedAt: string | null;
};

export type EnterpriseRequestListResponse = {
  activeOrganizationId: number;
  requests: EnterpriseRequest[];
};

export type ApiKeyScope = 'ai.*' | 'ai.chat' | 'ai.plan' | 'ai.structured' | 'ai.image';

export type ApiKeyRecord = {
  id: number;
  name: string;
  keyPrefix: string;
  keyLast4: string;
  scopes: ApiKeyScope[];
  createdAt: string | null;
  updatedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  isActive: boolean;
  requestCount: number;
  inputTokens: number;
  outputTokens: number;
  totalCostUsd: number;
  lastUsedAt: string | null;
};

export type ApiKeyListResponse = {
  activeOrganizationId: number;
  apiKeys: ApiKeyRecord[];
};

export type CreateApiKeyInput = {
  name: string;
  scopes?: ApiKeyScope[];
  expiresAt?: string | null;
  organizationId?: number | null;
};

export type CreateApiKeyResponse = {
  activeOrganizationId: number;
  apiKey: string;
  warning: string;
  created: ApiKeyRecord;
};

export type CreateListingCheckoutOptions = {
  successUrl?: string;
  cancelUrl?: string;
  baseUrl?: string;
};

export type CheckoutSessionResult = {
  clonedProjectId: number | null;
  listingTitle: string | null;
  listingId: number;
};

export type LicenseItem = {
  id: number;
  listingTitle: string | null;
  grantedAt: string | null;
  clonedProjectId: number | null;
};

export type FetchLicensesResponse = {
  activeOrganizationId?: number | null;
  licenses: LicenseItem[];
};
