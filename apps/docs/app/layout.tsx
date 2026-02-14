import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Forge Docs',
  description: 'Forge documentation site.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground">{children}</body>
    </html>
  );
}
