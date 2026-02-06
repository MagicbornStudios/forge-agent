'use client';

import { AppShell } from '@/components/AppShell';
import { AppProviders } from '@/components/AppProviders';
export default function Home() {
  return (
    <AppProviders copilotDefaultOpen>
      <AppShell />
    </AppProviders>
  );
}
