import type { Metadata } from 'next';
import './globals.css';
import { AppProviders } from '@forge/shared/components/app';

export const metadata: Metadata = {
  title: 'RepoStudio',
  description: 'RepoOps command center for env and forge loop workflows.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" data-density="compact" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
