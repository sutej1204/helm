import React from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { MobileMenu } from "@/components/ui/mobile-menu";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar for desktop */}
      <Sidebar />
      
      {/* Mobile menu */}
      <MobileMenu />
      
      {/* Main content area */}
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <main className="flex-1 overflow-auto pt-16 md:pt-0">
          <div className="py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
