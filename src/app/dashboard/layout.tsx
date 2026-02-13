
'use client';

import { CartProvider } from '@/hooks/use-cart';
import { TeamProvider } from '@/hooks/use-team';
import React from 'react';
import DashboardLayoutUI from '@/app/dashboard/DashboardLayoutUI';
import { usePathname } from 'next/navigation';

function DashboardLayoutWithContext({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    // Exclude checkout page from the main dashboard UI
    if (pathname.includes('/checkout')) {
      return <>{children}</>;
    }
    return <DashboardLayoutUI>{children}</DashboardLayoutUI>;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <TeamProvider>
      <CartProvider>
        <DashboardLayoutWithContext>
          {children}
        </DashboardLayoutWithContext>
      </CartProvider>
    </TeamProvider>
  );
}
