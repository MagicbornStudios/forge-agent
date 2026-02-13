'use client';

import { Label } from '@forge/ui/label';
import { Input } from '@forge/ui/input';

export function LabelDemo() {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="demo-input">Email</Label>
      <Input id="demo-input" type="email" placeholder="name@example.com" />
    </div>
  );
}

export default LabelDemo;
