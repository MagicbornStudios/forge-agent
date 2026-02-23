const ANSI = {
  reset: '\u001b[0m',
  bold: '\u001b[1m',
  dim: '\u001b[2m',
  green: '\u001b[32m',
  yellow: '\u001b[33m',
  red: '\u001b[31m',
  cyan: '\u001b[36m',
};

function colorize(text, color, enabled = true) {
  if (!enabled) return String(text || '');
  return `${color}${String(text || '')}${ANSI.reset}`;
}

export function shouldUseAnsiOutput(options = {}) {
  if (options.plain === true) return false;
  if (options.asJson === true) return false;
  if (process.env.NO_COLOR) return false;
  if (typeof options.tty === 'boolean') return options.tty;
  const stream = options.stream === 'stderr' ? process.stderr : process.stdout;
  return Boolean(stream && stream.isTTY);
}

function isSafeTerminalUrl(url) {
  const text = String(url || '').trim();
  if (!text) return false;
  return /^https?:\/\//i.test(text) || /^file:\/\//i.test(text);
}

export function shouldUseTerminalLinks(options = {}) {
  if (options.noLinks === true) return false;
  return shouldUseAnsiOutput(options);
}

export function renderTerminalLink(label, url, options = {}) {
  const text = String(label || '');
  if (!text) return '';
  if (options.enabled !== true) return text;
  if (!isSafeTerminalUrl(url)) return text;
  const href = String(url).replace(/\u001b/g, '').replace(/\u0007/g, '');
  return `\u001b]8;;${href}\u0007${text}\u001b]8;;\u0007`;
}

export function statusBadge(status, options = {}) {
  const ansi = options.ansi === true;
  const normalized = String(status || '').trim().toUpperCase();
  if (normalized === 'OK') return colorize('[OK]', ANSI.green, ansi);
  if (normalized === 'WARN') return colorize('[WARN]', ANSI.yellow, ansi);
  if (normalized === 'FAIL') return colorize('[FAIL]', ANSI.red, ansi);
  return colorize(`[${normalized || 'INFO'}]`, ANSI.cyan, ansi);
}

export function renderKeyValueSection(title, entries = [], options = {}) {
  const ansi = options.ansi === true;
  const rows = entries
    .filter((entry) => entry && typeof entry === 'object')
    .map((entry) => ({
      key: String(entry.key || ''),
      value: String(entry.value ?? ''),
      status: entry.status ? String(entry.status) : null,
    }))
    .filter((entry) => entry.key.length > 0);

  const keyWidth = rows.reduce((max, row) => Math.max(max, row.key.length), 0);
  const lines = [];
  if (title) {
    lines.push(colorize(String(title), ANSI.bold, ansi));
  }
  for (const row of rows) {
    const key = row.key.padEnd(keyWidth, ' ');
    const value = row.value;
    const badge = row.status ? `${statusBadge(row.status, { ansi })} ` : '';
    lines.push(`${badge}${colorize(key, ANSI.dim, ansi)} : ${value}`);
  }
  return lines.join('\n');
}

function pad(value, width) {
  const text = String(value || '');
  return text.length >= width ? text : text.padEnd(width, ' ');
}

function tableRule(widths) {
  return `+-${'-'.repeat(widths.pid)}-+-${'-'.repeat(widths.name)}-+-${'-'.repeat(widths.ports)}-+-${'-'.repeat(widths.owner)}-+-${'-'.repeat(widths.action)}-+`;
}

export function renderProcessTable(processes = [], options = {}) {
  const ansi = options.ansi === true;
  const list = Array.isArray(processes) ? processes : [];
  if (list.length === 0) {
    return options.emptyMessage || '(no matching processes)';
  }

  const rows = list.map((item) => ({
    pid: String(item.pid ?? ''),
    name: String(item.name || ''),
    ports: Array.isArray(item.knownPorts) && item.knownPorts.length > 0
      ? item.knownPorts.join(',')
      : '-',
    owner: item.repoStudioOwned
      ? 'repo-studio'
      : item.repoOwned
        ? 'repo'
        : 'external',
    action: item.action ? String(item.action) : '-',
  }));

  const widths = {
    pid: Math.max(3, ...rows.map((row) => row.pid.length)),
    name: Math.max(4, ...rows.map((row) => row.name.length)),
    ports: Math.max(5, ...rows.map((row) => row.ports.length)),
    owner: Math.max(5, ...rows.map((row) => row.owner.length)),
    action: Math.max(6, ...rows.map((row) => row.action.length)),
  };

  const lines = [tableRule(widths)];
  const header = `| ${pad('PID', widths.pid)} | ${pad('NAME', widths.name)} | ${pad('PORTS', widths.ports)} | ${pad('OWNER', widths.owner)} | ${pad('ACTION', widths.action)} |`;
  lines.push(colorize(header, ANSI.bold, ansi));
  lines.push(tableRule(widths));
  for (const row of rows) {
    lines.push(`| ${pad(row.pid, widths.pid)} | ${pad(row.name, widths.name)} | ${pad(row.ports, widths.ports)} | ${pad(row.owner, widths.owner)} | ${pad(row.action, widths.action)} |`);
  }
  lines.push(tableRule(widths));
  return lines.join('\n');
}
