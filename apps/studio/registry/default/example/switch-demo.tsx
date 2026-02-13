'use client';

import { useState } from 'react';
import { Switch } from '@forge/ui/switch';
import { Label } from '@forge/ui/label';

export function SwitchDemo() {
  const [checked, setChecked] = useState(false);
  return (
    <div className="flex items-center gap-2">
      <Switch id="demo-switch" checked={checked} onCheckedChange={setChecked} />
      <Label htmlFor="demo-switch">{checked ? 'On' : 'Off'}</Label>
    </div>
  );
}

export default SwitchDemo;
