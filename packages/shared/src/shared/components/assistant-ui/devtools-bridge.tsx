'use client';

import { useEffect } from 'react';
import { DevToolsProviderApi, useAui } from '@assistant-ui/react';

export function AssistantDevToolsBridge() {
  const aui = useAui();

  useEffect(() => {
    if (!aui) return;
    return DevToolsProviderApi.register(aui);
  }, [aui]);

  return null;
}
