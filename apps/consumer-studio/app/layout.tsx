import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Forge Consumer Studio',
  description: 'Chat-first consumer studio built only with @forge/dev-kit.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

