'use client';

import * as UI from '@forge/ui';
import { ShowcaseDemoSurface } from '../../../demos/harnesses';

export function SettingsPanelDemo() {
  return (
    <ShowcaseDemoSurface>
      <UI.Card className="max-w-md">
        <UI.CardHeader>
          <UI.CardTitle>Appearance</UI.CardTitle>
          <UI.CardDescription>Settings panel with simple field controls.</UI.CardDescription>
        </UI.CardHeader>
        <UI.CardContent className="space-y-4">
          <div className="space-y-2">
            <UI.Label htmlFor="settings-theme">Theme</UI.Label>
            <UI.Select defaultValue="dark">
              <UI.SelectTrigger id="settings-theme">
                <UI.SelectValue />
              </UI.SelectTrigger>
              <UI.SelectContent>
                <UI.SelectItem value="dark">Dark</UI.SelectItem>
                <UI.SelectItem value="light">Light</UI.SelectItem>
              </UI.SelectContent>
            </UI.Select>
          </div>
          <label className="flex items-center justify-between text-sm">
            Use compact density
            <UI.Switch defaultChecked />
          </label>
        </UI.CardContent>
      </UI.Card>
    </ShowcaseDemoSurface>
  );
}
