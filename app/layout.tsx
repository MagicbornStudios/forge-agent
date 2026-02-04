import type { Metadata } from 'next';
import './globals.css';
import { AppThemeProvider } from '@/components/providers/AppThemeProvider';

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
        <AppThemeProvider>{children}</AppThemeProvider>
      </body>
    </html>
  );
}
