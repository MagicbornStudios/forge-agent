'use client';

import * as React from 'react';
import { Badge } from '@forge/ui/badge';
import { Button } from '@forge/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@forge/ui/card';
import { Input } from '@forge/ui/input';
import { useRepoSettings } from '@/components/settings/RepoSettingsProvider';

export function PlatformConnectionCard() {
  const settings = useRepoSettings();
  const [token, setToken] = React.useState('');
  const connected = settings.platformStatus?.connected === true;
  const capabilities = settings.platformStatus?.capabilities || {
    connect: false,
    read: false,
    write: false,
  };

  const connect = async () => {
    await settings.onPlatformConnect({
      baseUrl: settings.platformBaseUrl,
      token,
    });
    setToken('');
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm">Platform Connection</CardTitle>
          <Badge variant={connected ? 'outline' : 'secondary'}>
            {connected ? 'connected' : 'disconnected'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <label className="block space-y-1">
          <span className="text-muted-foreground">Base URL</span>
          <Input
            value={settings.platformBaseUrl}
            onChange={(event) => settings.setFieldValue('platform.baseUrl', event.target.value)}
            placeholder="https://studio.example.com"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-muted-foreground">API Key</span>
          <Input
            type="password"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="fga_..."
          />
        </label>

        <div className="flex flex-wrap items-center gap-2 text-[10px]">
          <Badge variant={capabilities.connect ? 'outline' : 'secondary'}>
            connect {capabilities.connect ? 'yes' : 'no'}
          </Badge>
          <Badge variant={capabilities.read ? 'outline' : 'secondary'}>
            read {capabilities.read ? 'yes' : 'no'}
          </Badge>
          <Badge variant={capabilities.write ? 'outline' : 'secondary'}>
            write {capabilities.write ? 'yes' : 'no'}
          </Badge>
          <span className="text-muted-foreground">
            provider: {settings.platformStatus?.provider || 'memory'}
          </span>
        </div>

        {settings.platformStatus?.message ? (
          <p className="text-[11px] text-muted-foreground">{settings.platformStatus.message}</p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={connect}
            disabled={settings.platformBusy || !settings.platformBaseUrl || !token}
          >
            Connect
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => settings.onPlatformValidate()}
            disabled={settings.platformBusy || !settings.platformBaseUrl}
          >
            Validate
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => settings.onPlatformDisconnect()}
            disabled={settings.platformBusy || !connected}
          >
            Disconnect
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
