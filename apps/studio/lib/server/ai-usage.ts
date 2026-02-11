import 'server-only';

import { getPayload } from 'payload';
import type { Payload } from 'payload';
import config from '@/payload.config';
import { getOpenRouterModels } from '@/lib/openrouter-models';
import {
  requireAuthenticatedUser,
  resolveOrganizationFromInput,
  type AuthenticatedUser,
} from '@/lib/server/organizations';
import {
  getClientIpFromHeaders,
  recordApiKeyUsage,
  requireAiRequestAuth,
  type AiRequestAuthContext,
} from '@/lib/server/api-keys';

type UsageLike = {
  prompt_tokens?: number;
  completion_tokens?: number;
  promptTokens?: number;
  completionTokens?: number;
  input_tokens?: number;
  output_tokens?: number;
  inputTokens?: number;
  outputTokens?: number;
  total_tokens?: number;
  totalTokens?: number;
};

type UsageTotals = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
};

type BillingCosts = {
  inputCostUsd: number;
  outputCostUsd: number;
  totalCostUsd: number;
};

export type RecordAiUsageEventInput = {
  request: Request;
  requestId?: string;
  provider?: string;
  model: string;
  routeKey: string;
  usage?: UsageLike | null;
  status?: 'success' | 'partial' | 'error';
  errorMessage?: string;
  orgId?: number | null;
  authContext?: AiRequestAuthContext | null;
};

function toFiniteNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

export function normalizeUsageTotals(usage?: UsageLike | null): UsageTotals {
  const inputTokens = Math.max(
    0,
    Math.round(
      toFiniteNumber(
        usage?.input_tokens ?? usage?.prompt_tokens ?? usage?.inputTokens ?? usage?.promptTokens,
      ),
    ),
  );
  const outputTokens = Math.max(
    0,
    Math.round(
      toFiniteNumber(
        usage?.output_tokens ??
          usage?.completion_tokens ??
          usage?.outputTokens ??
          usage?.completionTokens,
      ),
    ),
  );
  const totalCandidate = Math.round(toFiniteNumber(usage?.total_tokens ?? usage?.totalTokens));
  const totalTokens =
    totalCandidate > 0 ? totalCandidate : Math.max(0, inputTokens + outputTokens);

  return { inputTokens, outputTokens, totalTokens };
}

function roundUsd(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}

async function estimateCosts(modelId: string, usage: UsageTotals): Promise<BillingCosts> {
  const models = await getOpenRouterModels();
  const model = models.find((entry) => entry.id === modelId);
  if (!model) {
    return { inputCostUsd: 0, outputCostUsd: 0, totalCostUsd: 0 };
  }

  const inputRate = typeof model.costPerMInput === 'number' ? model.costPerMInput : 0;
  const outputRate = typeof model.costPerMOutput === 'number' ? model.costPerMOutput : 0;
  const inputCostUsd = roundUsd((usage.inputTokens / 1_000_000) * inputRate);
  const outputCostUsd = roundUsd((usage.outputTokens / 1_000_000) * outputRate);
  const totalCostUsd = roundUsd(inputCostUsd + outputCostUsd);

  return { inputCostUsd, outputCostUsd, totalCostUsd };
}

function isDuplicateRequestError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  const normalized = message.toLowerCase();
  return normalized.includes('unique') || normalized.includes('duplicate');
}

async function resolveOrgId(
  payload: Payload,
  user: AuthenticatedUser,
  orgId: number | null | undefined,
): Promise<number | null> {
  const context = await resolveOrganizationFromInput(payload, user, orgId ?? undefined);
  return context.activeOrganizationId ?? null;
}

async function resolveAuthContext(
  payload: Payload,
  input: RecordAiUsageEventInput,
): Promise<AiRequestAuthContext | null> {
  if (input.authContext) {
    return input.authContext;
  }

  const keyOrSession = await requireAiRequestAuth(payload, input.request);
  if (keyOrSession) {
    return keyOrSession;
  }

  const user = await requireAuthenticatedUser(payload, input.request.headers);
  if (!user) return null;
  const orgId = await resolveOrgId(payload, user, input.orgId);
  return {
    authType: 'session',
    userId: user.id,
    organizationId: orgId,
    apiKeyId: null,
    scopes: ['ai.*'],
  };
}

export async function recordAiUsageEvent(input: RecordAiUsageEventInput): Promise<void> {
  try {
    const payload = await getPayload({ config });
    const authContext = await resolveAuthContext(payload, input);
    if (!authContext) return;

    const usageTotals = normalizeUsageTotals(input.usage);
    const costs = await estimateCosts(input.model, usageTotals);
    const activeOrganizationId = input.orgId ?? authContext.organizationId ?? null;
    const requestId = input.requestId ?? crypto.randomUUID();

    await payload.create({
      collection: 'ai-usage-events',
      data: {
        requestId,
        user: authContext.userId,
        organization: activeOrganizationId ?? undefined,
        apiKey: authContext.apiKeyId ?? undefined,
        authType: authContext.authType,
        provider: input.provider ?? 'openrouter',
        model: input.model,
        routeKey: input.routeKey,
        status: input.status ?? 'success',
        errorMessage: input.errorMessage ?? undefined,
        inputTokens: usageTotals.inputTokens,
        outputTokens: usageTotals.outputTokens,
        totalTokens: usageTotals.totalTokens,
        inputCostUsd: costs.inputCostUsd,
        outputCostUsd: costs.outputCostUsd,
        totalCostUsd: costs.totalCostUsd,
        createdAt: new Date().toISOString(),
      },
      overrideAccess: true,
    });

    if (authContext.apiKeyId != null) {
      await recordApiKeyUsage(payload, authContext.apiKeyId, {
        inputTokens: usageTotals.inputTokens,
        outputTokens: usageTotals.outputTokens,
        totalCostUsd: costs.totalCostUsd,
        lastUsedIp: getClientIpFromHeaders(input.request.headers),
      });
    }
  } catch (error) {
    if (isDuplicateRequestError(error)) return;
    console.error('[ai-usage] failed to persist usage event', error);
  }
}
