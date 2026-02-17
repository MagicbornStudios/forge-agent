export async function createKeytarStore(options = {}) {
  const service = String(options.service || 'forge-repo-studio');
  const account = String(options.account || 'default');

  let keytar = null;
  try {
    const moduleNs = await import('keytar');
    keytar = moduleNs?.default || moduleNs;
  } catch {
    return null;
  }

  if (!keytar || typeof keytar.getPassword !== 'function') {
    return null;
  }

  return {
    name: 'keytar',
    async read() {
      const secret = await keytar.getPassword(service, account);
      return typeof secret === 'string' && secret.length > 0 ? secret : null;
    },
    async write(secret) {
      await keytar.setPassword(service, account, String(secret || ''));
    },
    async clear() {
      await keytar.deletePassword(service, account);
    },
  };
}
