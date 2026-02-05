# Forge Dev Kit Consumer Example

Minimal Next.js app demonstrating how to use `@forge/dev-kit` in a separate repo.

## Setup

1. Install dependencies from the repo root:

```bash
pnpm install
```

2. Create `.env.local` in this folder:

```bash
cp .env.example .env.local
```

Set your OpenRouter key in `.env.local`:

```
OPENROUTER_API_KEY=your_key_here
OPENROUTER_MODEL=openrouter/auto
```

3. Start the example:

```bash
pnpm --filter @forge/consumer-example dev
```

Open `http://localhost:3000` (or the port Next prints).

## What this shows

- `AppSpace` for the app layout.
- `AppProviders` with CopilotKit sidebar enabled.
- A minimal workspace layout using shared workspace primitives.
- A working `/api/copilotkit` runtime wrapper.
