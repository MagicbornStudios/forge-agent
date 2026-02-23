'use client';

import * as React from 'react';
import type { RepoAuthStatusResponse } from '@/lib/api/types';
import { toErrorMessage } from '@/lib/api/http';
import {
  fetchRepoAuthStatus,
  connectRepoAuth,
  disconnectRepoAuth,
  validateRepoAuth,
} from '@/lib/api/services';

export function usePlatformAuth(
  setCommandOutput: (value: string | ((prev: string) => string)) => void,
  persistLocalSettings: (settings: Record<string, unknown>) => Promise<void>,
) {
  const [platformBaseUrl, setPlatformBaseUrl] = React.useState('');
  const [platformAutoValidate, setPlatformAutoValidate] = React.useState(true);
  const [platformStatus, setPlatformStatus] = React.useState<RepoAuthStatusResponse | null>(null);
  const [platformBusy, setPlatformBusy] = React.useState(false);

  const persistPlatformMetadata = React.useCallback(
    (payload: RepoAuthStatusResponse, fallbackBaseUrl = '') => {
      const lastStatus = payload.connected
        ? (payload.ok === true ? 'connected' : 'error')
        : 'disconnected';
      persistLocalSettings({
        platform: {
          baseUrl: payload.baseUrl || fallbackBaseUrl || platformBaseUrl,
          autoValidate: platformAutoValidate,
          lastStatus,
          lastValidatedAt: payload.lastValidatedAt || '',
        },
      }).catch(() => {});
    },
    [persistLocalSettings, platformAutoValidate, platformBaseUrl],
  );

  const refreshPlatformStatus = React.useCallback(async () => {
    const payload = await fetchRepoAuthStatus();
    setPlatformStatus(payload);
    if (!platformBaseUrl && payload.baseUrl) {
      setPlatformBaseUrl(payload.baseUrl);
    }
  }, [platformBaseUrl]);

  const updatePlatformBaseUrl = React.useCallback(
    (value: string) => {
      setPlatformBaseUrl(value);
      persistLocalSettings({
        platform: {
          baseUrl: value,
          autoValidate: platformAutoValidate,
        },
      }).catch(() => {});
    },
    [persistLocalSettings, platformAutoValidate],
  );

  const updatePlatformAutoValidate = React.useCallback(
    (value: boolean) => {
      setPlatformAutoValidate(value);
      persistLocalSettings({
        platform: {
          baseUrl: platformBaseUrl,
          autoValidate: value,
        },
      }).catch(() => {});
    },
    [persistLocalSettings, platformBaseUrl],
  );

  const connectPlatform = React.useCallback(
    async (input: { baseUrl: string; token: string }) => {
      setPlatformBusy(true);
      try {
        const payload = await connectRepoAuth({
          baseUrl: input.baseUrl,
          token: input.token,
        });
        setPlatformStatus(payload);
        if (payload.baseUrl) setPlatformBaseUrl(payload.baseUrl);
        persistPlatformMetadata(payload, input.baseUrl);
        if (platformAutoValidate && payload.ok) {
          const next = await validateRepoAuth();
          setPlatformStatus(next);
          persistPlatformMetadata(next, payload.baseUrl || input.baseUrl);
        }
        setCommandOutput(payload.message || (payload.ok ? 'Platform connected.' : 'Platform connection failed.'));
      } catch (error) {
        setCommandOutput(toErrorMessage(error, 'Unable to connect platform.'));
      } finally {
        setPlatformBusy(false);
      }
    },
    [persistPlatformMetadata, platformAutoValidate, setCommandOutput],
  );

  const validatePlatform = React.useCallback(
    async (input: { baseUrl?: string; token?: string } = {}) => {
      setPlatformBusy(true);
      try {
        const payload = await validateRepoAuth(input);
        setPlatformStatus(payload);
        if (payload.baseUrl) setPlatformBaseUrl(payload.baseUrl);
        persistPlatformMetadata(payload, input.baseUrl || platformBaseUrl);
        setCommandOutput(
          payload.message ||
            (payload.ok ? 'Platform connection validated.' : 'Platform validation failed.'),
        );
      } catch (error) {
        setCommandOutput(toErrorMessage(error, 'Unable to validate platform connection.'));
      } finally {
        setPlatformBusy(false);
      }
    },
    [persistPlatformMetadata, platformBaseUrl, setCommandOutput],
  );

  const disconnectPlatform = React.useCallback(async () => {
    setPlatformBusy(true);
    try {
      const payload = await disconnectRepoAuth();
      setPlatformStatus(payload);
      persistPlatformMetadata(payload, platformBaseUrl);
      setCommandOutput(payload.message || 'Platform disconnected.');
    } catch (error) {
      setCommandOutput(toErrorMessage(error, 'Unable to disconnect platform connection.'));
    } finally {
      setPlatformBusy(false);
    }
  }, [persistPlatformMetadata, platformBaseUrl, setCommandOutput]);

  return {
    platformBaseUrl,
    setPlatformBaseUrl,
    platformAutoValidate,
    setPlatformAutoValidate,
    platformStatus,
    platformBusy,
    updatePlatformBaseUrl,
    updatePlatformAutoValidate,
    connectPlatform,
    validatePlatform,
    disconnectPlatform,
    refreshPlatformStatus,
  };
}
