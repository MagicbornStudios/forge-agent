import type { Metadata } from 'next';
import './globals.css';
import { AppThemeProvider } from '@/components/providers/AppThemeProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { SettingsHydration } from '@/components/settings/SettingsHydration';

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
            {children}
          </QueryProvider>
        </AppThemeProvider>
      </body>
    </html>
  );
}
