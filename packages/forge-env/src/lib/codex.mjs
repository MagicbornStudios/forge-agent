import { spawnSync } from 'node:child_process';

function runCommand(command, args) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    shell: false,
  });
  const stdout = String(result.stdout || '');
  const stderr = String(result.stderr || '');
  const errorMessage = result.error instanceof Error ? result.error.message : '';
  return {
    ok: (result.status ?? 1) === 0,
    code: result.status ?? 1,
    stdout,
    stderr: [stderr, errorMessage].filter(Boolean).join('\n').trim(),
  };
}

function parseVersion(text) {
  const match = /codex(?:-cli)?\s+([^\s]+)/i.exec(String(text || ''));
  return match ? match[1] : null;
}

export function checkCodexReadiness(command = 'codex') {
  const cli = runCommand(command, ['--version']);
  const codexCliInstalled = cli.ok;
  const codexVersion = parseVersion(`${cli.stdout}\n${cli.stderr}`);

  if (!codexCliInstalled) {
    return {
      codexCliInstalled: false,
      codexLoginChatgpt: false,
      codexVersion,
      loginAuthType: 'none',
      details: {
        version: cli,
        login: null,
      },
    };
  }

  const login = runCommand(command, ['login', 'status']);
  const loginText = `${login.stdout}\n${login.stderr}`;
  const codexLoginChatgpt = /logged in using chatgpt/i.test(loginText);
  const loginAuthType = codexLoginChatgpt
    ? 'chatgpt'
    : /logged in/i.test(loginText)
      ? 'other'
      : /not logged in/i.test(loginText)
        ? 'none'
        : 'unknown';

  return {
    codexCliInstalled,
    codexLoginChatgpt,
    codexVersion,
    loginAuthType,
    details: {
      version: cli,
      login,
    },
  };
}
