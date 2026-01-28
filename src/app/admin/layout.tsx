
'use client';

import { useState } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Admin Header */}
      <AdminHeader 
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 border-r bg-background overflow-y-auto">
          <Sidebar onLinkClick={() => setIsSidebarOpen(false)} />
        </aside>

        {/* Mobile Sidebar - Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-30 md:hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsSidebarOpen(false)}
            />
            {/* Sidebar */}
            <aside className="absolute left-0 top-0 bottom-0 w-64 bg-background border-r shadow-lg overflow-y-auto">
              <Sidebar onLinkClick={() => setIsSidebarOpen(false)} />
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
