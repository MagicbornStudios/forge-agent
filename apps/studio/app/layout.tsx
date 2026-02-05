import type { Metadata } from 'next';
import './globals.css';
import { AppThemeProvider } from '@/components/providers/AppThemeProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { SettingsHydration } from '@/components/settings/SettingsHydration';
import { EntitlementsProvider } from '@/components/providers/EntitlementsProvider';
import { AppShellPersistGate } from '@/components/persistence/AppShellPersistGate';
import { DirtyBeforeUnload } from '@/components/persistence/DirtyBeforeUnload';

export const metadata: Metadata = {
  title: 'Forge Agent PoC',
  description: 'AI-powered React Flow graph editor',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark-fantasy">
      <body>
        <AppThemeProvider>
          <QueryProvider>
            <SettingsHydration />
            <AppShellPersistGate>
              <DirtyBeforeUnload />
              <EntitlementsProvider>{children}</EntitlementsProvider>
            </AppShellPersistGate>
          </QueryProvider>
        </AppThemeProvider>
      </body>
    </html>
  );
}
