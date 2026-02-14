export function parseArgs(argv) {
  const positional = [];
  const flags = new Map();

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      positional.push(token);
      continue;
    }

    const keyValue = token.slice(2).split('=');
    const key = keyValue[0];
    if (!key) continue;

    if (keyValue.length > 1) {
      flags.set(key, keyValue.slice(1).join('='));
      continue;
    }

    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      flags.set(key, next);
      i += 1;
      continue;
    }

    flags.set(key, true);
  }

  return { positional, flags };
}
