'use client';

import * as UI from '@forge/ui';
import { ShowcaseDemoSurface } from '../../../demos/harnesses';

export function CardDemo() {
  return (
    <ShowcaseDemoSurface>
      <UI.Card className="max-w-sm">
        <UI.CardHeader>
          <UI.CardTitle>Card title</UI.CardTitle>
          <UI.CardDescription>Reusable content shell.</UI.CardDescription>
        </UI.CardHeader>
        <UI.CardContent>
          <p className="text-sm text-muted-foreground">Main content goes here.</p>
        </UI.CardContent>
      </UI.Card>
    </ShowcaseDemoSurface>
  );
}
