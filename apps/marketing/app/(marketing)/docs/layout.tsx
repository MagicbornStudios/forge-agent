import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Documentation – Forge',
  description:
    'Forge documentation: editors, AI and Copilot, Yarn Spinner, API reference, and getting started.',
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
