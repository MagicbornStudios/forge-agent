import { getPayload } from 'payload';
import payloadConfig from '../../payload.config';

declare global {
  // eslint-disable-next-line no-var
  var __repoStudioPayloadPromise__: Promise<any> | undefined;
}

export async function getRepoStudioPayload() {
  if (!global.__repoStudioPayloadPromise__) {
    global.__repoStudioPayloadPromise__ = getPayload({ config: payloadConfig });
  }
  return global.__repoStudioPayloadPromise__;
}
