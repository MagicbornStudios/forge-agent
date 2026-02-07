'use client';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AccountSidebar } from '@/components/AccountSidebar';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AccountSidebar />
      <SidebarInset>
        <main className="flex flex-1 flex-col p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
