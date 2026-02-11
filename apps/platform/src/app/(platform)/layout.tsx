import { PlatformHeader } from '@/components/platform/PlatformHeader';

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <PlatformHeader />
      <main className="mx-auto w-full max-w-[1360px] px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
