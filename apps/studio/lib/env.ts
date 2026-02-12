const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);
const DEFAULT_OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const DEFAULT_OPENROUTER_TIMEOUT_MS = 60000;

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

function requireEnvValue(name: string, message: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(message);
  }
  return value;
}

export function getOpenRouterBaseUrl(): string {
  return process.env.OPENROUTER_BASE_URL?.trim() || DEFAULT_OPENROUTER_BASE_URL;
}

export function getOpenRouterTimeoutMs(): number {
  return parsePositiveInt(process.env.OPENROUTER_TIMEOUT_MS, DEFAULT_OPENROUTER_TIMEOUT_MS);
}

export function requireOpenRouterApiKey(): string {
  return requireEnvValue(
    'OPENROUTER_API_KEY',
    'OPENROUTER_API_KEY is required for AI routes. Run `pnpm env:setup --app studio` to configure it.',
  );
}

export function requireStripeSecretKey(): string {
  return requireEnvValue(
    'STRIPE_SECRET_KEY',
    'STRIPE_SECRET_KEY is required for Stripe routes. Run `pnpm env:setup --app studio`.',
  );
}

export function requireStripeWebhookSecret(): string {
  return requireEnvValue(
    'STRIPE_WEBHOOK_SECRET',
    'STRIPE_WEBHOOK_SECRET is required for Stripe webhook route. Run `pnpm env:setup --app studio`.',
  );
}

export function requireStripePriceIdPro(): string {
  return requireEnvValue(
    'STRIPE_PRICE_ID_PRO',
    'STRIPE_PRICE_ID_PRO is required for Pro checkout route. Run `pnpm env:setup --app studio`.',
  );
}

export function requireStripePriceIdStorageAddon(): string {
  return requireEnvValue(
    'STRIPE_PRICE_ID_STORAGE_ADDON',
    'STRIPE_PRICE_ID_STORAGE_ADDON is required for storage upgrade route. Run `pnpm env:setup --app studio`.',
  );
}

export function getStorageAddonBytesDefault(): number {
  return parsePositiveInt(process.env.STORAGE_ADDON_BYTES, 50 * 1024 * 1024 * 1024);
}

export function resolvePublicAppUrl(fallback: string): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured && configured.length > 0) {
    return configured;
  }
  return fallback;
}

export function isLocalDevAutoAdminEnabled(hostname?: string): boolean {
  if (process.env.NODE_ENV !== 'development') {
    return false;
  }

  if (process.env.NEXT_PUBLIC_LOCAL_DEV_AUTO_ADMIN === '0') {
    return false;
  }

  const host =
    hostname ??
    (typeof window !== 'undefined' ? window.location.hostname : undefined);
  if (!host) return false;
  return LOCAL_HOSTS.has(host);
}

export function getLocalDevAutoAdminCredentials() {
  return {
    email: process.env.NEXT_PUBLIC_LOCAL_DEV_AUTO_ADMIN_EMAIL ?? 'admin@forge.local',
    password: process.env.NEXT_PUBLIC_LOCAL_DEV_AUTO_ADMIN_PASSWORD ?? 'admin12345',
  };
}

