'use client';

import { StudioRoot } from '@/components/StudioRoot';
import { AppProviders } from '@/components/AppProviders';
export default function Home() {
  return (
    <AppProviders copilotDefaultOpen>
      <StudioRoot />
    </AppProviders>
  );
}
