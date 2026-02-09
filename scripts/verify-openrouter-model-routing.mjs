#!/usr/bin/env node
/**
 * Verifies OpenRouter model routing. Two modes:
 *
 * 1) Hit Studio route (recommended for local verification):
 *    Run: pnpm dev (in another terminal), set LOG_LEVEL=debug and LOG_FILE=.logs/studio.log,
 *    then: BASE_URL=http://localhost:3000 OPENROUTER_API_KEY=... pnpm run verify-openrouter
 *    Then open .logs/studio.log and grep for "model-router" or "primary" to see resolved model.
 *
 * 2) Hit OpenRouter directly (no Studio):
 *    OPENROUTER_API_KEY=... pnpm run verify-openrouter
 *
 * Do not run in Jest (network + secrets).
 */

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';
const TEST_MODEL = 'openai/gpt-4o-mini';
const API_KEY = process.env.OPENROUTER_API_KEY?.trim();
const BASE_URL = process.env.BASE_URL?.trim();

if (!API_KEY) {
  console.error('OPENROUTER_API_KEY is not set. Set it to run this script.');
  process.exit(1);
}

async function main() {
  if (BASE_URL) {
    console.log('Verifying via Studio route:', BASE_URL + '/api/assistant-chat');
    const res = await fetch(`${BASE_URL}/api/assistant-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Reply with exactly: OK' }],
        callSettings: { maxTokens: 10 },
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error('Assistant-chat request failed:', res.status, text);
      process.exit(1);
    }
    console.log('Assistant-chat verification passed. Check .logs/studio.log for model-router logs (grep primary or model-router).');
    return;
  }

  console.log('Verifying OpenRouter model routing (direct)...');
  console.log('API: chat completions');
  console.log('Model:', TEST_MODEL);

  const url = `${OPENROUTER_BASE}/chat/completions`;
  const body = {
    model: TEST_MODEL,
    messages: [{ role: 'user', content: 'Reply with exactly: OK' }],
    max_tokens: 10,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
      'HTTP-Referer': 'https://github.com/forge-agent',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('OpenRouter chat request failed:', res.status, text);
    process.exit(1);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content?.trim() ?? '';
  const modelUsed = data.model ?? '(unknown)';

  console.log('Response model:', modelUsed);
  console.log('Content:', content);
  console.log('Chat API verification passed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
