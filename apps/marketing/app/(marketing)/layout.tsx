import { MarketingHeader } from '@/components/MarketingHeader';
import { AuthProvider } from '@/components/AuthProvider';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <MarketingHeader />
        <main className="flex-1">{children}</main>
      </div>
    </AuthProvider>
  );
}
