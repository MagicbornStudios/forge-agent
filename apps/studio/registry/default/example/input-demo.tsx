'use client';

import { Input } from '@forge/ui/input';

export function InputDemo() {
  return (
    <div className="flex flex-col gap-4 max-w-sm">
      <Input placeholder="Enter text..." />
      <Input type="email" placeholder="Email" />
      <Input type="password" placeholder="Password" />
    </div>
  );
}

export default InputDemo;
