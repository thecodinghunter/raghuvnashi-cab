
'use client';

import Sidebar from '@/components/layout/Sidebar';
import { DriverStatusProvider } from '@/hooks/use-driver-status';

// This layout is a CLIENT component that wraps the driver-side app.
// It is responsible for the main layout structure, including the sidebar
// for desktop and handling the mobile navigation state, which is passed
// from the global AppHeader. It does NOT render the header itself.

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <DriverStatusProvider>
      <div className="flex h-[calc(100vh-4rem)] bg-background">
        {/* Desktop Sidebar: Visible only on medium screens and up */}
        <aside className="hidden md:block w-64 border-r">
          <Sidebar />
        </aside>

        {/* Main content area that takes up the remaining space */}
        <main className="flex-1 overflow-y-auto flex flex-col">
          {children}
        </main>
      </div>
    </DriverStatusProvider>
  );
}
