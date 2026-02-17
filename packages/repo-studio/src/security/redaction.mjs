import { redactToken } from './contracts.mjs';

export function redactCredentialForLogs(credential) {
  if (!credential || typeof credential !== 'object') return null;
  return {
    baseUrl: String(credential.baseUrl || ''),
    token: redactToken(credential.token),
  };
}
