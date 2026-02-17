export function createMemoryStore() {
  let secret = null;
  return {
    name: 'memory',
    async read() {
      return secret;
    },
    async write(nextSecret) {
      secret = String(nextSecret || '');
    },
    async clear() {
      secret = null;
    },
  };
}
