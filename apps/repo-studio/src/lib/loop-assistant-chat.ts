import { createUIMessageStream, createUIMessageStreamResponse } from 'ai';

import { resolveRepoRoot } from '@/lib/repo-files';
import { loadRepoStudioSnapshot } from '@/lib/repo-data';

function latestUserPrompt(body: any) {
  if (typeof body?.input === 'string' && body.input.trim()) return body.input.trim();
  if (typeof body?.prompt === 'string' && body.prompt.trim()) return body.prompt.trim();
  if (Array.isArray(body?.messages)) {
    for (let index = body.messages.length - 1; index >= 0; index -= 1) {
      const message = body.messages[index];
      if (!message || typeof message !== 'object') continue;
      if (String((message as any).role || '') !== 'user') continue;
      const content = (message as any).content;
      if (typeof content === 'string' && content.trim()) return content.trim();
      if (Array.isArray(content)) {
        const text = content
          .map((part: any) => (part && part.type === 'text' ? String(part.text || '') : ''))
          .join(' ')
          .trim();
        if (text) return text;
      }
    }
  }
  return '';
}

function loopAssistantReply(input: {
  prompt: string;
  loopId: string;
  nextAction: string;
  percent: number;
  openDecisions: number;
  openErrors: number;
}) {
  const prompt = input.prompt.toLowerCase();
  if (!prompt) {
    return [
      `Active loop: ${input.loopId}`,
      `Progress: ${input.percent}%`,
      `Next action: ${input.nextAction}`,
      '',
      'Ask me for: next command, blockers, verification sequence, or planning summary.',
    ].join('\n');
  }

  if (prompt.includes('next') || prompt.includes('what should i do')) {
    return [
      `Next command: ${input.nextAction}`,
      '',
      'Loop cadence:',
      '1. forge-loop progress',
      '2. forge-loop discuss-phase <phase>',
      '3. forge-loop plan-phase <phase>',
      '4. forge-loop execute-phase <phase>',
      '5. forge-loop verify-work <phase> --strict',
      '6. forge-loop sync-legacy',
    ].join('\n');
  }

  if (prompt.includes('blocker') || prompt.includes('risk') || prompt.includes('stuck')) {
    return [
      `Open decisions: ${input.openDecisions}`,
      `Open errors: ${input.openErrors}`,
      '',
      input.openErrors > 0 || input.openDecisions > 0
        ? 'Recommendation: resolve unresolved DECISIONS/ERRORS before starting a new execution slice.'
        : 'No unresolved decision/error blockers detected in current planning snapshot.',
    ].join('\n');
  }

  return [
    `Loop ${input.loopId} is at ${input.percent}% completion.`,
    `Next action: ${input.nextAction}`,
    '',
    'If you want, ask for "next command", "verification checklist", or "blockers".',
  ].join('\n');
}

export async function runLocalLoopAssistant(input: { body: any; editorTarget: string }) {
  const repoRoot = resolveRepoRoot();
  const requestedLoopId = String(input.body?.loopId || '').trim().toLowerCase() || undefined;
  const snapshot = await loadRepoStudioSnapshot(repoRoot, {
    loopId: requestedLoopId,
  });
  const prompt = latestUserPrompt(input.body);
  const message = loopAssistantReply({
    prompt,
    loopId: snapshot.planning.loopId,
    nextAction: snapshot.planning.nextAction,
    percent: snapshot.planning.percent,
    openDecisions: snapshot.planning.decisionOpen,
    openErrors: snapshot.planning.errorOpen,
  });

  const partId = `loop-assistant-${Date.now()}`;
  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      writer.write({
        type: 'start',
        messageMetadata: {
          editorTarget: input.editorTarget,
          loopId: snapshot.planning.loopId,
        },
      });
      writer.write({ type: 'text-start', id: partId });
      writer.write({
        type: 'text-delta',
        id: partId,
        delta: message,
      });
      writer.write({ type: 'text-end', id: partId });
      writer.write({
        type: 'finish',
        finishReason: 'stop',
        messageMetadata: {
          editorTarget: input.editorTarget,
          loopId: snapshot.planning.loopId,
        },
      });
    },
  });

  return createUIMessageStreamResponse({ stream });
}

