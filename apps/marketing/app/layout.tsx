import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Forge',
  description: 'AI-encapsulated editors for professional apps',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark-fantasy">
      <body>{children}</body>
    </html>
  );
}
