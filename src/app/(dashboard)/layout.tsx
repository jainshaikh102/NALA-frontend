// app/(dashboard)/layout.tsx (DashboardLayout)
"use client";
import { ReactNode, useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { RouteGuard } from "@/components/auth/route-guard";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import "../globals.css";
import Image from "next/image";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuClick = () => setSidebarOpen(true);
  const handleSidebarClose = () => setSidebarOpen(false);

  return (
    <RouteGuard requireAuth={true}>
      {/* 👇 Hide scrollbars within the dashboard area */}
      <div className="min-h-screen bg-background p-4 rounded-4xl scrollbar-hide">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="block lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={handleSidebarClose}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <div
          className={`fixed top-0 left-0 h-full w-24 lg:w-24 bg-background z-50 lg:z-auto transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
        </div>

        {/* Main Content */}
        <main className="lg:ml-24 min-h-screen relative">
          {/* Mobile Menu Button */}
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

          <div className="pt-0 lg:pt-0">{children}</div>

          <div className="w-full text-end p-4 bg-background items-end justify-end">
            <div className="flex items-center justify-end flex-row space-x-2">
              <span className="text-[16px] text-white">
                2025 &copy; NALA BOT | Powered By Black Lion App
              </span>
              <Image
                alt="Black Lion Logo"
                src="/svgs/Blacklion-Logo.svg"
                width={22.59}
                height={24}
              />
            </div>
          </div>
        </main>
      </div>
    </RouteGuard>
  );
}
