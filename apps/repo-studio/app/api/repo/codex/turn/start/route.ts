import { NextResponse } from 'next/server';

import { startCodexTurn } from '@/lib/codex-session';
import { resolveScopeGuardContext } from '@/lib/scope-guard';

export async function POST(request: Request) {
  let body: {
    prompt?: string;
    messages?: any[];
    loopId?: string;
    assistantTarget?: string;
    domain?: string;
    scopeOverrideToken?: string;
  } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const scope = await resolveScopeGuardContext({
    domain: body.domain,
    loopId: body.loopId,
    overrideToken: body.scopeOverrideToken,
  });

  const result = await startCodexTurn({
    prompt: body.prompt,
    messages: body.messages,
    loopId: body.loopId,
    assistantTarget: body.assistantTarget,
    domain: scope.domain,
    scopeRoots: scope.allowedRoots,
    scopeOverrideToken: body.scopeOverrideToken,
  });

  const ok = result.ok === true;
  return NextResponse.json({
    ok,
    turnId: result.turnId || null,
    protocolTurnId: result.protocolTurnId || null,
    threadId: result.threadId || null,
    sessionId: result.sessionId || null,
    message: result.message || (ok ? 'Codex turn started.' : 'Failed to start Codex turn.'),
    scope: {
      domain: scope.domain || null,
      roots: scope.allowedRoots,
      overrideActive: scope.overrideActive,
    },
  }, { status: ok ? 200 : 500 });
}

