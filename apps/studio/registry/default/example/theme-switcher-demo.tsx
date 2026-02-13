'use client';

import { ThemeSwitcher } from '@/components/app-bar/ThemeSwitcher';

/** Theme and density selector. Uses app settings store; persist may fail in docs (no backend). */
export function ThemeSwitcherDemo() {
  return (
    <div className="flex items-center gap-2">
      <ThemeSwitcher />
      <span className="text-xs text-muted-foreground">Click to change theme and density</span>
    </div>
  );
}

export default ThemeSwitcherDemo;
