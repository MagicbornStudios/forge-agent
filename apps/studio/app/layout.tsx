import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppThemeProvider } from '@/components/providers/AppThemeProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { SettingsHydration } from '@/components/settings/SettingsHydration';
import { TwickProviders } from '@/components/providers/TwickProviders';

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

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
    <html lang="en" data-theme="dark-fantasy" data-density="compact" className={fontSans.variable}>
      <body className="font-sans antialiased">
        <TwickProviders>
          <AppThemeProvider>
            <QueryProvider>
              <SettingsHydration />
              {children}
            </QueryProvider>
          </AppThemeProvider>
        </TwickProviders>
      </body>
    </html>
  );
}
