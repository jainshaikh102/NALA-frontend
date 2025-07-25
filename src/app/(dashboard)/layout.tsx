"use client";
import { ReactNode, useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { RouteGuard } from "@/components/auth/route-guard";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuClick = () => {
    setSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <RouteGuard requireAuth={true}>
      <div className="min-h-screen bg-secondary">
        {/* Mobile Overlay - Only show when sidebar is open on mobile */}
        {sidebarOpen && (
          <div
            className="block lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={handleSidebarClose}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <div
          className={`
            fixed top-0 left-0 h-full w-24 lg:w-24 bg-background z-50 lg:z-auto
            transform transition-transform duration-300 ease-in-out
            ${
              sidebarOpen
                ? "translate-x-0"
                : "-translate-x-full lg:translate-x-0"
            }
          `}
        >
          <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
        </div>

        {/* Main Content */}
        <main className="lg:ml-24 min-h-screen relative">
          {/* Mobile Menu Button - Hide when sidebar is open */}
          <div
            className={`lg:hidden fixed top-4 left-4 z-50 transition-opacity duration-300 ${
              sidebarOpen ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            <Button
              variant="outline"
              size="icon"
              onClick={handleMenuClick}
              className="bg-background border-border hover:bg-background/80"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>

          {/* Content with proper spacing for mobile menu button */}
          <div className="pt-16 lg:pt-0">{children}</div>
        </main>
      </div>
    </RouteGuard>
  );
}
