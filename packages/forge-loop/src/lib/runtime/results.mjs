import fs from 'node:fs';
import path from 'node:path';

import { PLANNING_PATH } from '../paths.mjs';

function ensureRunsDir() {
  const runsDir = path.join(PLANNING_PATH, 'runs');
  fs.mkdirSync(runsDir, { recursive: true });
  return runsDir;
}

export function createRunEventWriter({ phaseNumber, stage, runner }) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `${String(phaseNumber || '00').padStart(2, '0')}-${stage}-${runner}-${stamp}.jsonl`;
  const filePath = path.join(ensureRunsDir(), fileName);

  return {
    filePath,
    write(eventType, payload = {}) {
      const line = JSON.stringify({
        ts: new Date().toISOString(),
        eventType,
        payload,
      });
      fs.appendFileSync(filePath, `${line}\n`, 'utf8');
    },
  };
}

export function enrichStageResult(result, extras = {}) {
  return {
    ...result,
    runnerUsed: extras.runnerUsed || result.runnerUsed || 'prompt-pack',
    taskResults: Array.isArray(result.taskResults) ? result.taskResults : [],
    artifactsWritten: Array.isArray(result.artifactsWritten) ? result.artifactsWritten : [],
    nextAction: extras.nextAction || result.nextAction,
  };
}
