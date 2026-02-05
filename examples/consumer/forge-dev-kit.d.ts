/**
 * Type declaration for @forge/dev-kit when used from the consumer example.
 * The package is linked via workspace:*; types resolve from the built dist.
 * Run `pnpm run build:packages` from the repo root to build foundation packages
 * (including dev-kit) so dist/ exists and full types are available.
 * Until then, this declaration satisfies the module resolution and avoids lint errors.
 */
declare module '@forge/dev-kit';
