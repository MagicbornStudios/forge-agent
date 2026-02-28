const fs = require('node:fs');
const path = require('node:path');

const bootstrapLogPath = path.join(
  process.env.APPDATA || process.cwd(),
  '@forge',
  'repo-studio',
  'desktop-bootstrap.log',
);

function appendBootstrapLog(message, details = '') {
  try {
    fs.mkdirSync(path.dirname(bootstrapLogPath), { recursive: true });
    fs.appendFileSync(
      bootstrapLogPath,
      `[${new Date().toISOString()}] ${message}${details ? `\n${details}` : ''}\n\n`,
      'utf8',
    );
  } catch {
    // ignore bootstrap log failures
  }
}

process.on('uncaughtException', (error) => {
  appendBootstrapLog('uncaughtException', error && error.stack ? error.stack : String(error));
});

process.on('unhandledRejection', (error) => {
  appendBootstrapLog('unhandledRejection', error && error.stack ? error.stack : String(error));
});

appendBootstrapLog('bootstrap:start', `argv=${JSON.stringify(process.argv)}`);

const electron = require('electron');

globalThis.__REPO_STUDIO_ELECTRON__ = electron;

appendBootstrapLog(
  'bootstrap:resolved-electron',
  `type=${typeof electron} hasApp=${Boolean(electron && typeof electron === 'object' && electron.app)}`,
);

if (!electron || typeof electron !== 'object' || !electron.app) {
  const detail = `type=${typeof electron} keys=${electron && typeof electron === 'object' ? Object.keys(electron).join(',') : 'n/a'}`;
  appendBootstrapLog('bootstrap:error', `Electron app APIs were not available in the entrypoint.\n${detail}`);
  console.error('RepoStudio desktop entry failed to resolve Electron app APIs.', detail);
  process.exit(1);
}

electron.app.once('ready', () => {
  appendBootstrapLog('bootstrap:ready');
  import('./main.mjs').catch((error) => {
    appendBootstrapLog('bootstrap:import-failed', error && error.stack ? error.stack : String(error));
    console.error(error);
    process.exit(1);
  });
});
