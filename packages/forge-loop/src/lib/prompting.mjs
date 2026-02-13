import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

export async function askLine(question, fallback = '') {
  if (!process.stdin.isTTY) return fallback;

  const rl = readline.createInterface({ input, output });
  try {
    const answer = await rl.question(question);
    return answer.trim();
  } finally {
    rl.close();
  }
}

export async function askYesNo(question, defaultYes = true) {
  if (!process.stdin.isTTY) return defaultYes;

  const suffix = defaultYes ? ' [Y/n] ' : ' [y/N] ';
  const answer = (await askLine(`${question}${suffix}`)).toLowerCase();

  if (!answer) return defaultYes;
  if (['y', 'yes'].includes(answer)) return true;
  if (['n', 'no'].includes(answer)) return false;
  return defaultYes;
}
